// Tests de lógica pura del banco (funciones sin DOM)
import { describe, it, expect } from 'vitest';
import { calcularRefraccion, calcularCaminoOptico, encontrarMinimoFermat } from '../bench';

describe('bench — cálculo de refracción', () => {
  it('rayo en agua (n2=1.33) refracta correctamente a 45°', () => {
    const r = calcularRefraccion(1.0, 1.33, Math.PI / 4);
    expect(r.tir).toBe(false);
    // Verificar Snell: n1 sin(θ1) = n2 sin(θ2)
    expect(Math.sin(Math.PI / 4)).toBeCloseTo(1.33 * Math.sin(r.theta), 6);
  });

  it('TIR se detecta para agua→aire con ángulo supercrítico', () => {
    const anguloCritico = Math.asin(1.0 / 1.33);
    const r = calcularRefraccion(1.33, 1.0, anguloCritico + 0.05);
    expect(r.tir).toBe(true);
  });

  it('rayo normal (θ=0) no se refracta en ningún medio', () => {
    const r = calcularRefraccion(1.0, 1.5, 0);
    expect(r.theta).toBeCloseTo(0, 6);
    expect(r.tir).toBe(false);
  });
});

describe('bench — camino óptico de Fermat', () => {
  // Geometría: A = (-2, 0.5) en medio 1, B = (2, -0.5) en medio 2
  // La interfaz está en x=0. El punto P está en (0, py).
  const A = { x: -2, y: 0.5 };
  const B = { x: 2, y: -0.5 };

  it('camino óptico es positivo para cualquier P', () => {
    const L = calcularCaminoOptico(1.0, 1.33, A, B, 0);
    expect(L).toBeGreaterThan(0);
  });

  it('el mínimo de Fermat coincide con el ángulo de Snell', () => {
    // El ángulo de Snell determina el P óptimo:
    // n1 * sin(θ1) = n2 * sin(θ2) => el P que minimiza L
    const py = encontrarMinimoFermat(1.0, 1.33, A, B);
    // Verificar Snell en ese punto
    const theta1 = Math.atan2(Math.abs(A.y - py), Math.abs(A.x));
    const theta2 = Math.atan2(Math.abs(py - B.y), Math.abs(B.x));
    expect(1.0 * Math.sin(theta1)).toBeCloseTo(1.33 * Math.sin(theta2), 3);
  });

  it('camino óptico es mayor lejos del mínimo', () => {
    const pyMin = encontrarMinimoFermat(1.0, 1.33, A, B);
    const Lmin = calcularCaminoOptico(1.0, 1.33, A, B, pyMin);
    const Llejos = calcularCaminoOptico(1.0, 1.33, A, B, pyMin + 0.5);
    expect(Llejos).toBeGreaterThan(Lmin);
  });
});
