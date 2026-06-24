// src/core/content/optics.ts — VERSIÓN EXTENDIDA
// Tipos de escena óptica y trazador exacto de rayos para el Acto I.
// Usa Snell EXACTO (refract de core/snell), nunca ABCD.
// Todas las funciones son PURAS: sin DOM, sin estado global.

import { refract, reflect } from '../snell';
import { refractarSuperficieEsferica, reflejarEspejoCurvo } from '../imaging';
import { nSellmeier, prismaDesviacion } from '../dispersion';
import type { MaterialOptico } from '../dispersion';

// ── Elementos ópticos (unión discriminada extensible) ────────────────────────

/** Fuente puntual de rayo */
export interface ElementoFuente {
  tipo: 'fuente';
  /** Posición x de la fuente (coordenadas normalizadas bench [-1, 1]) */
  x: number;
  /** Posición y de la fuente */
  y: number;
  /** Ángulo inicial del rayo respecto al eje (radianes, positivo = hacia arriba) */
  angulo: number;
}

/** Interfaz plana vertical (refracción Snell exacta + TIR) */
export interface ElementoInterfaz {
  tipo: 'interfaz';
  /** Posición x de la interfaz */
  x: number;
  /** Índice del medio a la izquierda */
  n1: number;
  /** Índice del medio a la derecha */
  n2: number;
}

/** Espejo plano vertical (reflexión especular exacta) */
export interface ElementoEspejoPlano {
  tipo: 'espejo-plano';
  /** Posición x del espejo */
  x: number;
  /**
   * Ángulo de la normal del espejo respecto al eje x (radianes).
   * 0 = espejo vertical (normal horizontal); el rayo incidente horizontal rebota.
   */
  angulo: number;
}

/** Lente delgada (aproximación thin-lens, refracción exacta angular) */
export interface ElementoLente {
  tipo: 'lente';
  /** Posición x de la lente */
  x: number;
  /** Distancia focal (m). f > 0 = convergente. */
  f: number;
}

/** Espejo esférico curvo */
export interface ElementoEspejoCurvo {
  tipo: 'espejo-curvo';
  /** Posición x del espejo */
  x: number;
  /** Radio de curvatura (m). R > 0 = cóncavo (convergente). */
  R: number;
}

/** Prisma triangular (refracción exacta Snell en dos caras) */
export interface ElementoPrisma {
  tipo: 'prisma';
  /** Posición x de la primera cara del prisma */
  x: number;
  /** Ángulo del ápice (radianes) */
  anguloApice: number;
  /** Material del prisma (para n(λ)) */
  material: MaterialOptico;
  /** Longitud de onda en nm (por defecto 550 = luz verde) */
  lambda?: number;
}

/** Unión discriminada de todos los elementos posibles */
export type ElementoOptico =
  | ElementoFuente
  | ElementoInterfaz
  | ElementoEspejoPlano
  | ElementoLente
  | ElementoEspejoCurvo
  | ElementoPrisma;

/** Escena óptica: lista ordenada de elementos */
export interface EscenaOptica {
  elementos: ElementoOptico[];
}

/** Punto 2D de la polilínea del rayo */
export interface PuntoRayo {
  x: number;
  y: number;
  /** true si en este punto hay TIR (para colorear distinto el segmento saliente) */
  tir?: boolean;
}

// ── Trazador puro ────────────────────────────────────────────────────────────

/**
 * Traza un rayo a través de la escena y produce la polilínea de puntos.
 * Los elementos se procesan en orden de aparición en `escena.elementos`.
 *
 * La fuente DEBE ser el primer elemento de tipo 'fuente'.
 * `xFin` es la coordenada x final hasta donde extender el último segmento.
 *
 * @returns array de PuntoRayo que forman la polilínea; vacío si no hay fuente.
 */
