// src/core/dispersion.ts
// Dispersión óptica — índice de refracción dependiente de longitud de onda.
// Modelos: Cauchy y Sellmeier. Materiales reales con coeficientes tabulados.
//
// Referencia: Schott AG datasheets; Sellmeier para BK7 (Schott 2022).
// λ en nanómetros en la API pública; convertido a μm internamente donde se necesita.

import { refract } from './snell';

// ── Tipos ─────────────────────────────────────────────────────────────────────

/** Materiales ópticos con coeficientes conocidos. */
export type MaterialOptico = 'BK7' | 'corona' | 'agua' | 'diamante' | 'vidrio-F';

// ── Coeficientes Cauchy: n(λ) = A + B/λ² + C/λ⁴  (λ en μm) ─────────────────
// Fuente: aproximaciones estándar de literatura.
const CAUCHY: Record<MaterialOptico, [number, number, number]> = {
  // [A, B (μm²), C (μm⁴)]
  'BK7':       [1.5168, 0.004228, 0.000029],
  'corona':    [1.5220, 0.00459,  0.000028],
  'agua':      [1.3230, 0.003180, 0.000000],
  'diamante':  [2.3780, 0.013500, 0.000220],
  'vidrio-F':  [1.6200, 0.008200, 0.000100],
};

// ── Coeficientes Sellmeier: n²(λ) = 1 + Σ Bᵢλ²/(λ²−Cᵢ)  (λ en μm²) ────────
// Fuente: Schott AG (BK7, F); literatura estándar.
interface SellmeierCoefs {
  B: [number, number, number];
  C: [number, number, number]; // μm²
}

const SELLMEIER: Record<MaterialOptico, SellmeierCoefs> = {
  'BK7': {
    B: [1.03961212, 0.231792344, 1.01046945],
    C: [0.00600069867, 0.0200179144, 103.560653],
  },
  'corona': {
    B: [1.08511833, 0.199236334, 0.930054488],
    C: [0.00610130, 0.01995335, 91.21581],
  },
  'agua': {
    B: [0.75831, 0.08495, 0.000000],
    C: [0.00972, 0.02844, 0.000000],
  },
  'diamante': {
    B: [0.3306, 4.3356, 0.00000],
    C: [0.1750 * 0.1750, 0.1060 * 0.1060, 0.00000],
  },
  'vidrio-F': {
    B: [1.34533359, 0.209073176, 0.937357162],
    C: [0.00997743871, 0.0470450767, 111.886764],
  },
};

// ── Funciones públicas ─────────────────────────────────────────────────────────

/**
 * Índice de refracción por ecuación de Cauchy: n = A + B/λ² + C/λ⁴.
 * @param material Material óptico.
 * @param lambdaNm Longitud de onda en nanómetros.
 */
export function nCauchy(material: MaterialOptico, lambdaNm: number): number {
  const [A, B, C] = CAUCHY[material];
  const lam = lambdaNm / 1000; // nm → μm
  return A + B / (lam * lam) + C / (lam * lam * lam * lam);
}

/**
 * Índice de refracción por ecuación de Sellmeier: n² = 1 + Σ Bᵢλ²/(λ²−Cᵢ).
 * @param material Material óptico.
 * @param lambdaNm Longitud de onda en nanómetros.
 */
export function nSellmeier(material: MaterialOptico, lambdaNm: number): number {
  const coefs = SELLMEIER[material];
  const lam2 = (lambdaNm / 1000) ** 2; // λ² en μm²
  let n2 = 1;
  for (let i = 0; i < 3; i++) {
    const Bi = coefs.B[i] ?? 0;
    const Ci = coefs.C[i] ?? 0;
    if (Math.abs(lam2 - Ci) > 1e-12) {
      n2 += (Bi * lam2) / (lam2 - Ci);
    }
  }
  return Math.sqrt(Math.max(1, n2));
}

/**
 * Ángulo de desviación de un prisma triangular simétrico.
 *
 * CONVENCIÓN:
 *   - anguloApice A: ángulo en el vértice del prisma (radianes).
 *   - anguloIncidencia i₁: ángulo de incidencia en la primera cara (radianes, respecto a la normal).
 *   - El rayo entra por la primera cara, emerge por la segunda.
 *   - Desviación D = i₁ + i₂ - A, donde i₂ es el ángulo de salida.
 *
 * Devuelve NaN si hay TIR en alguna cara.
 *
 * @param nLambda         Índice del prisma a la longitud de onda dada.
 * @param anguloApice     Ángulo del ápice A (radianes).
 * @param anguloIncidencia Ángulo de incidencia i₁ (radianes).
 */
export function prismaDesviacion(
  nLambda: number,
  anguloApice: number,
  anguloIncidencia: number
): number {
  // Primera cara: aire → prisma
  const res1 = refract(1.0, nLambda, anguloIncidencia);
  if (res1.tir) return NaN;
  const r1 = res1.theta;

  // Segunda cara: ángulo de incidencia interior = A - r1
  const r2Inc = anguloApice - r1;
  if (r2Inc < 0) return NaN; // geometría inválida

  // Segunda cara: prisma → aire
  const res2 = refract(nLambda, 1.0, r2Inc);
  if (res2.tir) return NaN;
  const i2 = res2.theta;

  return anguloIncidencia + i2 - anguloApice;
}

/**
 * Ángulo de desviación mínima para un prisma.
 * En la desviación mínima: i₁ = i₂ y el rayo pasa simétricamente.
 * D_min = 2*arcsin(n*sin(A/2)) - A.
 *
 * @param nLambda     Índice del prisma.
 * @param anguloApice Ángulo del ápice A (radianes).
 */
export function desviacionMinima(nLambda: number, anguloApice: number): number {
  const sinVal = nLambda * Math.sin(anguloApice / 2);
  if (sinVal > 1) return NaN; // TIR total
  return 2 * Math.asin(sinVal) - anguloApice;
}

/**
 * Traza un rayo de longitud de onda `lambdaNm` a través de un prisma triangular.
 * El prisma tiene vértice en el origen; primera cara vertical en x=0;
 * segunda cara inclinada a ángulo A respecto a la primera.
 *
 * Devuelve los puntos de entrada, salida y el ángulo de desviación.
 * Devuelve null si hay TIR.
 *
 * @param lambdaNm        Longitud de onda (nm).
 * @param material        Material del prisma.
 * @param anguloApice     Ángulo A del ápice (radianes).
 * @param anguloIncidencia Ángulo de incidencia i₁ en la primera cara (radianes).
 */
export function trazarPrisma(
  lambdaNm: number,
  material: MaterialOptico,
  anguloApice: number,
  anguloIncidencia: number
): { entrada: { x: number; y: number }; salida: { x: number; y: number }; desviacion: number } | null {
  const n = nSellmeier(material, lambdaNm);
  const D = prismaDesviacion(n, anguloApice, anguloIncidencia);
  if (isNaN(D)) return null;

  // Posición de entrada: primera cara a x=0, y=0 (simplificado)
  const entrada = { x: 0, y: 0 };

  // Posición de salida: estimada con geometría del prisma
  // Anchura del prisma estimada: base = 2*h*tan(A/2) donde h=1 (unitario)
  const h = 0.1; // altura del rayo dentro del prisma
  const salida = {
    x: h * Math.cos(anguloApice),
    y: h * Math.sin(anguloApice),
  };

  return { entrada, salida, desviacion: D };
}
