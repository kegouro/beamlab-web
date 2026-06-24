// Tests de trazado exacto de Snell — resultados analíticos conocidos
import { describe, it, expect } from 'vitest';
import { refract, reflect, criticalAngle } from '../snell';

describe('snell — refracción exacta', () => {
  it('aire→agua: ángulo de 45° → ~32.04°', () => {
    const n1 = 1.0;
    const n2 = 1.33;
    const incidente = (45 * Math.PI) / 180;
    const resultado = refract(n1, n2, incidente);
    expect(resultado.tir).toBe(false);
    // n1 sin(45°) = n2 sin(θ₂) => sin(θ₂) = sin(45°)/1.33 ≈ 0.5317
    const esperado = Math.asin(Math.sin(incidente) / n2);
    expect(resultado.theta).toBeCloseTo(esperado, 10);
    // El ángulo exacto con n=1.33 es ~32.12°; 32.04° corresponde a n=1.333 (agua pura)
    // Verificamos solo que el ángulo sea cercano al rango esperado (30–35°)
    const gradosResultado = resultado.theta * 180 / Math.PI;
    expect(gradosResultado).toBeGreaterThan(30);
    expect(gradosResultado).toBeLessThan(35);
  });

  it('rayo normal (θ=0) no se desvía', () => {
    const resultado = refract(1.0, 1.5, 0);
    expect(resultado.tir).toBe(false);
    expect(resultado.theta).toBeCloseTo(0, 10);
  });

  it('ángulo crítico agua→aire: TIR por encima', () => {
    const n1 = 1.33;
    const n2 = 1.0;
    // Ángulo crítico = arcsin(1/1.33) ≈ 48.75°
    const critico = Math.asin(n2 / n1);
    // Justo por encima del crítico → TIR
    const resultado = refract(n1, n2, critico + 0.01);
    expect(resultado.tir).toBe(true);
  });

  it('justo por debajo del ángulo crítico → no TIR', () => {
    const n1 = 1.33;
    const n2 = 1.0;
    const critico = Math.asin(n2 / n1);
    const resultado = refract(n1, n2, critico - 0.01);
    expect(resultado.tir).toBe(false);
  });

  it('criticalAngle devuelve null cuando n1 <= n2', () => {
    expect(criticalAngle(1.0, 1.5)).toBeNull();
  });

  it('criticalAngle correcto para vidrio→aire', () => {
    const angulo = criticalAngle(1.5, 1.0);
    expect(angulo).not.toBeNull();
    expect(angulo!).toBeCloseTo(Math.asin(1.0 / 1.5), 10);
  });
});

describe('snell — reflexión', () => {
  it('reflect invierte el ángulo', () => {
    expect(reflect(0.3)).toBeCloseTo(-0.3, 10);
    expect(reflect(-0.5)).toBeCloseTo(0.5, 10);
    expect(reflect(0)).toBeCloseTo(0, 10);
  });
});
