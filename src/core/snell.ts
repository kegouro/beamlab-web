// Trazado exacto de Snell — n₁ sin θ₁ = n₂ sin θ₂
// NOTA: este módulo usa Snell EXACTO, no la aproximación paraxial.
// Las matrices ABCD viven en abcd.ts y solo son válidas para ángulos pequeños.
import type { RefractResult } from './types';

/**
 * Refracción exacta en una interfaz plana.
 * @param n1 - índice del medio incidente
 * @param n2 - índice del medio transmitido
 * @param thetaInc - ángulo de incidencia en radianes (respecto a la normal)
 * @returns ángulo refractado y flag de TIR
 */
export function refract(n1: number, n2: number, thetaInc: number): RefractResult {
  const sinRefract = (n1 * Math.sin(thetaInc)) / n2;
  // Reflexión total interna: sin > 1
  if (Math.abs(sinRefract) >= 1) {
    return { theta: thetaInc, tir: true };
  }
  return { theta: Math.asin(sinRefract), tir: false };
}

/**
 * Reflexión especular: invierte el ángulo respecto a la normal.
 */
export function reflect(theta: number): number {
  return -theta;
}

/**
 * Ángulo crítico para TIR (solo existe cuando n1 > n2).
 * @returns ángulo en radianes, o null si n1 <= n2
 */
export function criticalAngle(n1: number, n2: number): number | null {
  if (n1 <= n2) return null;
  return Math.asin(n2 / n1);
}
