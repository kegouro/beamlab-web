// Tests del parámetro q gaussiano — cuidado numérico en la cintura
import { describe, it, expect } from 'vitest';
import { qFromWaist, propagate, waist, radius, rayleigh, gouy } from '../gaussian';
import { translation } from '../abcd';

describe('gaussian — parámetro q en la cintura', () => {
  it('qFromWaist: parte real = 0, parte imag = zR', () => {
    const w0 = 0.001; // 1 mm
    const lambda = 633e-9; // He-Ne
    const zR = Math.PI * w0 ** 2 / lambda;
    const q = qFromWaist(w0, lambda);
    expect(q.re).toBeCloseTo(0, 10);
    // 1/q = -i/zR => q = i*zR => im = zR, re = 0
    expect(q.im).toBeCloseTo(zR, 6);
  });

  it('radius(q) en la cintura = Infinity, sin NaN', () => {
    const q = qFromWaist(0.001, 633e-9);
    const R = radius(q);
    expect(isNaN(R)).toBe(false);
    expect(R).toBe(Infinity);
  });

  it('rayleigh(w0, lambda): zR = pi*w0^2/lambda', () => {
    const w0 = 0.001;
    const lambda = 633e-9;
    const zR = rayleigh(w0, lambda);
    expect(zR).toBeCloseTo(Math.PI * w0 ** 2 / lambda, 6);
  });

  it('waist(q) en la cintura = w0', () => {
    const w0 = 0.001;
    const lambda = 633e-9;
    const q = qFromWaist(w0, lambda);
    expect(waist(q, lambda)).toBeCloseTo(w0, 6);
  });
});

describe('gaussian — propagación', () => {
  it('w(z) crece con la distancia desde la cintura', () => {
    const w0 = 0.001;
    const lambda = 633e-9;
    const zR = rayleigh(w0, lambda);
    const q0 = qFromWaist(w0, lambda);
    const q1 = propagate(q0, translation(zR));
    const q2 = propagate(q0, translation(2 * zR));
    const w0_ = waist(q0, lambda);
    const w1 = waist(q1, lambda);
    const w2 = waist(q2, lambda);
    expect(w1).toBeGreaterThan(w0_);
    expect(w2).toBeGreaterThan(w1);
    // En z=zR, w = w0*sqrt(2)
    expect(w1).toBeCloseTo(w0 * Math.sqrt(2), 4);
  });

  it('propagate conserva el haz: propagar distancia cero no cambia q', () => {
    const q0 = qFromWaist(0.001, 633e-9);
    const q1 = propagate(q0, translation(0));
    expect(q1.re).toBeCloseTo(q0.re, 8);
    expect(q1.im).toBeCloseTo(q0.im, 8);
  });
});

describe('gaussian — fase de Gouy', () => {
  it('gouy(0, zR) = 0', () => {
    expect(gouy(0, 100)).toBeCloseTo(0, 10);
  });

  it('gouy(z → +∞) → +π/2', () => {
    expect(gouy(1e12, 1)).toBeCloseTo(Math.PI / 2, 4);
  });

  it('gouy(z → -∞) → -π/2', () => {
    expect(gouy(-1e12, 1)).toBeCloseTo(-Math.PI / 2, 4);
  });

  it('gouy es antisimétrica: gouy(-z) = -gouy(z)', () => {
    const z = 3.5;
    const zR = 1.2;
    expect(gouy(-z, zR)).toBeCloseTo(-gouy(z, zR), 10);
  });
});
