import { describe, it, expect } from 'vitest';
import { trazarRayos } from '../optics';
import type { EscenaOptica } from '../optics';
import type { ElementoLente, ElementoEspejoCurvo, ElementoPrisma } from '../optics';

describe('trazarRayos — escena vacía o sin fuente', () => {
  it('devuelve array vacío si no hay fuente', () => {
    const escena: EscenaOptica = { elementos: [] };
    expect(trazarRayos(escena, 1)).toEqual([]);
  });

  it('con solo fuente, traza hasta xFin en línea recta', () => {
    const escena: EscenaOptica = {
      elementos: [{ tipo: 'fuente', x: -0.5, y: 0, angulo: 0 }],
    };
    const puntos = trazarRayos(escena, 0.5);
    expect(puntos).toHaveLength(2);
    expect(puntos[0]).toMatchObject({ x: -0.5, y: 0 });
    expect(puntos[1]!.x).toBeCloseTo(0.5, 5);
    expect(puntos[1]!.y).toBeCloseTo(0, 5); // ángulo 0 = rayo horizontal
  });
});

describe('trazarRayos — interfaz (Snell exacto)', () => {
  it('rayo horizontal no se refracta (θ=0)', () => {
    const escena: EscenaOptica = {
      elementos: [
        { tipo: 'fuente', x: -0.5, y: 0, angulo: 0 },
        { tipo: 'interfaz', x: 0, n1: 1.0, n2: 1.33 },
      ],
    };
    const puntos = trazarRayos(escena, 0.5);
    // Tres puntos: fuente, cruce interfaz, fin
    expect(puntos).toHaveLength(3);
    // El cruce está en x=0, y=0 (rayo horizontal)
    expect(puntos[1]!.x).toBeCloseTo(0, 5);
    expect(puntos[1]!.y).toBeCloseTo(0, 5);
    // Ángulo refractado ≈ 0, así que el punto final también y≈0
    expect(puntos[2]!.y).toBeCloseTo(0, 5);
  });

  it('rayo a 30° se refracta correctamente en agua (Snell verifica)', () => {
    const theta1 = Math.PI / 6; // 30°
    const n1 = 1.0;
    const n2 = 1.33;
    const escena: EscenaOptica = {
      elementos: [
        { tipo: 'fuente', x: -0.5, y: 0, angulo: theta1 },
        { tipo: 'interfaz', x: 0, n1, n2 },
      ],
    };
    const puntos = trazarRayos(escena, 0.5);
    expect(puntos).toHaveLength(3);
    // Verificar Snell: ángulo θ2 = asin(n1*sin(θ1)/n2)
    const theta2Esperado = Math.asin((n1 * Math.sin(theta1)) / n2);
    // Calcular ángulo real del último segmento
    const dx = puntos[2]!.x - puntos[1]!.x;
    const dy = puntos[2]!.y - puntos[1]!.y;
    const anguloReal = Math.atan2(dy, dx);
    expect(anguloReal).toBeCloseTo(theta2Esperado, 4);
  });

  it('TIR: el rayo supercrítico no cruza la interfaz y se marca como TIR', () => {
    const n1 = 1.33;
    const n2 = 1.0;
    const anguloCritico = Math.asin(n2 / n1);
    const escena: EscenaOptica = {
      elementos: [
        { tipo: 'fuente', x: -0.5, y: 0, angulo: anguloCritico + 0.05 },
        { tipo: 'interfaz', x: 0, n1, n2 },
      ],
    };
    const puntos = trazarRayos(escena, 0.5);
    // El punto de cruce debe estar marcado como TIR
    const cruceTIR = puntos.find(p => p.tir === true);
    expect(cruceTIR).toBeDefined();
  });
});

