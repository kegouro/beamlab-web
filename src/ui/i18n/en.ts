// English dictionary
import type { es } from './es';

// Tipo derivado para garantizar que EN tiene todas las claves de ES
export const en: Record<keyof typeof es, string> = {
  // General
  'app.title': 'Lumina',
  'app.subtitle': 'optics course-lab',

  // Start menu
  'menu.historia': 'Story',
  'menu.laboratorio': 'Lab',
  'menu.continuar': 'Continue',
  'menu.ruta.pedagogica': 'Pedagogical route',
  'menu.ruta.historica': 'Historical route',
  'menu.lab.proximamente': 'Coming soon',

  // Language
  'lang.es': 'Español',
  'lang.en': 'English',

  // HUD
  'hud.matriz': 'ABCD Matrix',
  'hud.haz': 'Beam parameters',
  'hud.elemento': 'Selected element',
  'hud.n1': 'n₁',
  'hud.n2': 'n₂',
  'hud.theta1': 'θ₁',
  'hud.theta2': 'θ₂',
  'hud.tir': 'Total internal reflection',
  'hud.plegar': 'Collapse',
  'hud.desplegar': 'Expand',

  // Physics
  'fisica.rayo': 'Ray',
  'fisica.lente': 'Thin lens',
  'fisica.espejo': 'Mirror',
  'fisica.interfaz': 'Interface',
  'fisica.focal': 'Focal length',
  'fisica.cintura': 'Beam waist',
  'fisica.paraxial.aviso': 'We have left the paraxial regime; the matrix model loses validity.',

  // Refraction — cinematic scene
  'refraccion.frase': 'Light enters water… and bends.',
  'refraccion.titulo': 'Refraction',
  'refraccion.intuicion': 'Light changes speed as it crosses the interface. The more abrupt the index change, the more the ray bends.',
  'refraccion.deduccion.titulo': "Snell's Law",
  'refraccion.deduccion.texto': 'n₁ sin θ₁ = n₂ sin θ₂',
  'refraccion.deduccion.derivacion': "Fermat's principle demands that travel time be stationary. Equating the time derivatives with respect to the crossing point yields n₁ sin θ₁ = n₂ sin θ₂.",
  'refraccion.deduccion.ver': 'Show derivation',
  'refraccion.deduccion.ocultar': 'Hide derivation',
  'refraccion.comenzar': 'Explore the bench',

  // Fermat
  'fermat.titulo': "Fermat's Challenge",
  'fermat.instruccion': 'Drag point P on the interface to minimize travel time.',
  'fermat.tiempo': 'Optical path',
  'fermat.minimo': "Minimum time! — this is Snell's law",
  'fermat.unidades': 'a.u.',

  // Optical bench
  'bench.n1.label': 'Medium 1 (n₁)',
  'bench.n2.label': 'Medium 2 (n₂)',
  'bench.arrastrar': 'Drag the ray to change the angle of incidence',
  'bench.tir.aviso': 'Total internal reflection — the ray does not cross the interface',

  // Unlock
  'desbloqueo.interfaz': 'Tool unlocked: Interface/Medium!',
  'desbloqueo.descripcion': 'You can now add interfaces with different indices in the free lab.',
};
