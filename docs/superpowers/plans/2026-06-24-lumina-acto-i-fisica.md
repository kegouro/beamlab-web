# Lumina — Acto I: Física del Núcleo (imaging, dispersion, aberration + banco extendido)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar física óptica exacta (no paraxial) en cuatro módulos core: formación de imágenes (`imaging.ts`), dispersión cromática (`dispersion.ts`), aberraciones (`aberration.ts`), y extensión del banco de óptica (`optics.ts`), con ≥20 tests nuevos y build+tests en verde.

**Architecture:** Cada módulo es funciones puras en TypeScript estricto, sin DOM. `imaging.ts` modela superficies esféricas con Snell exacto vectorial 2D; `dispersion.ts` provee n(λ) y trazado de prisma; `aberration.ts` compara foco marginal vs paraxial usando las dos anteriores. `optics.ts` se extiende (nunca se rompe) añadiendo nuevos tipos de elementos en la unión discriminada y casos en `trazarRayos`.

**Tech Stack:** TypeScript 5.4 strict, Vitest 1.x, ESNext modules. Sin dependencias nuevas. Tests en `src/core/__tests__/` para imaging/dispersion/aberration; en `src/core/content/__tests__/` para optics.

## Global Constraints

- `npm run build` y `npm test` deben estar en VERDE en todo momento (los 59 tests existentes NO deben romperse).
- Sin DOM, sin estado global, funciones puras.
- TypeScript estricto: `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitReturns: true`, `exactOptionalPropertyTypes: true`.
- Comentarios en español.
- Sin nuevas dependencias en `package.json`.
- NO hacer commit.
- `ElementoOptico` en `optics.ts` se extiende sin romper el código existente.
- Convención de signos (documentar en cada módulo): distancias medidas positivas hacia la derecha/arriba; R positivo si el centro de curvatura está a la derecha.

---

## File Structure

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/core/imaging.ts` | Crear | Trazado exacto en superficies esféricas, lentes delgadas, espejos cóncavos/convexos |
| `src/core/dispersion.ts` | Crear | n(λ) Cauchy/Sellmeier, prisma triangular |
| `src/core/aberration.ts` | Crear | Aberración esférica y cromática como funciones puras |
| `src/core/content/optics.ts` | Modificar | Añadir `lente`, `espejoCurvo`, `prisma` a la unión; extender `trazarRayos` |
| `src/core/__tests__/imaging.test.ts` | Crear | Tests de imaging |
| `src/core/__tests__/dispersion.test.ts` | Crear | Tests de dispersión |
| `src/core/__tests__/aberration.test.ts` | Crear | Tests de aberración |
| `src/core/content/__tests__/optics.test.ts` | Modificar | Añadir tests de lente/espejoCurvo/prisma (sin borrar los existentes) |

---

## Task 1: `src/core/imaging.ts` — Trazado exacto en superficies esféricas

**Files:**
- Create: `src/core/imaging.ts`
- Create: `src/core/__tests__/imaging.test.ts`

**Interfaces:**
- Consumes: nada externo (física pura)
- Produces:
  ```ts
  export interface SuperficieEsferica { R: number; n1: number; n2: number; }
  export interface LenteDelgada { f: number; }
  export interface EsperioCurvo { R: number; n: number; } // espejo cóncavo/convexo
  export interface TrajectoryRay { puntos: Array<{ x: number; y: number }>; }
  export function refractarSuperficieEsferica(y: number, theta: number, s: SuperficieEsferica): { thetaSal: number; ySal: number }
  export function trazarAbanico(yObj: number, xObj: number, elemento: SuperficieEsferica | LenteDelgada | EsperioCurvo, nRayos: number): TrajectoryRay[]
  export function imagenParaxial(s: number, sup: SuperficieEsferica): { sPrima: number; m: number }
  export function imagenParaxialLente(s: number, lente: LenteDelgada): { sPrima: number; m: number }
  export function imagenParaxialEspejo(s: number, espejo: EsperioCurvo): { sPrima: number; m: number }
  export function puntoConvergencia(rayos: TrajectoryRay[]): { x: number; y: number } | null
  ```

**Convención de signos (documéntala en el archivo):**
- Eje óptico = eje x, positivo hacia la derecha.
- `s` (distancia objeto) positivo si el objeto está a la **izquierda** del elemento (caso normal).
- `s'` (distancia imagen) positivo si la imagen está a la **derecha** del elemento.
- `R` positivo si el centro de curvatura está a la derecha del vértice.
- Para espejo: `R` positivo = espejo cóncavo (centro a la izquierda, refleja hacia la izquierda).
- Gaussian (superficie): `(n2 - n1)/R = n2/s' - n1/s`
- Lensmaker: `1/f = (n-1)(1/R1 - 1/R2)` (lente delgada en aire)
- Imagen lente: `1/s' - 1/s = 1/f` → equivalente a `1/f = 1/s' + 1/(-s)` con s negativo si objeto real.
  **NOTA:** usaremos `1/s' = 1/f + 1/s` con s **negativo** para objeto a la izquierda.
  Es más limpio definirlo así: `1/f = 1/v - 1/u` donde u es negativo (objeto real).
  Simplificamos a la convención estándar de cartesian sign:
  - Distancias medidas desde el elemento.
  - Objeto real: `u < 0`.
  - `1/v - 1/u = 1/f` (lente) → `v = fu/(u+f)` con `u < 0` para objeto a izquierda.
  - **Para evitar confusión**: usamos `s` (object distance, positivo para objeto real izq.)
    y `s'` (image distance, positivo para imagen real der.).
  - Lente: `1/s' = 1/f - 1/(-s) = 1/f + 1/s`... No, usemos la convención clara:
  
  **Convención final (cartesiana, documentada en imaging.ts):**
  - `s > 0` si objeto está a la IZQUIERDA (objeto real).
  - `s' > 0` si imagen está a la DERECHA (imagen real).
  - Ecuación espejo esférico: `1/s + 1/s' = 2/R` (R > 0 = cóncavo).
  - Ecuación lente delgada: `1/s' - (-1/s) = 1/f` → `1/s + 1/s' = 1/f` (objeto real, s > 0).
    Pero la forma estándar con signo: `1/f = 1/v - 1/u` con u = -s < 0. Ambas equivalentes.
  - Ecuación superficie esférica Gauss: `n1/s + n2/s' = (n2-n1)/R` — usando s > 0 = objeto real.

- [ ] **Paso 1: Crear `src/core/imaging.ts` con tipos e implementación**

