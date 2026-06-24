// Matrices ABCD para óptica matricial paraxial.
// CONVENCIÓN: rayo = (y, θ); M actúa como [y', θ'] = M [y, θ].
// IMPORTANTE: estas matrices son válidas SOLO en la aproximación paraxial (sin θ ≈ θ).
// Para trazado exacto, usar snell.ts.
import type { Mat2, Ray } from './types';

/** Traslación libre: propagación a distancia d en un medio homogéneo. */
export function translation(d: number): Mat2 {
  return [[1, d], [0, 1]];
}

/** Lente delgada de focal f (positiva = convergente). */
export function thinLens(f: number): Mat2 {
  return [[1, 0], [-1 / f, 1]];
}

/**
 * Refracción en interfaz plana (radio de curvatura infinito).
 * Matriz: [[1, 0], [0, n1/n2]].
 */
export function refractionFlat(n1: number, n2: number): Mat2 {
  return [[1, 0], [0, n1 / n2]];
}

/**
 * Refracción en interfaz esférica de radio R.
 * Convención de signos: R > 0 si el centro de curvatura está a la derecha.
 * Matriz: [[1, 0], [(n1-n2)/(n2*R), n1/n2]].
 */
export function refractionCurved(n1: number, n2: number, R: number): Mat2 {
  return [[1, 0], [(n1 - n2) / (n2 * R), n1 / n2]];
}

/**
 * Espejo esférico de radio R (R > 0 = cóncavo, R < 0 = convexo).
 * Focal efectiva: f = R/2. Matriz: [[1, 0], [-2/R, 1]].
 * Para espejo plano (R = Infinity): [[1, 0], [0, 1]].
 */
export function mirror(R: number): Mat2 {
  if (!isFinite(R)) return [[1, 0], [0, 1]];
  return [[1, 0], [-2 / R, 1]];
}

/** Producto de dos matrices 2×2: a · b. */
export function multiply(a: Mat2, b: Mat2): Mat2 {
  return [
    [
      a[0][0] * b[0][0] + a[0][1] * b[1][0],
      a[0][0] * b[0][1] + a[0][1] * b[1][1],
    ],
    [
      a[1][0] * b[0][0] + a[1][1] * b[1][0],
      a[1][0] * b[0][1] + a[1][1] * b[1][1],
    ],
  ];
}

/**
 * Compone matrices en ORDEN DE PROPAGACIÓN (el primer argumento actúa primero).
 * compose(M1, M2, M3) = M3 · M2 · M1 (álgebra: la última actúa primero sobre el rayo).
 * Implementación: reduce de izquierda a derecha, cada paso hace M_nueva · acumulado.
 */
export function compose(...mats: Mat2[]): Mat2 {
  // reduce de izquierda a derecha: m_nueva · acc (acc es lo que ya se acumuló a la derecha)
  return mats.reduce((acc, m) => multiply(m, acc));
}

/** Aplica una matriz ABCD a un rayo y devuelve el rayo transformado. */
export function applyToRay(M: Mat2, ray: Ray): Ray {
  return {
    y: M[0][0] * ray.y + M[0][1] * ray.theta,
    theta: M[1][0] * ray.y + M[1][1] * ray.theta,
  };
}
