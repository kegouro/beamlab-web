// Tipos fundamentales del motor óptico de Lumina

/**
 * Rayo en el plano meridional 2D.
 * y: altura respecto al eje óptico (metros en SI, o unidades arbitrarias).
 * theta: ángulo respecto al eje óptico (radianes, positivo hacia arriba).
 */
export interface Ray {
  y: number;
  theta: number;
}

/**
 * Matriz 2×2 real para óptica matricial ABCD.
 * Representada como [[A, B], [C, D]].
 */
export type Mat2 = [[number, number], [number, number]];

/**
 * Número complejo para el parámetro q gaussiano.
 */
export interface Complex {
  re: number;
  im: number;
}

/**
 * Resultado de propagación de un rayo a través del sistema.
 * Cada entrada es la altura y el ángulo en una posición a lo largo del eje z.
 */
export interface RaySegment {
  z: number;   // posición axial
  y: number;   // altura
  theta: number; // ángulo
}

/**
 * Resultado de refracción con indicador de reflexión total interna.
 */
export interface RefractResult {
  theta: number; // ángulo refractado (igual al incidente si hay TIR)
  tir: boolean;  // true = reflexión total interna
}