export function trazarRayos(escena: EscenaOptica, xFin: number): PuntoRayo[] {
  // Encontrar la fuente
  const fuente = escena.elementos.find(
    (e): e is ElementoFuente => e.tipo === 'fuente'
  );
  if (!fuente) return [];

  const puntos: PuntoRayo[] = [{ x: fuente.x, y: fuente.y }];

  // Estado del rayo
  let x = fuente.x;
  let y = fuente.y;
  let angulo = fuente.angulo; // radianes, positivo = hacia arriba

  // Procesar elementos en orden (saltando la fuente)
  for (const elemento of escena.elementos) {
    if (elemento.tipo === 'fuente') continue;

    if (elemento.tipo === 'interfaz') {
      // Solo procesar si el rayo puede alcanzar la interfaz (interfaz está adelante del rayo)
      if (x < elemento.x) {
        const dx = elemento.x - x;
        const dy = dx * Math.tan(angulo);
        const yInterfaz = y + dy;

        puntos.push({ x: elemento.x, y: yInterfaz });

        // Aplicar Snell exacto
        const resultado = refract(elemento.n1, elemento.n2, angulo);
        if (resultado.tir) {
          // Reflexión total interna: marcar y rebotar
          puntos[puntos.length - 1]!.tir = true;
          angulo = reflect(angulo);
        } else {
          angulo = resultado.theta;
        }
        x = elemento.x;
        y = yInterfaz;
      }
    } else if (elemento.tipo === 'espejo-plano') {
      // Calcular intersección con el espejo (asumiendo espejo alcanzable)
      const dx = elemento.x - x;
      const dy = dx * Math.tan(angulo);
      const yEspejo = y + dy;

      puntos.push({ x: elemento.x, y: yEspejo });

      // Reflexión especular respecto a la normal del espejo
      // angulo_reflejado = 2 * angulo_normal - angulo_incidente
      angulo = 2 * elemento.angulo - angulo;
      x = elemento.x;
      y = yEspejo;
    } else if (elemento.tipo === 'lente') {
      // Lente delgada exacta: desviación angular theta' = theta - y/f
      if (x < elemento.x) {
        const dx = elemento.x - x;
        const yLente = y + dx * Math.tan(angulo);
        puntos.push({ x: elemento.x, y: yLente });
        // Thin-lens: desvía el ángulo según la altura
        angulo = angulo - yLente / elemento.f;
        x = elemento.x;
        y = yLente;
      }
    } else if (elemento.tipo === 'espejo-curvo') {
      // Espejo esférico curvo: reflexión exacta según normal en el punto
      if (x <= elemento.x) {
        const dx = elemento.x - x;
        const yEspejo = y + dx * Math.tan(angulo);
        puntos.push({ x: elemento.x, y: yEspejo });
        // Reflexión exacta en espejo curvo
        angulo = reflejarEspejoCurvo(yEspejo, angulo, { R: elemento.R });
        x = elemento.x;
        y = yEspejo;
      }
    } else if (elemento.tipo === 'prisma') {
      // Prisma: refracción Snell exacta usando prismaDesviacion
      if (x < elemento.x) {
        const dx = elemento.x - x;
        const yPrisma = y + dx * Math.tan(angulo);
        puntos.push({ x: elemento.x, y: yPrisma });

        const lambda = elemento.lambda ?? 550;
        const n = nSellmeier(elemento.material, lambda);
        // Desviar por el prisma: usar ángulo de desviación del prisma
        const D = prismaDesviacion(n, elemento.anguloApice, Math.abs(angulo));
        if (isNaN(D)) {
          puntos[puntos.length - 1]!.tir = true;
          angulo = reflect(angulo);
        } else {
          angulo = angulo + (angulo >= 0 ? D : -D);
        }
        x = elemento.x;
        y = yPrisma;
      }
    }
  }

  // Extender hasta xFin
  const dxFin = xFin - x;
  const dyFin = dxFin * Math.tan(angulo);
  puntos.push({ x: xFin, y: y + dyFin });

  return puntos;
}
