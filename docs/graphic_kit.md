# Kit Gráfico — Lumina (Pharos Project)

Este documento define la identidad visual, la paleta de colores, la tipografía y los principios de diseño de **Lumina**. Sirve como guía para mantener la coherencia estética en toda la interfaz de la aplicación, el banco óptico y los materiales de difusión.

---

## 1. Filosofía de Diseño: "Óptica Clásica y Rigor Moderno"

Lumina no es un simulador frío y plano ni un videojuego infantil. Su estética está inspirada en los **instrumentos ópticos antiguos de bronce, latón y vidrio**, combinada con la **precisión vectorial y luminiscente** de los laboratorios modernos.

- **Fondo Absoluto:** Todo nace desde la oscuridad profunda de un laboratorio óptico (`#0a0908`).
- **Luz Física:** La luz no se dibuja como líneas de colores planos y sólidos, sino como **haces con perfiles de intensidad orgánicos** (gradientes gaussianos) y **brillos sutiles**.
- **Cristal y Metal:** Los paneles de la interfaz (HUD) flotan sobre la escena como láminas de cristal pulido, con bordes que reflejan la luz y textos en tonos crema suaves.

---

## 2. Paleta de Colores (Tokens de Diseño)

Los colores en Lumina no son decorativos; tienen un **significado físico y temático estricto** que guía al estudiante a través de la interfaz.

### Fondos y Superficies
| Token | Valor Hex | Uso Principal |
| :--- | :--- | :--- |
| `--color-night` | `#0a0908` | Fondo de la aplicación, vacío del laboratorio. |
| `--color-panel` | `#15110d` | Fondo de paneles flotantes, modales y tarjetas del HUD. |
| `--color-linea` | `#2a2118` | Bordes de paneles, guías y retículas técnicas de calibración. |

### Tipografía y Lectura
| Token | Valor Hex | Uso Principal |
| :--- | :--- | :--- |
| `--color-ink` | `#efe7d8` | Texto principal, lectura cómoda sobre fondo oscuro. |
| `--color-muted` | `#9a8a76` | Subtítulos, textos explicativos secundarios y etiquetas de unidades. |

### Acentos de Marca
| Token | Valor Hex | Uso Principal |
| :--- | :--- | :--- |
| `--color-beam` | `#f5a72c` | Ámbar corporativo, tono principal de marca. |
| `--color-ember` | `#ff7a3c` | Naranja/cobre para alertas, focos e indicadores de error físico. |
| `--color-gold` | `#ffd690` | Oro suave para resaltar términos clave, ecuaciones y logros. |

### Acentos por Dominio Físico
| Dominio | Token | Valor Hex | Representación Visual |
| :--- | :--- | :--- | :--- |
| **Óptica Geométrica** | `--color-rayo` | `#f5a72c` | Rayos de luz discretos (óptica de aproximación). |
| **Haces Gaussianos** | `--color-haz` | `#34d399` | Perfil e intensidad del haz láser (verde esmeralda). |
| **Óptica Ondulatoria** | `--color-onda` | `#38bdf8` | Patrones de interferencia, fases y frentes de onda (cian). |

---

## 3. Tipografía

La jerarquía de fuentes combina la elegancia literaria con la precisión matemática:

1. **Display / Narración (Serif):** `Fraunces`
   - *Uso:* Títulos de capítulos, frases poéticas introductorias y números de acto grandes.
   - *Características:* Peso ligero (300/400), elegante, con remates clásicos que recuerdan a tratados científicos del siglo XIX.
2. **Interfaz / Lectura (Sans-Serif):** `Inter`
   - *Uso:* Textos de botones, explicaciones físicas detalladas, descripciones y controles.
   - *Características:* Alta legibilidad a tamaños pequeños, limpia, neutral.
3. **Datos / Matemáticas (Monospace):** `IBM Plex Mono`
   - *Uso:* Coordenadas del riel óptico, matrices ABCD, valores numéricos de focal ($f$), índices de refracción ($n$), longitudes de onda ($\lambda$), etc.
   - *Características:* Rigurosa, técnica, ideal para alinear números y representar álgebra matricial.

---

## 4. Recursos Visuales (Assets del Repositorio)

Los recursos visuales de Lumina se encuentran en la carpeta `public/` y se dividen en formatos vectoriales (`.svg`) y de alta resolución (`.png`):

### 4.1 El Isotipo / Logo (`public/icon.svg`)
Un vector circular ultra-preciso que condensa la física de Lumina. Muestra un haz de luz dorada incidente que se refracta en un prisma de latón tridimensional y se dispersa en las tres líneas de color correspondientes a los dominios temáticos del curso (Ámbar, Verde y Cian), todo sobre una retícula graduada de laboratorio óptico.

### 4.2 Banners del Repositorio
- **Banner Vectorial (`public/banner.svg`):** Pensado para su uso en la cabecera del `README.md` y en páginas web del ecosistema. Contiene el nombre del proyecto en tipografía *Fraunces* y muestra cómo el haz dispersado por el prisma cruza una lente delgada para converger en un foco común.
- **Banner de Alta Resolución (`public/banner.png`):** Imagen con acabado premium generada mediante IA que captura la materialidad de los elementos ópticos de vidrio y metal en un entorno de laboratorio oscuro, ideal para previews de redes sociales o la landing principal de Pharos.

---

## 5. Directrices del Render de Física (Banco Óptico)

Al programar el Canvas2D o la capa de shaders, los elementos ópticos deben seguir estas reglas visuales:

- **Rayos de Luz:** Nunca deben tener un grosor mayor a `1.5px` sólidos. Para dar sensación de luz, se dibuja debajo un trazado idéntico con un grosor de `6px` a `10px` con color semitransparente (opacidad `0.15` a `0.3`) simulando el brillo dispersado por el aire.
- **Lentes y Prismas:** Se dibujan con bordes finos en `--color-muted` (`#9a8a76`) con una opacidad del `60%`, y un relleno muy tenue de color `--color-panel` (`#15110d`) con opacidad del `30%` para simular la refracción del vidrio.
- **Focos y Líneas de Referencia:** Las líneas de alineación técnica deben usar `--color-linea` (`#2a2118`) con estilo discontinua (`stroke-dasharray`). Los focos geométricos se marcan con un pequeño círculo relleno de `--color-gold` (`#ffd690`).