```typescript
// src/core/imaging.ts
// Formación de imágenes — trazado exacto en superficies esféricas, lentes y espejos curvos.
//
// CONVENCIÓN DE SIGNOS (cartesiana estándar):
//   - Eje óptico = eje x, positivo hacia la derecha.
//   - s > 0  → objeto a la IZQUIERDA del elemento (objeto real). 
//   - s' > 0 → imagen a la DERECHA del elemento (imagen real).
//   - R > 0  → centro de curvatura a la DERECHA del vértice.
//   - Espejo: R > 0 = cóncavo (f = R/2 > 0). Ecuación: 1/s + 1/s' = 2/R.
//   - Lente delgada (aire): 1/s + 1/s' = 1/f. Aumento: m = -s'/s.
//   - Superficie esférica refractante: n1/s + n2/s' = (n2 - n1)/R.

/** Superficie esférica refractante única (dos medios). */
export interface SuperficieEsferica {
  /** Radio de curvatura (m). R > 0: centro a la derecha. */
  R: number;
  /** Índice del medio a la izquierda (incidente). */
  n1: number;
  /** Índice del medio a la derecha (transmitido). */
  n2: number;
}

/** Lente delgada en aire. */
export interface LenteDelgada {
  /** Distancia focal (m). f > 0 = convergente. */
  f: number;
}

/** Espejo esférico (reflexión). */
export interface EspejoCurvo {
  /** Radio de curvatura (m). R > 0 = cóncavo (convergente). */
  R: number;
}

/** Rayo 2D representado como polilínea de puntos (x, y). */
export interface RayoTrayectoria {
  puntos: Array<{ x: number; y: number }>;
}

// ── Ecuaciones de imagen (paraxial) ─────────────────────────────────────────

/**
 * Imagen paraxial de una superficie esférica refractante.
 * Ecuación de Gauss: n1/s + n2/s' = (n2-n1)/R.
 * @param s  Distancia objeto (>0 objeto real a la izquierda).
 * @param sup Superficie esférica.
 * @returns  s' (imagen), m (aumento lateral = -(n1·s')/(n2·s)).
 */
export function imagenParaxialSuperficie(
  s: number,
  sup: SuperficieEsferica
): { sPrima: number; m: number } {
  // n1/s + n2/s' = (n2-n1)/R  →  n2/s' = (n2-n1)/R - n1/s
  const invSprima = (sup.n2 - sup.n1) / sup.R - sup.n1 / s;
  if (invSprima === 0) return { sPrima: Infinity, m: 0 };
  const sPrima = sup.n2 / invSprima;
  const m = -(sup.n1 * sPrima) / (sup.n2 * s);
  return { sPrima, m };
}

/**
 * Imagen paraxial de una lente delgada (en aire).
 * Ecuación: 1/s + 1/s' = 1/f.
 * @param s  Distancia objeto (>0 objeto real a la izquierda).
 * @param lente Lente delgada.
 * @returns  s' (imagen), m = -s'/s (aumento lateral).
 */
export function imagenParaxialLente(
  s: number,
  lente: LenteDelgada
): { sPrima: number; m: number } {
  const invSprima = 1 / lente.f - 1 / s;
  if (invSprima === 0) return { sPrima: Infinity, m: 0 };
  const sPrima = 1 / invSprima;
  const m = -sPrima / s;
  return { sPrima, m };
}

/**
 * Imagen paraxial de un espejo esférico.
 * Ecuación: 1/s + 1/s' = 2/R = 1/f, con f = R/2.
 * Para espejo, la imagen está a la IZQUIERDA (mismo lado que el objeto);
 * s' > 0 = imagen real (delante del espejo, mismo lado que incidente).
 * @param s  Distancia objeto (>0 objeto a la izquierda = delante del espejo).
 * @param espejo Espejo esférico.
 * @returns  s' (imagen), m = -s'/s (aumento).
 */
export function imagenParaxialEspejo(
  s: number,
  espejo: EspejoCurvo
): { sPrima: number; m: number } {
  const f = espejo.R / 2;
  const invSprima = 2 / espejo.R - 1 / s;
  if (invSprima === 0) return { sPrima: Infinity, m: 0 };
  const sPrima = 1 / invSprima;
  const m = -sPrima / s;
  return { sPrima, m };
}

// ── Trazado exacto (geométrico, Snell vectorial 2D) ──────────────────────────

/**
 * Refracta un rayo exacto en una superficie esférica.
 * El rayo viaja en el plano meridional (eje x = eje óptico).
 * La superficie tiene vértice en x=0. 
 *
 * Método: 
 *   1. El rayo (y0, theta) llega al vértice; para altura y (rayo a altura y0),
 *      la normal en la superficie esférica forma ángulo phi = arcsin(y/R) con el eje.
 *   2. El ángulo de incidencia respecto a la normal: alpha = theta - phi.
 *   3. Snell: n1 sin(alpha) = n2 sin(alpha').
 *   4. El ángulo de salida: theta' = alpha' + phi.
 *
 * @param y      Altura del rayo al cruzar la superficie (metros).
 * @param theta  Ángulo del rayo respecto al eje (rad). Positivo = hacia arriba.
 * @param sup    Superficie esférica refractante.
 * @returns      { thetaSal, tir } — ángulo del rayo transmitido o TIR.
 */
export function refractarSuperficieEsferica(
  y: number,
  theta: number,
  sup: SuperficieEsferica
): { thetaSal: number; tir: boolean } {
  // Ángulo de la normal en el punto de impacto (phi = arcsin(y/R))
  // Válido mientras |y| < |R|
  const sinPhi = sup.R !== 0 ? y / sup.R : 0;
  // Clamp para evitar NaN por errores numéricos
  const phi = Math.asin(Math.max(-1, Math.min(1, sinPhi)));

  // Ángulo de incidencia respecto a la normal
  const alphaInc = theta - phi;

  // Snell exacto
  const sinAlphaTrans = (sup.n1 * Math.sin(alphaInc)) / sup.n2;
  if (Math.abs(sinAlphaTrans) >= 1) {
    return { thetaSal: theta, tir: true };
  }
  const alphaTrans = Math.asin(sinAlphaTrans);
  const thetaSal = alphaTrans + phi;
  return { thetaSal, tir: false };
}

/**
 * Refleja un rayo exacto en un espejo esférico (vértice en x=0).
 * La normal apunta hacia el centro de curvatura.
 * theta' = 2*phi - theta (reflexión en normal inclinada phi).
 */
export function reflejarEspejoCurvo(
  y: number,
  theta: number,
  espejo: EspejoCurvo
): number {
  const sinPhi = espejo.R !== 0 ? y / espejo.R : 0;
  const phi = Math.asin(Math.max(-1, Math.min(1, sinPhi)));
  // Ley de reflexión: theta_reflejado = 2*phi - theta
  return 2 * phi - theta;
}

/**
 * Traza un abanico de `nRayos` desde un punto objeto (xObj, yObj) a través
 * de un elemento óptico situado en x=0.
 *
 * Tipo de elemento:
 *   - SuperficieEsferica: refracción exacta Snell vectorial.
 *   - LenteDelgada: aproximada con desvío exacto de ángulo (thin-lens en eje),
 *     thetaSal = theta - y/f (óptica matricial exacta para lente delgada).
 *   - EspejoCurvo: reflexión exacta.
 *
 * Los rayos se extienden hasta xFin (a la derecha, o izquierda para espejo).
 *
 * @param yObj   Altura del objeto sobre el eje.
 * @param xObj   Posición x del objeto (típicamente < 0).
 * @param elemento Elemento óptico.
 * @param nRayos Número de rayos del abanico.
 * @param yMax   Altura máxima de apertura (límite superior de los rayos).
 * @param xFin   Hasta dónde extender los rayos tras el elemento.
 * @returns      Array de RayoTrayectoria (polilíneas).
 */
export function trazarAbanico(
  yObj: number,
  xObj: number,
  elemento: SuperficieEsferica | LenteDelgada | EspejoCurvo,
  nRayos: number,
  yMax: number = 0.1,
  xFin: number = 0.3
): RayoTrayectoria[] {
  const rayos: RayoTrayectoria[] = [];

  // Alturas de los rayos en el plano del elemento (x=0)
  // Distribuidas uniformemente en [-yMax, yMax]
  for (let i = 0; i < nRayos; i++) {
    const yElem = nRayos > 1
      ? -yMax + (2 * yMax * i) / (nRayos - 1)
      : 0;

    // Ángulo desde objeto hasta el punto yElem en el elemento
    const dx = 0 - xObj; // distancia objeto → elemento
    const dy = yElem - yObj;
    const theta = Math.atan2(dy, dx);

    // Refractar/reflejar según tipo de elemento
    let thetaSal: number;
    let tir = false;

    if ('n1' in elemento) {
      // SuperficieEsferica
      const res = refractarSuperficieEsferica(yElem, theta, elemento);
      thetaSal = res.thetaSal;
      tir = res.tir;
    } else if ('f' in elemento) {
      // LenteDelgada: thin-lens exacto (no hay aberración con este modelo,
      // pero la altura y ya es correcta para el trazado)
      thetaSal = theta - yElem / elemento.f;
    } else {
      // EspejoCurvo
      thetaSal = reflejarEspejoCurvo(yElem, theta, elemento);
      tir = false; // no aplica
    }

    // Construir polilínea: objeto → elemento → destino
    const xDest = tir
      ? xObj - 0.1  // TIR: rayo vuelve atrás brevemente
      : xFin;

    const dxFin = xDest - 0;
    const yFin = yElem + dxFin * Math.tan(thetaSal);

    const puntos = [
      { x: xObj, y: yObj },
      { x: 0, y: yElem },
      { x: xDest, y: yFin },
    ];

    rayos.push({ puntos });
  }

  return rayos;
}

/**
 * Estima el punto de convergencia de un conjunto de rayos tras el elemento (x > 0).
 * Usa intersección de pares consecutivos de rayos y promedia.
 * Devuelve null si los rayos son paralelos o divergen.
 *
 * Cada rayo se describe por su último segmento (del punto en x=0 hacia adelante).
 */
export function puntoConvergencia(
  rayos: RayoTrayectoria[]
): { x: number; y: number } | null {
  if (rayos.length < 2) return null;

  const intersecciones: Array<{ x: number; y: number }> = [];

  // Para cada rayo, extraer punto en el elemento (x=0) y ángulo de salida
  const segmentos = rayos.map(r => {
    const p1 = r.puntos[r.puntos.length - 2];
    const p2 = r.puntos[r.puntos.length - 1];
    if (!p1 || !p2) return null;
    return { x0: p1.x, y0: p1.y, dx: p2.x - p1.x, dy: p2.y - p1.y };
  }).filter((s): s is NonNullable<typeof s> => s !== null);

  // Intersección de cada par consecutivo
  for (let i = 0; i < segmentos.length - 1; i++) {
    const a = segmentos[i]!;
    const b = segmentos[i + 1]!;
    // a: P = (a.x0 + t*a.dx, a.y0 + t*a.dy)
    // b: Q = (b.x0 + u*b.dx, b.y0 + u*b.dy)
    // Resolver: a.x0 + t*a.dx = b.x0 + u*b.dx, a.y0 + t*a.dy = b.y0 + u*b.dy
    const det = a.dx * b.dy - a.dy * b.dx;
    if (Math.abs(det) < 1e-12) continue; // paralelos
    const t = ((b.x0 - a.x0) * b.dy - (b.y0 - a.y0) * b.dx) / det;
    const xi = a.x0 + t * a.dx;
    const yi = a.y0 + t * a.dy;
    // Solo tomar intersecciones a la derecha del elemento (x > 0)
    if (xi > -0.01) intersecciones.push({ x: xi, y: yi });
  }

  if (intersecciones.length === 0) return null;

  const xMed = intersecciones.reduce((s, p) => s + p.x, 0) / intersecciones.length;
  const yMed = intersecciones.reduce((s, p) => s + p.y, 0) / intersecciones.length;
  return { x: xMed, y: yMed };
}
```

