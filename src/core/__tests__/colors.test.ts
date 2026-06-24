// Tests de colorimetría — dominancia de canal por región espectral
import { describe, it, expect } from 'vitest';
import { wavelengthToSRGB, DOMAIN_COLORS } from '../colors';

describe('colors — wavelengthToSRGB CIE', () => {
  it('700 nm (rojo): canal R dominante', () => {
    const [r, g, b] = wavelengthToSRGB(700);
    expect(r).toBeGreaterThan(g);
    expect(r).toBeGreaterThan(b);
    expect(r).toBeGreaterThan(0.3); // tiene algo de señal
  });

  it('530 nm (verde): canal G dominante', () => {
    const [r, g, b] = wavelengthToSRGB(530);
    expect(g).toBeGreaterThan(r);
    expect(g).toBeGreaterThan(b);
  });

  it('470 nm (azul): canal B dominante', () => {
    const [r, g, b] = wavelengthToSRGB(470);
    expect(b).toBeGreaterThan(r);
    expect(b).toBeGreaterThan(g);
  });

  it('valores dentro de gamut [0, 1]', () => {
    for (const nm of [380, 450, 500, 550, 600, 650, 700, 780]) {
      const [r, g, b] = wavelengthToSRGB(nm);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(1);
      expect(g).toBeGreaterThanOrEqual(0);
      expect(g).toBeLessThanOrEqual(1);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(1);
    }
  });

  it('longitudes fuera del espectro visible retornan [0,0,0]', () => {
    const [r1, g1, b1] = wavelengthToSRGB(200);
    const [r2, g2, b2] = wavelengthToSRGB(900);
    expect(r1 + g1 + b1).toBeCloseTo(0, 3);
    expect(r2 + g2 + b2).toBeCloseTo(0, 3);
  });
});

describe('colors — paleta de dominio', () => {
  it('DOMAIN_COLORS tiene los tres acentos de la paleta Pharos', () => {
    expect(DOMAIN_COLORS.ray).toBe('#f5a72c');
    expect(DOMAIN_COLORS.beam).toBe('#34d399');
    expect(DOMAIN_COLORS.wave).toBe('#38bdf8');
  });
});
