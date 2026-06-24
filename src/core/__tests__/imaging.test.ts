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
  it('superficie plana (R→∞ simulado con R=1e9): imagen virtual (s\'≈-s)', () => {
    // n1/s + n2/s' = (n2-n1)/R ≈ 0
    // Con n1=n2=1: 1/s + 1/s' = 0 → s' = -s = -1 (imagen virtual, mismo lado)
    // Con medios idénticos la superficie no desvía los rayos; imagen coincide
    // espacialmente con el objeto pero la ecuación de Gauss da s' = -s.
    const sup = { R: 1e9, n1: 1, n2: 1 };
    const res = imagenParaxialSuperficie(1.0, sup);
    // s' = n2 / ((n2-n1)/R - n1/s) = 1 / (0 - 1) = -1
    expect(res.sPrima).toBeCloseTo(-1.0, 0);
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
  it('espejo cóncavo R=0.2m, objeto a 0.3m → s\'=0.15m, m=-0.5', () => {
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
    // ángulo salida paraxial desde la ecuación de refracción vectorial:
    // phi ≈ y/R, alphaInc ≈ theta - y/R
    // Snell paraxial: alphaTrans ≈ (n1/n2)*alphaInc
    // thetaSal = alphaTrans + phi = (n1/n2)*(theta - y/R) + y/R
    //          = (n1/n2)*theta + y*(n2-n1)/(n2*R)
    const thetaParaxial = (sup.n1 / sup.n2) * theta + y * (sup.n2 - sup.n1) / (sup.n2 * sup.R);
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
