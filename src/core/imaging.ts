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
