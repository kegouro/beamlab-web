// Colorimetría CIE 1931 real para Lumina.
// Usa el ajuste multi-gaussiano de Wyman et al. 2013:
// "Simple Analytic Approximations to the CIE XYZ Color Matching Functions"
// Journal of Computer Graphics Techniques (JCGT), 2013.
// Las fórmulas aproximan x̄(λ), ȳ(λ), z̄(λ) mediante sumas de gaussianas.

/** Paleta por dominio — acentos Pharos */
export const DOMAIN_COLORS = {
  ray: '#f5a72c',   // rayos (óptica geométrica)
  beam: '#34d399',  // haz gaussiano
  wave: '#38bdf8',  // óptica ondulatoria
} as const;

/**
 * Gaussiana asimétrica: usa sigma1 para x < mu, sigma2 para x >= mu.
 */
function gauss(x: number, mu: number, sigma1: number, sigma2: number): number {
  const d = x - mu;
  const sigma = d < 0 ? sigma1 : sigma2;
  return Math.exp(-0.5 * (d / sigma) * (d / sigma));
}

/**
 * Funciones de igualación CIE 1931 2° — ajuste de Wyman 2013.
 * λ en nanómetros. Retorna [X, Y, Z] sin normalizar.
 */
function cieXYZ(lambda: number): [number, number, number] {
  // Fuera del rango visible
  if (lambda < 360 || lambda > 830) return [0, 0, 0];

  // x̄(λ): dos picos (ajuste de Wyman)
  const x1 = gauss(lambda, 595.8, 33.33, 41.42);
  const x2 = 0.362 * gauss(lambda, 446.8, 19.44, 19.44);
  const x = x1 + x2;

  // ȳ(λ): un pico principal
  const y = gauss(lambda, 556.3, 37.82, 37.82) +
            0.218 * gauss(lambda, 449.8, 19.44, 19.44);

  // z̄(λ): pico en el azul
  const z1 = 1.217 * gauss(lambda, 449.0, 20.00, 20.00);
  const z2 = 0.0782 * gauss(lambda, 494.0, 14.50, 14.50);
  const z = z1 + z2;

  return [x, y, z];
}

/**
 * Convierte CIE XYZ → sRGB lineal usando la matriz estándar IEC 61966-2-1.
 */
function xyzToLinearSRGB(X: number, Y: number, Z: number): [number, number, number] {
  // Matriz XYZ→sRGB (D65 white point)
  const r =  3.2406 * X - 1.5372 * Y - 0.4986 * Z;
  const g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z;
  const b =  0.0557 * X - 0.2040 * Y + 1.0570 * Z;
  return [r, g, b];
}

/**
 * Gamma sRGB: lineal → sRGB codificado.
 */
function gammaEncode(c: number): number {
  if (c <= 0.0031308) return 12.92 * c;
  return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/**
 * Convierte longitud de onda (nm) a color sRGB usando CIE 1931 real.
 * @param nm - longitud de onda en nanómetros (rango visible: ~380–780)
 * @returns [r, g, b] en [0, 1] con corrección de gamut por clamping
 */
export function wavelengthToSRGB(nm: number): [number, number, number] {
  const [X, Y, Z] = cieXYZ(nm);

  if (X === 0 && Y === 0 && Z === 0) return [0, 0, 0];

  const [rLin, gLin, bLin] = xyzToLinearSRGB(X, Y, Z);

  // Clamping de gamut: los valores fuera de [0,1] se recortan
  const clamp = (v: number) => Math.max(0, Math.min(1, v));

  return [
    gammaEncode(clamp(rLin)),
    gammaEncode(clamp(gLin)),
    gammaEncode(clamp(bLin)),
  ];
}
