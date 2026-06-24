// Parámetro complejo q para haces gaussianos.
// Convención: 1/q = 1/R − i·λ/(π·w²)
// En la cintura (z=0): R → ∞, w = w0 => 1/q = 0 − i·λ/(π·w0²) = −i/zR
// Por lo tanto en la cintura: q = i·zR (re=0, im=zR).
import type { Complex, Mat2 } from './types';

/** Distancia de Rayleigh: zR = π·w0²/λ */
export function rayleigh(w0: number, lambda: number): number {
  return (Math.PI * w0 * w0) / lambda;
}

/**
 * Parámetro q en la cintura del haz.
 * q = i·zR, es decir: re=0, im=zR.
 */
export function qFromWaist(w0: number, lambda: number): Complex {
  return { re: 0, im: rayleigh(w0, lambda) };
}

/**
 * Propagación del parámetro q mediante la ley ABCD:
 *   q₂ = (A·q + B) / (C·q + D)
 * División compleja: (a+bi)/(c+di) = [(ac+bd) + (bc-ad)i] / (c²+d²)
 */
export function propagate(q: Complex, M: Mat2): Complex {
  const A = M[0][0], B = M[0][1];
  const C = M[1][0], D = M[1][1];

  // Numerador: A·q + B = (A·re + B) + i·(A·im)
  const numRe = A * q.re + B;
  const numIm = A * q.im;

  // Denominador: C·q + D = (C·re + D) + i·(C·im)
  const denRe = C * q.re + D;
  const denIm = C * q.im;

  const denom = denRe * denRe + denIm * denIm;
  return {
    re: (numRe * denRe + numIm * denIm) / denom,
    im: (numIm * denRe - numRe * denIm) / denom,
  };
}

/**
 * Radio del haz w en la posición de q.
 * De 1/q = 1/R − i·λ/(π·w²): Im(1/q) = −λ/(π·w²)
 * Forma directa: Im(1/q) = −im/|q|², luego w = sqrt(λ/(π·|Im(1/q)|))
 */
export function waist(q: Complex, lambda: number): number {
  const modSq = q.re * q.re + q.im * q.im;
  // Im(1/q) = (−q.im) / |q|²
  const imInvQ = -q.im / modSq;
  // −λ/(π·w²) = imInvQ => w² = λ/(π·|imInvQ|)
  return Math.sqrt(lambda / (Math.PI * Math.abs(imInvQ)));
}

/**
 * Radio de curvatura del frente de onda R.
 * Re(1/q) = 1/R => R = 1/Re(1/q).
 * En la cintura: Re(1/q) = 0 => R = Infinity (nunca NaN).
 */
export function radius(q: Complex): number {
  const modSq = q.re * q.re + q.im * q.im;
  const reInvQ = q.re / modSq;
  if (reInvQ === 0) return Infinity;
  return 1 / reInvQ;
}

/**
 * Fase de Gouy: Δφ = arctan(z / zR).
 * Acumula desde −π/2 (z→−∞) hasta +π/2 (z→+∞).
 */
export function gouy(z: number, zR: number): number {
  return Math.atan2(z, zR);
}
