// src/core/aberration.ts
// Aberraciones ópticas geométricas — esférica y cromática.
// Todas las funciones son PURAS. Sin DOM, sin estado global.

import { trazarAbanico, imagenParaxialLente, puntoConvergencia } from './imaging';
import type { LenteDelgada } from './imaging';
import { nSellmeier } from './dispersion';
import type { MaterialOptico } from './dispersion';

/**
 * Resultado de análisis de aberración esférica para una lente.
 */
export interface ResultadoAberracionEsferica {
  /** Posición del foco paraxial (ecuación thin-lens). */
  focoParaxial: number;
  /** Posición del foco marginal (trazado exacto de rayos marginales). */
  focoMarginal: number;
  /** Aberración esférica longitudinal: focoMarginal - focoParaxial (negativa = subkorregida). */
  longitudinal: number;
  /** Aberración esférica transversal: altura del rayo marginal en el plano focal paraxial. */
  transversal: number;
}

/**
 * Calcula la aberración esférica de una lente delgada.
 *
 * Método: traza rayos a distintas alturas de apertura; compara el foco
 * real (intersección con el eje) vs el foco paraxial.
 *
 * Para una lente convergente ideal, el foco marginal cae MÁS CERCA que
 * el paraxial (aberración esférica negativa o "subkorregida").
 *
 * @param lente   Lente delgada (f en metros).
 * @param s       Distancia objeto (metros, >0 = objeto real a la izquierda).
 * @param yMax    Altura máxima de apertura (metros).
 * @param nRayos  Número de rayos del abanico.
 */
export function aberracionEsferica(
  lente: LenteDelgada,
  s: number,
  yMax: number,
  nRayos: number
): ResultadoAberracionEsferica {
  // Foco paraxial (ecuación thin-lens)
  const { sPrima: focoParaxial } = imagenParaxialLente(s, lente);

  // Trazar abanico de rayos exacto (modelo thin-lens con desviación angular exacta)
  const rayos = trazarAbanico(0, -s, lente, nRayos, yMax, focoParaxial + 0.2);

  // Foco marginal: tomar los rayos más externos (índice 0 y último)
  const rayosSup = [rayos[0]!, rayos[rayos.length - 1]!];
  const convMarginal = puntoConvergencia(rayosSup);
  const focoMarginal = convMarginal?.x ?? focoParaxial;

  // Aberración longitudinal
  const longitudinal = focoMarginal - focoParaxial;

  // Aberración transversal: altura del rayo marginal en el plano focal paraxial
  // El último rayo externo en x=focoParaxial
  const rayoMarginal = rayos[rayos.length - 1];
  let transversal = 0;
  if (rayoMarginal) {
    const p1 = rayoMarginal.puntos[1]; // punto en el elemento (x=0, y=yMax aprox)
    const p2 = rayoMarginal.puntos[2]; // punto final
    if (p1 && p2) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const slope = dx !== 0 ? dy / dx : 0;
      // Altura en x=focoParaxial
      transversal = p1.y + slope * (focoParaxial - p1.x);
    }
  }

  return { focoParaxial, focoMarginal, longitudinal, transversal };
}

/**
 * Resultado de aberración cromática para una longitud de onda.
 */
export interface ResultadoCromatico {
  /** Longitud de onda (nm). */
  lambda: number;
  /** Posición del foco para esta λ (metros). */
  foco: number;
}

/**
 * Calcula la aberración cromática longitudinal de una lente.
 *
 * Método: para cada λ, calcula n(λ) con Sellmeier, construye la lente
 * con `f_builder(n)` (p.ej. ecuación del fabricante de lentes), y computa
 * el foco paraxial. La dispersión del foco con λ es la aberración cromática.
 *
 * Para una lente convergente simple, el foco azul (λ pequeña, n mayor)
 * cae MÁS CERCA que el rojo.
 *
 * @param f_builder   Función que dado n devuelve f (lensmaker equation).
 * @param material    Material del vidrio.
 * @param s           Distancia objeto (metros, >0).
 * @param lambdas     Array de longitudes de onda (nm).
 */
export function aberracionCromatica(
  f_builder: (n: number) => number,
  material: MaterialOptico,
  s: number,
  lambdas: number[]
): ResultadoCromatico[] {
  return lambdas.map(lambda => {
    const n = nSellmeier(material, lambda);
    const f = f_builder(n);
    const lente: LenteDelgada = { f };
    const { sPrima } = imagenParaxialLente(s, lente);
    return { lambda, foco: sPrima };
  });
}