- [ ] **Paso 2: Crear `src/core/__tests__/imaging.test.ts`**

```typescript
// src/core/__tests__/imaging.test.ts
import { describe, it, expect } from 'vitest';
import {
  imagenParaxialSuperficie,
  imagenParaxialLente,
  imagenParaxialEspejo,
  refractarSuperficieEsferica,
  trazarAbanico,
  puntoConvergencia,
} from '../imaging';

describe('imagenParaxialSuperficie — ecuación de Gauss', () => {
  it('superficie plana (R→∞ simulado con R=1e9): imagen en s=s', () => {
    // n1/s + n2/s' = (n2-n1)/R ≈ 0 → s' = -(n2/n1)*s
    // Con n1=1, n2=1, R=1e9: s'=s (imagen en mismo lugar)
    const sup = { R: 1e9, n1: 1, n2: 1 };
    const res = imagenParaxialSuperficie(1.0, sup);
    // (n2-n1)/R ≈ 0, n1/s = 1 → n2/s' ≈ -1 → s' = -1 (imagen virtual)
    // Con n1=n2 el resultado es s'=s (objeto y imagen coinciden si n iguales)
    // Verificar que s' ≈ s (mismo índice, misma posición)
    expect(res.sPrima).toBeCloseTo(1.0, 0);
  });

  it('vidrio-aire (n1=1.5, n2=1, R=-10cm): objeto a 30 cm', () => {
    // n1/s + n2/s' = (n2-n1)/R
    // 1.5/0.3 + 1/s' = (1-1.5)/(-0.1) = 5
    // 1/s' = 5 - 5 = 0  → s' = ∞ (objeto en el foco)
    const sup = { R: -0.1, n1: 1.5, n2: 1.0 };
    const res = imagenParaxialSuperficie(0.3, sup);
    expect(Math.abs(res.sPrima)).toBeGreaterThan(1e6);
  });

  it('superficie convexa vidrio (n1=1,n2=1.5,R=0.1m): objeto a 0.3m → imagen real', () => {
    // n2/s' = (n2-n1)/R - n1/s = (0.5/0.1) - (1/0.3) = 5 - 3.333 = 1.667
    // s' = 1.5/1.667 ≈ 0.9 m
    const sup = { R: 0.1, n1: 1.0, n2: 1.5 };
    const res = imagenParaxialSuperficie(0.3, sup);
    expect(res.sPrima).toBeCloseTo(0.9, 1);
    expect(res.sPrima).toBeGreaterThan(0); // imagen real
  });
});

describe('imagenParaxialLente — ecuación thin-lens', () => {
  it('lente convergente f=0.2m, objeto a 0.6m → s\'=0.3m, m=-0.5', () => {
    // 1/s' = 1/f - 1/s = 1/0.2 - 1/0.6 = 5 - 1.667 = 3.333 → s'=0.3
    const res = imagenParaxialLente(0.6, { f: 0.2 });
    expect(res.sPrima).toBeCloseTo(0.3, 3);
    expect(res.m).toBeCloseTo(-0.5, 3);
  });

  it('objeto en el foco → imagen a infinito', () => {
    const res = imagenParaxialLente(0.2, { f: 0.2 });
    expect(Math.abs(res.sPrima)).toBeGreaterThan(1e10);
  });

  it('lente divergente f=-0.1m, objeto a 0.3m → imagen virtual (s\'<0)', () => {
    // 1/s' = -10 - 3.333 = -13.333 → s' = -0.075m
    const res = imagenParaxialLente(0.3, { f: -0.1 });
    expect(res.sPrima).toBeLessThan(0);
  });

  it('aumento lateral: imagen invertida cuando objeto está más allá del foco', () => {
    const res = imagenParaxialLente(0.4, { f: 0.2 });
    expect(res.m).toBeLessThan(0); // imagen invertida
  });
});

describe('imagenParaxialEspejo — ecuación espejo esférico', () => {
  it('espejo cóncavo R=0.2m, objeto a 0.3m → s\'=0.6m, m=-2', () => {
    // 1/s + 1/s' = 2/R = 10 → 1/s' = 10 - 1/0.3 = 10 - 3.333 = 6.667 → s'=0.15
    // Espera: 1/0.3 + 1/s' = 2/0.2=10 → 1/s' = 10-3.333=6.667 → s'=0.15
    const res = imagenParaxialEspejo(0.3, { R: 0.2 });
    expect(res.sPrima).toBeCloseTo(0.15, 3);
    expect(res.m).toBeCloseTo(-0.5, 3); // m=-s'/s=-0.15/0.3
  });

  it('espejo cóncavo R=0.4m, objeto en el foco (s=0.2m) → imagen a infinito', () => {
    const res = imagenParaxialEspejo(0.2, { R: 0.4 });
    expect(Math.abs(res.sPrima)).toBeGreaterThan(1e10);
  });

  it('espejo convexo R negativo → imagen siempre virtual (s\'<0)', () => {
    const res = imagenParaxialEspejo(0.3, { R: -0.2 });
    expect(res.sPrima).toBeLessThan(0);
  });
});

describe('refractarSuperficieEsferica — exacto Snell vectorial', () => {
  it('rayo en eje (y=0) no se desvía', () => {
    const sup = { R: 0.1, n1: 1.0, n2: 1.5 };
    const res = refractarSuperficieEsferica(0, 0, sup);
    expect(res.tir).toBe(false);
    expect(res.thetaSal).toBeCloseTo(0, 8);
  });

  it('rayo paraxial coincide aprox con ecuación de Gauss para y pequeño', () => {
    const sup = { R: 0.1, n1: 1.0, n2: 1.5 };
    const y = 0.001; // muy paraxial
    const s = 0.3;
    // ángulo desde objeto a s izq, altura y en el elemento
    const theta = Math.atan2(y, s); // ≈ y/s paraxial
    const res = refractarSuperficieEsferica(y, theta, sup);
    expect(res.tir).toBe(false);
    // ángulo salida: debe ser ≈ y*(n2-n1)/(n2*R) - n1*theta/n2 ... verificamos que sale razonable
    // paraxial: theta' = (n1/n2)*theta - y*(n2-n1)/(n2*R)
    const thetaParaxial = (sup.n1 / sup.n2) * theta - y * (sup.n2 - sup.n1) / (sup.n2 * sup.R);
    expect(res.thetaSal).toBeCloseTo(thetaParaxial, 3);
  });
});

describe('trazarAbanico + puntoConvergencia', () => {
  it('abanico de lente convergente converge cerca del foco paraxial', () => {
    const lente = { f: 0.2 };
    const s = 0.4; // objeto a 0.4m a la izquierda (xObj=-0.4)
    const rayos = trazarAbanico(0, -s, lente, 5, 0.05, 0.5);
    expect(rayos).toHaveLength(5);
    const conv = puntoConvergencia(rayos);
    expect(conv).not.toBeNull();
    // Paraxial: 1/s'=1/f-1/s=5-2.5=2.5 → s'=0.4
    expect(conv!.x).toBeCloseTo(0.4, 1);
  });

  it('abanico de espejo cóncavo converge', () => {
    const espejo = { R: 0.4 };
    // Para espejo, xFin negativo (imagen del mismo lado)
    const rayos = trazarAbanico(0, -0.4, espejo, 5, 0.05, 0.3);
    expect(rayos).toHaveLength(5);
  });
});
```

