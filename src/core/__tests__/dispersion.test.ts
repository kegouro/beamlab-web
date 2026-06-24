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

  it('BK7: n a 589nm (línea d) ≈ 1.515–1.535 (Cauchy approx)', () => {
    const n = nCauchy('BK7', 589);
    expect(n).toBeGreaterThan(1.515);
    expect(n).toBeLessThan(1.535);
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

  it('agua: n en rango razonable en visible', () => {
    const n = nSellmeier('agua', 550);
    expect(n).toBeGreaterThan(1.30);
    expect(n).toBeLessThan(1.38);
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

  it('prismaDesviacion devuelve NaN cuando hay TIR en la segunda cara', () => {
    // n=1.8, A=70°: ángulo crítico = arcsin(1/1.8)≈33.7°; r2=A-r1 excede el crítico
    const A = (70 * Math.PI) / 180;
    const i1 = (10 * Math.PI) / 180;
    const D = prismaDesviacion(1.8, A, i1);
    expect(isNaN(D)).toBe(true);
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
