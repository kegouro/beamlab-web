// Tests de matrices ABCD — validados contra resultados analíticos
import { describe, it, expect } from 'vitest';
import {
  translation, thinLens, refractionFlat, refractionCurved,
  mirror, multiply, compose, applyToRay
} from '../abcd';

describe('abcd — matrices individuales', () => {
  it('translation(d): [[1,d],[0,1]]', () => {
    const M = translation(2.5);
    expect(M[0][0]).toBe(1);
    expect(M[0][1]).toBe(2.5);
    expect(M[1][0]).toBe(0);
    expect(M[1][1]).toBe(1);
  });

  it('thinLens(f): [[1,0],[-1/f,1]]', () => {
    const f = 0.1; // 10 cm
    const M = thinLens(f);
    expect(M[0][0]).toBe(1);
    expect(M[0][1]).toBe(0);
    expect(M[1][0]).toBeCloseTo(-1 / f, 10);
    expect(M[1][1]).toBe(1);
  });

  it('refractionFlat: B=0, A=1, D=n1/n2, C=0', () => {
    // Interfaz plana: n1/n2 afecta D (ángulo), C=0 (no tiene curvatura)
    const M = refractionFlat(1.0, 1.5);
    expect(M[0][0]).toBe(1);
    expect(M[0][1]).toBe(0);
    expect(M[1][0]).toBe(0);
    expect(M[1][1]).toBeCloseTo(1.0 / 1.5, 10);
  });

  it('mirror(R=Infinity): espejo plano = [[1,0],[0,1]]', () => {
    // Espejo plano (radio infinito): equivale a reflexión simple
    const M = mirror(Infinity);
    expect(M[0][0]).toBe(1);
    expect(M[1][0]).toBe(0);
    expect(M[1][1]).toBe(1);
  });
});

describe('abcd — composición y aplicación', () => {
  it('lente delgada a distancia focal forma imagen en infinito', () => {
    // Rayo paralelo al eje (y=1, theta=0) atraviesa lente f=0.1m
    // Después: theta debe ser -y/f = -10 rad (converge al foco)
    const f = 0.1;
    const ray = { y: 1.0, theta: 0.0 };
    const M = thinLens(f);
    const resultado = applyToRay(M, ray);
    expect(resultado.y).toBeCloseTo(1.0, 10);
    expect(resultado.theta).toBeCloseTo(-1.0 / f, 10);
  });

  it('compose: lente + translación focal => rayo paralelo converge a y=0', () => {
    // Lente f=0.1 seguida de traslación d=0.1 (distancia focal)
    // Rayo (y=1, theta=0) debería converger a y=0
    const f = 0.1;
    const d = 0.1;
    const M = compose(thinLens(f), translation(d));
    const ray = { y: 1.0, theta: 0.0 };
    const resultado = applyToRay(M, ray);
    expect(resultado.y).toBeCloseTo(0.0, 6);
  });

  it('telescopio kepleriano: aumento angular M = -f1/f2 (entrada por objetivo)', () => {
    // Telescopio kepleriano: objetivo(f1) → espacio(d=f1+f2) → ocular(f2)
    // Un rayo (y=0, theta=1) que entra al objetivo sale por el ocular
    // con theta' = -(f1/f2) * theta (el ojo ve el campo amplificado f2/f1 veces)
    // La relación de aumento angular del sistema matricial: D = theta_out/theta_in = -f1/f2
    const f1 = 0.05;  // objetivo 5 cm
    const f2 = 0.25;  // ocular 25 cm
    const d = f1 + f2;
    const M = compose(thinLens(f1), translation(d), thinLens(f2));
    const ray = { y: 0.0, theta: 1.0 };
    const resultado = applyToRay(M, ray);
    // D de la matriz = -f1/f2 = -0.2 (aumento angular de salida por entrada)
    expect(resultado.theta).toBeCloseTo(-(f1 / f2), 4);
    // y no es exactamente 0 para (y=0, theta=1) — verifica que no explota
    expect(Math.abs(resultado.y)).toBeLessThan(1.0);
  });

  it('multiply: identidad * M = M', () => {
    const identidad: import('../types').Mat2 = [[1, 0], [0, 1]];
    const M = thinLens(0.2);
    const resultado = multiply(identidad, M);
    expect(resultado[0][0]).toBeCloseTo(M[0][0], 10);
    expect(resultado[0][1]).toBeCloseTo(M[0][1], 10);
    expect(resultado[1][0]).toBeCloseTo(M[1][0], 10);
    expect(resultado[1][1]).toBeCloseTo(M[1][1], 10);
  });

  it('refractionCurved y mirror exportados sin error de tipo', () => {
    // Smoke test: solo verifica que se pueden llamar sin excepción
    const Mref = refractionCurved(1.0, 1.5, 0.1);
    const Mmir = mirror(0.2);
    expect(Mref[0][0]).toBe(1);
    expect(Mmir[0][0]).toBe(1);
  });
});