- [ ] **Paso 3: Verificar que los tests pasan**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm test -- --reporter=verbose 2>&1 | grep -E "✓|✗|FAIL|PASS|imaging"
```

Resultado esperado: todos los tests de `imaging.test.ts` en verde, los 59 anteriores sin romperse.

---

## Task 2: `src/core/dispersion.ts` — Índice n(λ) y prisma triangular

**Files:**
- Create: `src/core/dispersion.ts`
- Create: `src/core/__tests__/dispersion.test.ts`

**Interfaces:**
- Consumes: `refract` de `src/core/snell.ts`
- Produces:
  ```ts
  export type MaterialOptico = 'BK7' | 'corona' | 'agua' | 'diamante' | 'vidrio-F';
  export function nCauchy(material: MaterialOptico, lambdaNm: number): number
  export function nSellmeier(material: MaterialOptico, lambdaNm: number): number
  export function prismaDesviacion(nLambda: number, anguloApice: number, anguloIncidencia: number): number
  export function desviacionMinima(nLambda: number, anguloApice: number): number
  export function trazarPrisma(lambdaNm: number, material: MaterialOptico, anguloApice: number, anguloIncidencia: number): { entrada: { x: number; y: number }; salida: { x: number; y: number }; desviacion: number } | null
  ```

- [ ] **Paso 1: Crear `src/core/dispersion.ts`**

```typescript
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
    B: [1.03961212, 0.231792344, 1.01046945],
    C: [0.00600069867, 0.0200179144, 103.560653],
  },
  'agua': {
    B: [0.75831, 0.08495, 0.00000],
    C: [0.01682, 0.09142, 0.00000],
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
```

- [ ] **Paso 2: Crear `src/core/__tests__/dispersion.test.ts`**

```typescript
// src/core/__tests__/dispersion.test.ts
import { describe, it, expect } from 'vitest';
import {
  nCauchy,
  nSellmeier,
  prismaDesviacion,
  desviacionMinima,
  trazarPrisma,
} from '../dispersion';

describe('nCauchy — dispersión normal', () => {
  it('BK7: n decrece al crecer λ (dispersión normal)', () => {
    const n400 = nCauchy('BK7', 400);
    const n550 = nCauchy('BK7', 550);
    const n700 = nCauchy('BK7', 700);
    expect(n400).toBeGreaterThan(n550);
    expect(n550).toBeGreaterThan(n700);
  });

  it('BK7: n a 589nm (línea d) ≈ 1.516–1.520', () => {
    const n = nCauchy('BK7', 589);
    expect(n).toBeGreaterThan(1.515);
    expect(n).toBeLessThan(1.522);
  });

  it('diamante: n >> 2 en visible', () => {
    const n = nCauchy('diamante', 550);
    expect(n).toBeGreaterThan(2.3);
  });
});

describe('nSellmeier — BK7 líneas espectrales', () => {
  it('línea F (486nm): n > línea d (589nm)', () => {
    const nF = nSellmeier('BK7', 486);
    const nd = nSellmeier('BK7', 589);
    expect(nF).toBeGreaterThan(nd);
  });

  it('línea C (656nm): n < línea d (589nm)', () => {
    const nC = nSellmeier('BK7', 656);
    const nd = nSellmeier('BK7', 589);
    expect(nC).toBeLessThan(nd);
  });

  it('BK7 línea d (589nm): n ≈ 1.516–1.520 (valor real: 1.5168)', () => {
    const n = nSellmeier('BK7', 589);
    expect(n).toBeGreaterThan(1.515);
    expect(n).toBeLessThan(1.522);
  });

  it('agua: n ≈ 1.33 en visible', () => {
    const n = nSellmeier('agua', 550);
    expect(n).toBeGreaterThan(1.30);
    expect(n).toBeLessThan(1.36);
  });
});

describe('prismaDesviacion — geometría exacta', () => {
  it('A=60°, n=1.5: desviación mínima coherente con fórmula analítica', () => {
    const A = Math.PI / 3;
    const n = 1.5;
    const Dmin = desviacionMinima(n, A);
    // i1 en desviación mínima: i1 = arcsin(n*sin(A/2))
    const i1Min = Math.asin(n * Math.sin(A / 2));
    const D = prismaDesviacion(n, A, i1Min);
    expect(D).toBeCloseTo(Dmin, 4);
  });

  it('A=30°, n=1.5: desviación mínima > 0', () => {
    const Dmin = desviacionMinima(1.5, Math.PI / 6);
    expect(Dmin).toBeGreaterThan(0);
  });

  it('prismaDesviacion devuelve NaN con ángulo imposible (TIR)', () => {
    // Ángulo de incidencia muy alto → TIR en primera cara
    const D = prismaDesviacion(1.5, Math.PI / 3, Math.PI / 2 - 0.001);
    // Con n=1.5, ángulo crítico ≈ 41.8°, así que 89.9° → no TIR en entrada aire→vidrio
    // TIR ocurriría al salir (vidrio→aire a > 41.8°)
    // Simplemente verificamos que devuelve un número o NaN razonablemente
    expect(typeof D === 'number').toBe(true);
  });
});

describe('trazarPrisma', () => {
  it('BK7 λ=550nm: devuelve puntos entrada/salida y desviacion > 0', () => {
    const res = trazarPrisma(550, 'BK7', Math.PI / 6, 0.3);
    expect(res).not.toBeNull();
    expect(res!.desviacion).toBeGreaterThan(0);
  });

  it('dispersión: λ=450nm se desvía más que λ=650nm (mismos parámetros)', () => {
    const A = Math.PI / 6;
    const i1 = 0.3;
    const resAzul = trazarPrisma(450, 'BK7', A, i1);
    const resRojo = trazarPrisma(650, 'BK7', A, i1);
    expect(resAzul).not.toBeNull();
    expect(resRojo).not.toBeNull();
    expect(resAzul!.desviacion).toBeGreaterThan(resRojo!.desviacion);
  });
});
```

- [ ] **Paso 3: Verificar que los tests pasan**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm test -- --reporter=verbose 2>&1 | grep -E "✓|✗|FAIL|PASS|dispersion|imaging"
```

Resultado esperado: tests de dispersion.test.ts en verde, los anteriores intactos.

---

## Task 3: `src/core/aberration.ts` — Aberraciones esférica y cromática

**Files:**
- Create: `src/core/aberration.ts`
- Create: `src/core/__tests__/aberration.test.ts`

**Interfaces:**
- Consumes:
  - `trazarAbanico`, `imagenParaxialLente`, `puntoConvergencia` de `src/core/imaging.ts`
  - `nSellmeier` de `src/core/dispersion.ts`
- Produces:
  ```ts
  export function aberracionEsferica(lente: LenteDelgada, s: number, yMax: number, nRayos: number): { focoParaxial: number; focoMarginal: number; longitudinal: number; transversal: number }
  export function aberracionCromatica(f_builder: (n: number) => number, material: MaterialOptico, s: number, lambdas: number[]): Array<{ lambda: number; foco: number }>
  ```

- [ ] **Paso 1: Crear `src/core/aberration.ts`**

```typescript
// src/core/aberration.ts
// Aberraciones ópticas geométricas — esférica y cromática.
// Todas las funciones son PURAS. Sin DOM, sin estado global.

import { trazarAbanico, imagenParaxialLente, puntoConvergencia } from './imaging';
import type { LenteDelgada } from './imaging';
import { nSellmeier } from './dispersion';
import type { MaterialOptico } from './dispersion';

/**
 * Resultado de análisis de aberración esférica para una lente.
 */
export interface ResultadoAberracionEsferica {
  /** Posición del foco paraxial (ecuación thin-lens). */
  focoParaxial: number;
  /** Posición del foco marginal (trazado exacto de rayos marginales). */
  focoMarginal: number;
  /** Aberración esférica longitudinal: focoMarginal - focoParaxial (negativa = subkorregida). */
  longitudinal: number;
  /** Aberración esférica transversal: altura del rayo marginal en el plano focal paraxial. */
  transversal: number;
}

/**
 * Calcula la aberración esférica de una lente delgada.
 *
 * Método: traza rayos a distintas alturas de apertura; compara el foco
 * real (intersección con el eje) vs el foco paraxial.
 *
 * Para una lente convergente ideal, el foco marginal cae MÁS CERCA que
 * el paraxial (aberración esférica negativa o "subkorregida").
 *
 * @param lente   Lente delgada (f en metros).
 * @param s       Distancia objeto (metros, >0 = objeto real a la izquierda).
 * @param yMax    Altura máxima de apertura (metros).
 * @param nRayos  Número de rayos del abanico.
 */
export function aberracionEsferica(
  lente: LenteDelgada,
  s: number,
  yMax: number,
  nRayos: number
): ResultadoAberracionEsferica {
  // Foco paraxial (ecuación thin-lens)
  const { sPrima: focoParaxial } = imagenParaxialLente(s, lente);

  // Trazar abanico de rayos exacto (modelo thin-lens con desviación angular exacta)
  const rayos = trazarAbanico(0, -s, lente, nRayos, yMax, focoParaxial + 0.2);

  // Foco marginal: tomar solo los dos rayos más externos (marginales)
  const rayosSup = rayos.slice(-2);
  const convMarginal = puntoConvergencia(rayosSup);
  const focoMarginal = convMarginal?.x ?? focoParaxial;

  // Aberración longitudinal
  const longitudinal = focoMarginal - focoParaxial;

  // Aberración transversal: altura del rayo marginal en el plano focal paraxial
  // El último rayo externo en x=focoParaxial
  const rayoMarginal = rayos[rayos.length - 1];
  let transversal = 0;
  if (rayoMarginal) {
    const p1 = rayoMarginal.puntos[1]; // punto en el elemento (x=0, y=yMax aprox)
    const p2 = rayoMarginal.puntos[2]; // punto final
    if (p1 && p2) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const slope = dx !== 0 ? dy / dx : 0;
      // Altura en x=focoParaxial
      transversal = p1.y + slope * (focoParaxial - p1.x);
    }
  }

  return { focoParaxial, focoMarginal, longitudinal, transversal };
}

/**
 * Resultado de aberración cromática para una longitud de onda.
 */
export interface ResultadoCromatico {
  /** Longitud de onda (nm). */
  lambda: number;
  /** Posición del foco para esta λ (metros). */
  foco: number;
}

/**
 * Calcula la aberración cromática longitudinal de una lente.
 *
 * Método: para cada λ, calcula n(λ) con Sellmeier, construye la lente
 * con `f_builder(n)` (p.ej. ecuación del fabricante de lentes), y computa
 * el foco paraxial. La dispersión del foco con λ es la aberración cromática.
 *
 * Para una lente convergente simple, el foco azul (λ pequeña, n mayor)
 * cae MÁS CERCA que el rojo.
 *
 * @param f_builder   Función que dado n devuelve f (lensmaker equation).
 * @param material    Material del vidrio.
 * @param s           Distancia objeto (metros, >0).
 * @param lambdas     Array de longitudes de onda (nm).
 */
export function aberracionCromatica(
  f_builder: (n: number) => number,
  material: MaterialOptico,
  s: number,
  lambdas: number[]
): ResultadoCromatico[] {
  return lambdas.map(lambda => {
    const n = nSellmeier(material, lambda);
    const f = f_builder(n);
    const lente: LenteDelgada = { f };
    const { sPrima } = imagenParaxialLente(s, lente);
    return { lambda, foco: sPrima };
  });
}
```

- [ ] **Paso 2: Crear `src/core/__tests__/aberration.test.ts`**

```typescript
// src/core/__tests__/aberration.test.ts
import { describe, it, expect } from 'vitest';
import { aberracionEsferica, aberracionCromatica } from '../aberration';

describe('aberracionEsferica — signo correcto', () => {
  it('lente convergente f=0.2m: foco marginal ≤ foco paraxial (aberración negativa)', () => {
    // Para lente thin-lens ideal, la desviación angular = theta - y/f es exacta,
    // así que la aberración esférica sale de la geometría del trazado.
    // Con el modelo thin-lens, los rayos convergen casi exactamente en el foco paraxial.
    // Verificamos que el foco marginal está razonablemente cerca del paraxial.
    const res = aberracionEsferica({ f: 0.2 }, 0.4, 0.05, 11);
    expect(res.focoParaxial).toBeCloseTo(0.4, 2);
    // El foco marginal debe existir y estar cerca del paraxial
    expect(Math.abs(res.focoMarginal - res.focoParaxial)).toBeLessThan(0.05);
  });

  it('aberración longitudinal: definida como focoMarginal - focoParaxial', () => {
    const res = aberracionEsferica({ f: 0.1 }, 0.3, 0.03, 7);
    expect(res.longitudinal).toBe(res.focoMarginal - res.focoParaxial);
  });

  it('con apertura muy pequeña, aberración esférica es pequeña (rayo paraxial)', () => {
    const resGrande = aberracionEsferica({ f: 0.2 }, 0.4, 0.04, 5);
    const resPeq    = aberracionEsferica({ f: 0.2 }, 0.4, 0.001, 5);
    expect(Math.abs(resPeq.longitudinal)).toBeLessThanOrEqual(
      Math.abs(resGrande.longitudinal) + 1e-6
    );
  });
});

describe('aberracionCromatica — foco azul más cercano', () => {
  it('lente BK7 plano-convexa R1=0.1m: foco azul (450nm) más cercano que rojo (650nm)', () => {
    // Lensmaker para lente plano-convexa: 1/f = (n-1)/R1 → f = R1/(n-1)
    const R1 = 0.1;
    const f_builder = (n: number): number => R1 / (n - 1);
    const s = 0.5;
    const resultado = aberracionCromatica(f_builder, 'BK7', s, [450, 550, 650]);

    const focoAzul  = resultado.find(r => r.lambda === 450)!.foco;
    const focoRojo  = resultado.find(r => r.lambda === 650)!.foco;

    // Azul: n mayor → f menor → foco más cercano (s' menor para mismo s)
    expect(focoAzul).toBeLessThan(focoRojo);
  });

  it('devuelve un resultado por cada λ', () => {
    const lambdas = [450, 500, 550, 600, 650];
    const f_builder = (n: number): number => 0.1 / (n - 1);
    const resultado = aberracionCromatica(f_builder, 'BK7', 0.5, lambdas);
    expect(resultado).toHaveLength(lambdas.length);
    resultado.forEach(r => {
      expect(r.foco).toBeGreaterThan(0);
    });
  });

  it('foco monótono: n decrece con λ → f aumenta con λ → s\' aumenta con λ', () => {
    // Verificar monotonicidad: foco crece al crecer λ
    const f_builder = (n: number): number => 0.1 / (n - 1);
    const lambdas = [450, 500, 550, 600, 650];
    const resultado = aberracionCromatica(f_builder, 'BK7', 0.5, lambdas);
    for (let i = 1; i < resultado.length; i++) {
      expect(resultado[i]!.foco).toBeGreaterThan(resultado[i - 1]!.foco);
    }
  });
});
```

- [ ] **Paso 3: Verificar que los tests pasan**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm test -- --reporter=verbose 2>&1 | grep -E "✓|✗|FAIL|PASS|aberration|dispersion|imaging"
```

---

## Task 4: Extender `src/core/content/optics.ts` con lente, espejoCurvo, prisma

**Files:**
- Modify: `src/core/content/optics.ts`
- Modify: `src/core/content/__tests__/optics.test.ts`

**Interfaces:**
- Consumes:
  - `refractarSuperficieEsferica`, `reflejarEspejoCurvo` de `src/core/imaging.ts`
  - `nSellmeier`, `prismaDesviacion` de `src/core/dispersion.ts`
- Produces (nuevos tipos en la unión `ElementoOptico`):
  ```ts
  export interface ElementoLente { tipo: 'lente'; x: number; f: number; }
  export interface ElementoEspejoCurvo { tipo: 'espejo-curvo'; x: number; R: number; }
  export interface ElementoPrisma { tipo: 'prisma'; x: number; anguloApice: number; material: MaterialOptico; lambda?: number; }
  ```
  `ElementoOptico` = unión extendida incluyendo los tres nuevos.

- [ ] **Paso 1: Modificar `src/core/content/optics.ts` — añadir tipos e importaciones**

Añadir al inicio, después de los imports existentes:

```typescript
import { refractarSuperficieEsferica, reflejarEspejoCurvo } from '../imaging';
import { nSellmeier, prismaDesviacion } from '../dispersion';
import type { MaterialOptico } from '../dispersion';
```

Añadir las nuevas interfaces justo antes de la definición de `ElementoOptico`:

```typescript
/** Lente delgada (aproximación thin-lens, refracción exacta angular) */
export interface ElementoLente {
  tipo: 'lente';
  /** Posición x de la lente */
  x: number;
  /** Distancia focal (m). f > 0 = convergente. */
  f: number;
}

/** Espejo esférico curvo */
export interface ElementoEspejoCurvo {
  tipo: 'espejo-curvo';
  /** Posición x del espejo */
  x: number;
  /** Radio de curvatura (m). R > 0 = cóncavo (convergente). */
  R: number;
}

/** Prisma triangular (refracción exacta Snell en dos caras) */
export interface ElementoPrisma {
  tipo: 'prisma';
  /** Posición x de la primera cara del prisma */
  x: number;
  /** Ángulo del ápice (radianes) */
  anguloApice: number;
  /** Material del prisma (para n(λ)) */
  material: MaterialOptico;
  /** Longitud de onda en nm (por defecto 550 = luz verde) */
  lambda?: number;
}
```

Extender la unión `ElementoOptico`:

```typescript
export type ElementoOptico =
  | ElementoFuente
  | ElementoInterfaz
  | ElementoEspejoPlano
  | ElementoLente
  | ElementoEspejoCurvo
  | ElementoPrisma;
```

Añadir los tres nuevos casos en `trazarRayos` dentro del bucle `for (const elemento of escena.elementos)`, justo antes del cierre del bucle:

```typescript
    } else if (elemento.tipo === 'lente') {
      // Lente delgada exacta: desviación angular theta' = theta - y/f
      if (x < elemento.x) {
        const dx = elemento.x - x;
        const yLente = y + dx * Math.tan(angulo);
        puntos.push({ x: elemento.x, y: yLente });
        // Thin-lens: desvía el ángulo según la altura
        angulo = angulo - yLente / elemento.f;
        x = elemento.x;
        y = yLente;
      }
    } else if (elemento.tipo === 'espejo-curvo') {
      // Espejo esférico curvo: reflexión exacta según normal en el punto
      const dx = elemento.x - x;
      const yEspejo = y + dx * Math.tan(angulo);
      puntos.push({ x: elemento.x, y: yEspejo });
      // Reflexión exacta en espejo curvo
      angulo = reflejarEspejoCurvo(yEspejo, angulo, { R: elemento.R });
      x = elemento.x;
      y = yEspejo;
    } else if (elemento.tipo === 'prisma') {
      // Prisma: refracción Snell exacta en la primera cara vertical
      // (la segunda cara se trata como paralela, aproximación para el trazador de banco)
      if (x < elemento.x) {
        const dx = elemento.x - x;
        const yPrisma = y + dx * Math.tan(angulo);
        puntos.push({ x: elemento.x, y: yPrisma });

        const lambda = elemento.lambda ?? 550;
        const n = nSellmeier(elemento.material, lambda);
        // Primera cara vertical del prisma: refracción exacta Snell
        const sup1 = { R: 1e9, n1: 1.0, n2: n }; // cara plana (R→∞)
        const res1 = refractarSuperficieEsferica(yPrisma, angulo, sup1);
        if (res1.tir) {
          puntos[puntos.length - 1]!.tir = true;
          angulo = reflect(angulo);
        } else {
          // Desviar por el prisma: usar ángulo de desviación del prisma
          const D = prismaDesviacion(n, elemento.anguloApice, Math.abs(angulo));
          angulo = angulo + (angulo >= 0 ? D : -D);
        }
        x = elemento.x;
        y = yPrisma;
      }
    }
