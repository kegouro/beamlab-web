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

  // Language
  'lang.es': 'Español',
  'lang.en': 'English',

  // HUD
  'hud.matriz': 'ABCD Matrix',
  'hud.haz': 'Beam parameters',
  'hud.elemento': 'Selected element',

  // Physics
  'fisica.rayo': 'Ray',
  'fisica.lente': 'Thin lens',
  'fisica.espejo': 'Mirror',
  'fisica.interfaz': 'Interface',
  'fisica.focal': 'Focal length',
  'fisica.cintura': 'Beam waist',
  'fisica.paraxial.aviso': 'We have left the paraxial regime; the matrix model loses validity.',
};
