// Diccionario español (idioma por defecto)
export const es = {
  // Interfaz general
  'app.title': 'Lumina',
  'app.subtitle': 'curso-laboratorio de óptica',

  // Menú de inicio
  'menu.historia': 'Historia',
  'menu.laboratorio': 'Laboratorio',
  'menu.continuar': 'Continuar',
  'menu.ruta.pedagogica': 'Ruta pedagógica',
  'menu.ruta.historica': 'Ruta histórica',
  'menu.lab.proximamente': 'Próximamente',

  // Idioma
  'lang.es': 'Español',
  'lang.en': 'English',

  // HUD
  'hud.matriz': 'Matriz ABCD',
  'hud.haz': 'Parámetros del haz',
  'hud.elemento': 'Elemento seleccionado',
  'hud.n1': 'n₁',
  'hud.n2': 'n₂',
  'hud.theta1': 'θ₁',
  'hud.theta2': 'θ₂',
  'hud.tir': 'Reflexión total interna',
  'hud.plegar': 'Plegar',
  'hud.desplegar': 'Desplegar',

  // Física
  'fisica.rayo': 'Rayo',
  'fisica.lente': 'Lente delgada',
  'fisica.espejo': 'Espejo',
  'fisica.interfaz': 'Interfaz',
  'fisica.focal': 'Distancia focal',
  'fisica.cintura': 'Cintura del haz',
  'fisica.paraxial.aviso': 'Salimos del reino paraxial; el modelo matricial pierde validez.',

  // Refracción — escena cinematográfica
  'refraccion.frase': 'La luz entra al agua… y se dobla.',
  'refraccion.titulo': 'Refracción',
  'refraccion.intuicion': 'La luz cambia de velocidad al cruzar la interfaz. Cuanto más brusco el cambio de índice, más se dobla el rayo.',
  'refraccion.deduccion.titulo': 'Ley de Snell',
  'refraccion.deduccion.texto': 'n₁ sin θ₁ = n₂ sin θ₂',
  'refraccion.deduccion.derivacion': 'El principio de Fermat exige que el tiempo de viaje sea estacionario. Igualar las derivadas del tiempo respecto al punto de cruce conduce a n₁ sin θ₁ = n₂ sin θ₂.',
  'refraccion.deduccion.ver': 'Ver deducción',
  'refraccion.deduccion.ocultar': 'Ocultar deducción',
  'refraccion.comenzar': 'Explorar el banco',

  // Fermat
  'fermat.titulo': 'Desafío de Fermat',
  'fermat.instruccion': 'Arrastra el punto P sobre la interfaz para minimizar el tiempo de viaje.',
  'fermat.tiempo': 'Camino óptico',
  'fermat.minimo': '¡Tiempo mínimo! — esto es la ley de Snell',
  'fermat.unidades': 'u.a.',

  // Banco óptico
  'bench.n1.label': 'Medio 1 (n₁)',
  'bench.n2.label': 'Medio 2 (n₂)',
  'bench.arrastrar': 'Arrastra el rayo para cambiar el ángulo de incidencia',
  'bench.tir.aviso': 'Reflexión total interna — el rayo no cruza la interfaz',

  // Desbloqueo
  'desbloqueo.interfaz': '¡Herramienta desbloqueada: Interfaz/Medio!',
  'desbloqueo.descripcion': 'Ahora puedes añadir interfaces con distintos índices en el banco libre.',
} as const;