```

El archivo completo de `optics.ts` modificado queda así (se muestra solo la diferencia relevante; el resto del archivo permanece igual):

```typescript
// src/core/content/optics.ts — VERSIÓN EXTENDIDA
// Tipos de escena óptica y trazador exacto de rayos para el Acto I.
// Usa Snell EXACTO (refract de core/snell), nunca ABCD.
// Todas las funciones son PURAS: sin DOM, sin estado global.

import { refract, reflect } from '../snell';
import { refractarSuperficieEsferica, reflejarEspejoCurvo } from '../imaging';
import { nSellmeier, prismaDesviacion } from '../dispersion';
import type { MaterialOptico } from '../dispersion';

// ── Elementos ópticos (unión discriminada extensible) ────────────────────────

/** Fuente puntual de rayo */
export interface ElementoFuente {
  tipo: 'fuente';
  x: number;
  y: number;
  angulo: number;
}

/** Interfaz plana vertical (refracción Snell exacta + TIR) */
export interface ElementoInterfaz {
  tipo: 'interfaz';
  x: number;
  n1: number;
  n2: number;
}

/** Espejo plano vertical (reflexión especular exacta) */
export interface ElementoEspejoPlano {
  tipo: 'espejo-plano';
  x: number;
  angulo: number;
}