describe('trazarRayos — espejo plano', () => {
  it('espejo vertical (angulo=0) refleja un rayo horizontal hacia atrás', () => {
    const escena: EscenaOptica = {
      elementos: [
        { tipo: 'fuente', x: -0.5, y: 0, angulo: 0 },
        { tipo: 'espejo-plano', x: 0, angulo: 0 },
      ],
    };
    // Tras reflejar, el rayo va hacia la izquierda: xFin < 0
    const puntos = trazarRayos(escena, -0.5);
    expect(puntos).toHaveLength(3);
    // El punto reflejado final debe estar a la izquierda del espejo
    expect(puntos[2]!.x).toBeLessThan(0);
  });
});

// --- Tests de elementos nuevos: lente, espejo curvo, prisma ---

describe('trazarRayos — lente delgada', () => {
  it('rayo en el eje no se desvía por una lente (y=0)', () => {
    const lente: ElementoLente = { tipo: 'lente', x: 0, f: 0.2 };
    const escena: EscenaOptica = {
      elementos: [
        { tipo: 'fuente', x: -0.5, y: 0, angulo: 0 },
        lente,
      ],
    };
    const puntos = trazarRayos(escena, 0.5);
    expect(puntos).toHaveLength(3);
    // Rayo en eje: y=0 en la lente → ángulo no cambia
    expect(puntos[1]!.y).toBeCloseTo(0, 5);
    expect(puntos[2]!.y).toBeCloseTo(0, 5);
  });

  it('rayo paraxial converge cerca del foco (f=0.2m, y_fuente=0.01, x_fuente=-0.5)', () => {
    // Rayo a 0.01m sobre el eje desde x=-0.5 horizontalmente
    const lente: ElementoLente = { tipo: 'lente', x: 0, f: 0.2 };
    const escena: EscenaOptica = {
      elementos: [
        { tipo: 'fuente', x: -0.5, y: 0.01, angulo: 0 },
        lente,
      ],
    };
    // En la lente: y=0.01, angulo_sal = 0 - 0.01/0.2 = -0.05 rad
    // Cruce con eje: y=0.01 + x*tan(-0.05) → x=0.01/tan(0.05) ≈ 0.2m
    const puntos = trazarRayos(escena, 0.5);
    // El segmento final pasa por el foco ~x=0.2 (y≈0 allí)
    const p1 = puntos[1]!; // en la lente
    const p2 = puntos[2]!; // final
    const slope = (p2.y - p1.y) / (p2.x - p1.x);
    const xCruce = p1.x - p1.y / slope; // donde y=0
    expect(xCruce).toBeCloseTo(0.2, 1);
  });
});

describe('trazarRayos — espejo curvo', () => {
  it('espejo cóncavo R=0.4m: refleja un rayo axial horizontal de vuelta', () => {
    const espejo: ElementoEspejoCurvo = { tipo: 'espejo-curvo', x: 0, R: 0.4 };
    const escena: EscenaOptica = {
      elementos: [
        { tipo: 'fuente', x: -0.3, y: 0, angulo: 0 },
        espejo,
      ],
    };
    const puntos = trazarRayos(escena, -0.5);
    expect(puntos).toHaveLength(3);
    // El rayo reflejado va hacia la izquierda
    expect(puntos[2]!.x).toBeLessThan(0);
  });
});

describe('trazarRayos — prisma', () => {
  it('un prisma desvía el rayo (ángulo cambia tras el prisma)', () => {
    const anguloInc = 0.2; // 0.2 rad ≈ 11.5°
    const prisma: ElementoPrisma = {
      tipo: 'prisma',
      x: 0,
      anguloApice: Math.PI / 6,
      material: 'BK7',
      lambda: 550,
    };
    const escena: EscenaOptica = {
      elementos: [
        { tipo: 'fuente', x: -0.5, y: 0, angulo: anguloInc },
        prisma,
      ],
    };
    const puntos = trazarRayos(escena, 0.5);
    expect(puntos).toHaveLength(3);
    // El rayo saliente debe tener un ángulo distinto al incidente
    const p1 = puntos[1]!;
    const p2 = puntos[2]!;
    const anguloSal = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    expect(Math.abs(anguloSal - anguloInc)).toBeGreaterThan(0.01);
  });
});
