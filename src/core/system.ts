// Sistema óptico: lista ordenada de elementos sobre el eje.
// Produce la matriz ABCD del sistema completo y traza polilíneas de rayos.
import type { Mat2, Ray, RaySegment } from './types';
import { compose, applyToRay, translation } from './abcd';

/**
 * Elemento óptico en el banco.
 * posZ: posición sobre el eje óptico (metros).
 * matrix: su matriz ABCD.
 */
export interface OpticalElement {
  posZ: number;
  matrix: Mat2;
}

/**
 * Sistema óptico = lista de elementos ordenados por posZ.
 */
export type System = OpticalElement[];

/**
 * Matriz ABCD del sistema completo (incluyendo traslaciones entre elementos).
 * Los elementos deben estar ordenados por posZ.
 */
export function systemMatrix(system: System): Mat2 {
  if (system.length === 0) {
    return [[1, 0], [0, 1]]; // identidad
  }

  // Construye la lista de matrices: traslación + elemento para cada uno
  const matrices: Mat2[] = [];
  let zActual = 0;

  for (const elemento of system) {
    const d = elemento.posZ - zActual;
    if (d > 0) {
      matrices.push(translation(d));
    }
    matrices.push(elemento.matrix);
    zActual = elemento.posZ;
  }

  return compose(...matrices);
}

/**
 * Traza un rayo a través del sistema y devuelve la polilínea (z, y, theta)
 * en cada punto significativo (inicio, por cada elemento, y al final si se
 * especifica zFinal).
 * @param system - elementos ordenados por posZ
 * @param ray - rayo inicial en z=0
 * @param zFinal - posición final de la traza (opcional, default = última posZ + 0.1)
 */
export function traceRay(
  system: System,
  ray: Ray,
  zFinal?: number
): RaySegment[] {
  const segmentos: RaySegment[] = [];
  let zActual = 0;
  let rayActual = { ...ray };

  // Punto inicial
  segmentos.push({ z: zActual, y: rayActual.y, theta: rayActual.theta });

  for (const elemento of system) {
    const d = elemento.posZ - zActual;
    if (d > 0) {
      // Propagar hasta el elemento
      const M = translation(d);
      rayActual = applyToRay(M, rayActual);
      zActual = elemento.posZ;
      segmentos.push({ z: zActual, y: rayActual.y, theta: rayActual.theta });
    }
    // Aplicar el elemento
    rayActual = applyToRay(elemento.matrix, rayActual);
    segmentos.push({ z: zActual, y: rayActual.y, theta: rayActual.theta });
  }

  // Extender hasta zFinal
  const ultimoPosZ = system.length > 0
    ? (system[system.length - 1]?.posZ ?? 0)
    : 0;
  const zFin = zFinal ?? (ultimoPosZ + 0.1);

  if (zFin > zActual) {
    const d = zFin - zActual;
    rayActual = applyToRay(translation(d), rayActual);
    segmentos.push({ z: zFin, y: rayActual.y, theta: rayActual.theta });
  }

  return segmentos;
}