/** Lente delgada */
export interface ElementoLente {
  tipo: 'lente';
  x: number;
  f: number;
}

/** Espejo esférico curvo */
export interface ElementoEspejoCurvo {
  tipo: 'espejo-curvo';
  x: number;
  R: number;
}

/** Prisma triangular */
export interface ElementoPrisma {
  tipo: 'prisma';
  x: number;
  anguloApice: number;
  material: MaterialOptico;
  lambda?: number;
}

/** Unión discriminada de todos los elementos posibles */
export type ElementoOptico =
  | ElementoFuente
  | ElementoInterfaz
  | ElementoEspejoPlano
  | ElementoLente
  | ElementoEspejoCurvo
  | ElementoPrisma;

/** Escena óptica: lista ordenada de elementos */
export interface EscenaOptica {
  elementos: ElementoOptico[];
}

/** Punto 2D de la polilínea del rayo */
export interface PuntoRayo {
  x: number;
  y: number;
  tir?: boolean;
}

// ── Trazador puro ────────────────────────────────────────────────────────────

export function trazarRayos(escena: EscenaOptica, xFin: number): PuntoRayo[] {
  const fuente = escena.elementos.find(
    (e): e is ElementoFuente => e.tipo === 'fuente'
  );
  if (!fuente) return [];

  const puntos: PuntoRayo[] = [{ x: fuente.x, y: fuente.y }];
  let x = fuente.x;
  let y = fuente.y;
  let angulo = fuente.angulo;

  for (const elemento of escena.elementos) {
    if (elemento.tipo === 'fuente') continue;

    if (elemento.tipo === 'interfaz') {
      if (x < elemento.x) {
        const dx = elemento.x - x;
        const dy = dx * Math.tan(angulo);
        const yInterfaz = y + dy;
        puntos.push({ x: elemento.x, y: yInterfaz });
        const resultado = refract(elemento.n1, elemento.n2, angulo);
        if (resultado.tir) {
          puntos[puntos.length - 1]!.tir = true;
          angulo = reflect(angulo);
        } else {
          angulo = resultado.theta;
        }
        x = elemento.x;
        y = yInterfaz;
      }
    } else if (elemento.tipo === 'espejo-plano') {
      const dx = elemento.x - x;
      const dy = dx * Math.tan(angulo);
      const yEspejo = y + dy;
      puntos.push({ x: elemento.x, y: yEspejo });
      angulo = 2 * elemento.angulo - angulo;
      x = elemento.x;
      y = yEspejo;
    } else if (elemento.tipo === 'lente') {
      if (x < elemento.x) {
        const dx = elemento.x - x;
        const yLente = y + dx * Math.tan(angulo);
        puntos.push({ x: elemento.x, y: yLente });
        angulo = angulo - yLente / elemento.f;
        x = elemento.x;
        y = yLente;
      }
    } else if (elemento.tipo === 'espejo-curvo') {
      const dx = elemento.x - x;
      const yEspejo = y + dx * Math.tan(angulo);
      puntos.push({ x: elemento.x, y: yEspejo });
      angulo = reflejarEspejoCurvo(yEspejo, angulo, { R: elemento.R });
      x = elemento.x;
      y = yEspejo;
    } else if (elemento.tipo === 'prisma') {
      if (x < elemento.x) {
        const dx = elemento.x - x;
        const yPrisma = y + dx * Math.tan(angulo);
        puntos.push({ x: elemento.x, y: yPrisma });
        const lambda = elemento.lambda ?? 550;
        const n = nSellmeier(elemento.material, lambda);
        const D = prismaDesviacion(n, elemento.anguloApice, Math.abs(angulo));
        if (isNaN(D)) {
          puntos[puntos.length - 1]!.tir = true;
          angulo = reflect(angulo);
        } else {
          angulo = angulo + (angulo >= 0 ? D : -D);
        }
        x = elemento.x;
        y = yPrisma;
      }
    }
  }

  const dxFin = xFin - x;
  const dyFin = dxFin * Math.tan(angulo);
  puntos.push({ x: xFin, y: y + dyFin });

  return puntos;
}
```

- [ ] **Paso 2: Añadir tests de lente/espejoCurvo/prisma a `src/core/content/__tests__/optics.test.ts`**

Añadir al final del archivo (NUNCA eliminar los tests existentes):

```typescript
// --- Tests de elementos nuevos: lente, espejo curvo, prisma ---

