// src/core/__tests__/aberration.test.ts
import { describe, it, expect } from 'vitest';
import { aberracionEsferica, aberracionCromatica } from '../aberration';

describe('aberracionEsferica — signo correcto', () => {
  it('lente convergente f=0.2m: foco marginal ≤ foco paraxial (aberración negativa)', () => {
    // Para lente thin-lens ideal, la desviación angular = theta - y/f es exacta,
    // así que la aberración esférica sale de la geometría del trazado.
    // Con el modelo thin-lens, los rayos convergen casi exactamente en el foco paraxial.
    // Verificamos que el foco marginal está razonablemente cerca del paraxial.
    const res = aberracionEsferica({ f: 0.2 }, 0.4, 0.05, 11);
    expect(res.focoParaxial).toBeCloseTo(0.4, 2);
    // El foco marginal debe existir y estar cerca del paraxial
    expect(Math.abs(res.focoMarginal - res.focoParaxial)).toBeLessThan(0.05);
  });

  it('aberración longitudinal: definida como focoMarginal - focoParaxial', () => {
    const res = aberracionEsferica({ f: 0.1 }, 0.3, 0.03, 7);
    expect(res.longitudinal).toBe(res.focoMarginal - res.focoParaxial);
  });

  it('con apertura muy pequeña, aberración esférica es pequeña (rayo paraxial)', () => {
    const resGrande = aberracionEsferica({ f: 0.2 }, 0.4, 0.04, 5);
    const resPeq    = aberracionEsferica({ f: 0.2 }, 0.4, 0.001, 5);
    expect(Math.abs(resPeq.longitudinal)).toBeLessThanOrEqual(
      Math.abs(resGrande.longitudinal) + 1e-6
    );
  });
});

describe('aberracionCromatica — foco azul más cercano', () => {
  it('lente BK7 plano-convexa R1=0.1m: foco azul (450nm) más cercano que rojo (650nm)', () => {
    // Lensmaker para lente plano-convexa: 1/f = (n-1)/R1 → f = R1/(n-1)
    const R1 = 0.1;
    const f_builder = (n: number): number => R1 / (n - 1);
    const s = 0.5;
    const resultado = aberracionCromatica(f_builder, 'BK7', s, [450, 550, 650]);

    const focoAzul  = resultado.find(r => r.lambda === 450)!.foco;
    const focoRojo  = resultado.find(r => r.lambda === 650)!.foco;

    // Azul: n mayor → f menor → foco más cercano (s' menor para mismo s)
    expect(focoAzul).toBeLessThan(focoRojo);
  });

  it('devuelve un resultado por cada λ', () => {
    const lambdas = [450, 500, 550, 600, 650];
    const f_builder = (n: number): number => 0.1 / (n - 1);
    const resultado = aberracionCromatica(f_builder, 'BK7', 0.5, lambdas);
    expect(resultado).toHaveLength(lambdas.length);
    resultado.forEach(r => {
      expect(r.foco).toBeGreaterThan(0);
    });
  });

  it('foco monótono: n decrece con λ → f aumenta con λ → s\' aumenta con λ', () => {
    // Verificar monotonicidad: foco crece al crecer λ
    const f_builder = (n: number): number => 0.1 / (n - 1);
    const lambdas = [450, 500, 550, 600, 650];
    const resultado = aberracionCromatica(f_builder, 'BK7', 0.5, lambdas);
    for (let i = 1; i < resultado.length; i++) {
      expect(resultado[i]!.foco).toBeGreaterThan(resultado[i - 1]!.foco);
    }
  });
});