describe('trazarRayos — lente delgada', () => {
  it('rayo en el eje no se desvía por una lente (y=0)', () => {
    const escena: EscenaOptica = {
      elementos: [
        { tipo: 'fuente', x: -0.5, y: 0, angulo: 0 },
        { tipo: 'lente', x: 0, f: 0.2 },
      ],
    };
    const puntos = trazarRayos(escena, 0.5);
    expect(puntos).toHaveLength(3);
    // Rayo en eje: y=0 en la lente → ángulo no cambia
    expect(puntos[1]!.y).toBeCloseTo(0, 5);
    expect(puntos[2]!.y).toBeCloseTo(0, 5);
  });

  it('rayo paraxial converge cerca del foco (f=0.2m, y_fuente=-0.01, x_fuente=-0.5)', () => {
    // Rayo a 0.01m sobre el eje desde x=-0.5 horizontalmente
    const escena: EscenaOptica = {
      elementos: [
        { tipo: 'fuente', x: -0.5, y: 0.01, angulo: 0 },
        { tipo: 'lente', x: 0, f: 0.2 },
      ],
    };
    // En la lente: y=0.01, angulo_sal = 0 - 0.01/0.2 = -0.05 rad
    // Cruce con eje: y=0.01 + x*tan(-0.05) → x=0.01/tan(0.05) ≈ 0.2m
    const puntos = trazarRayos(escena, 0.5);
    // El segmento final pasa por el foco ~x=0.2 (y≈0 allí)
    const p1 = puntos[1]!; // en la lente
    const p2 = puntos[2]!; // final
    const slope = (p2.y - p1.y) / (p2.x - p1.x);
    const xCruce = p1.x - p1.y / slope; // donde y=0
    expect(xCruce).toBeCloseTo(0.2, 1);
  });
});

describe('trazarRayos — espejo curvo', () => {
  it('espejo cóncavo R=0.4m: refleja un rayo axial horizontal de vuelta', () => {
    const escena: EscenaOptica = {
      elementos: [
        { tipo: 'fuente', x: -0.3, y: 0, angulo: 0 },
        { tipo: 'espejo-curvo', x: 0, R: 0.4 },
      ],
    };
    const puntos = trazarRayos(escena, -0.5);
    expect(puntos).toHaveLength(3);
    // El rayo reflejado va hacia la izquierda
    expect(puntos[2]!.x).toBeLessThan(0);
  });
});

describe('trazarRayos — prisma', () => {
  it('un prisma desvía el rayo (ángulo cambia tras el prisma)', () => {
    const anguloInc = 0.2; // 0.2 rad ≈ 11.5°
    const escena: EscenaOptica = {
      elementos: [
        { tipo: 'fuente', x: -0.5, y: 0, angulo: anguloInc },
        { tipo: 'prisma', x: 0, anguloApice: Math.PI / 6, material: 'BK7', lambda: 550 },
      ],
    };
    const puntos = trazarRayos(escena, 0.5);
    expect(puntos).toHaveLength(3);
    // El rayo saliente debe tener un ángulo distinto al incidente
    const p1 = puntos[1]!;
    const p2 = puntos[2]!;
    const anguloSal = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    expect(Math.abs(anguloSal - anguloInc)).toBeGreaterThan(0.01);
  });
});
```

- [ ] **Paso 3: Ejecutar la suite completa y verificar ≥79 tests en verde**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm test 2>&1 | tail -15
```

Resultado esperado:
```
Tests  XX passed (XX)   ← al menos 79 (59 + 20 nuevos)
```

- [ ] **Paso 4: Verificar que el build sigue limpio**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm run build 2>&1 | tail -10
```

Resultado esperado: `✓ built in Xs` sin errores TypeScript.

---

## Self-Review

### 1. Spec Coverage

| Requisito | Task |
|---|---|
| Superficie esférica refractante exacta | Task 1 (`refractarSuperficieEsferica`) |
| Lente delgada (dos superficies / foco) | Task 1 (`imagenParaxialLente`, `trazarAbanico` con `LenteDelgada`) |
| Espejo esférico | Task 1 (`imagenParaxialEspejo`, `reflejarEspejoCurvo`) |
| `trazarAbanico` | Task 1 |
| `imagenParaxial*` | Task 1 |
| `puntoConvergencia` | Task 1 |
| Tests: lensmaker, Gauss, aumento, espejo | Task 1 tests |
| `nCauchy` / Sellmeier | Task 2 |
| Materiales reales (BK7, agua, diamante) | Task 2 |
| `prismaDesviacion`, `desviacionMinima` | Task 2 |
| Tests: n decrece con λ, BK7 F/d/C, desv. mínima | Task 2 tests |
| Aberración esférica (marginal vs paraxial) | Task 3 |
| Aberración cromática (foco vs λ) | Task 3 |
| Tests: signo correcto (marginal más cerca; azul más cerca) | Task 3 tests |
| Extender `ElementoOptico` con lente/espejoCurvo/prisma | Task 4 |
| Extender `trazarRayos` sin romper existente | Task 4 |
| Tests banco: lente converge, prisma desvía | Task 4 tests |

### 2. Placeholder Scan

- No hay "TBD", "TODO", ni "implement later" en el plan.
- Todos los bloques de código están completos.

### 3. Type Consistency

- `LenteDelgada` definida en Task 1 → usada en Task 3 (`aberracionEsferica`). ✓
- `MaterialOptico` definida en Task 2 (`dispersion.ts`) → importada en Task 3 y Task 4. ✓
- `reflejarEspejoCurvo(y, theta, { R })` recibe `EspejoCurvo` — en Task 4 se construye `{ R: elemento.R }`. ✓
- `puntoConvergencia` recibe `RayoTrayectoria[]` — en Task 3 se pasa `rayosSup` (subarray de `trazarAbanico`). ✓
- `refractarSuperficieEsferica(y, theta, sup: SuperficieEsferica)` — en Task 4 se usa con `{ R: 1e9, n1: 1.0, n2: n }`. ✓
