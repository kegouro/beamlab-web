# Lumina — Diseño

- **Fecha:** 2026-06-24
- **Autor:** José Labarca Baeza (kegouro)
- **Estado:** Diseño aprobado en brainstorming · pendiente de revisión del autor antes del plan de implementación
- **Repo destino:** `kegouro/lumina` (hoy `kegouro/beamlab-web`, a renombrar)
- **Ecosistema:** Pharos Project — nivel didáctico, hermano de Parcella y Curvana

---

## 1. Qué es Lumina

Un **curso-laboratorio web de óptica**, que enseña desde 0 hasta **óptica matricial universitaria** (matrices ABCD y haces gaussianos). No es una simulación suelta ni un libro: es una **historia donde aprendes la física y la juegas en vivo**. Aprendes un concepto → **desbloqueas una herramienta** que queda en tu banco óptico, que crece contigo hasta volverse un laboratorio completo.

Una frase: *Mira la luz. Entiende lo que ves. Juega con ella.*

---

## 2. Principios rectores (no negociables)

1. **Híbrido historia ↔ juego.** Cada capítulo enseña y desbloquea una herramienta jugable que persiste. Lo lineal (aprender) y lo abierto (jugar) conviven.
2. **Doble carril, ambos visuales.** Hay un carril de **intuición** y un carril de **rigor universitario** (deducciones formales). El rigor **no es un addon de texto**: tiene sus propias **animaciones y explicaciones visuales de primera clase**. "Rigor visualizado".
3. **Voz poética sutil, nunca cursi.** El asombro lo carga la física, no los adjetivos. Hilo conductor: *la luz es el mensajero entre el mundo y la mente, y es más extraño y bello de lo que los sentidos confiesan* — el fotón que no es ni onda ni partícula, el color que no está en la luz sino en ti, el mundo que se escapa de nuestros sentidos. Sutil, elegante, sin caer en lo sentimental.
4. **Cinemática, dinámica, hermosa — y a la vez didáctica y elegante.** Animaciones de primera, transiciones con intención, capa de shaders donde brilla. La belleza y el rigor en el mismo gesto. La motion no es decorado: es un subsistema de primera clase.
5. **Disciplina de arquitectura Pharos.** `core/` puro y testeable ↔ `render/` ↔ `ui/` ↔ `app.ts`. `ui/` y `render/` dependen de `core/`, nunca al revés.

---

## 3. Audiencia y alcance

- **Audiencia:** desde el auto-aprendiz "desde 0" hasta el universitario de ciencias/ingeniería. El doble carril sirve a ambos sin bifurcar el producto.
- **Meta final:** el alumno llega a entender y operar la **óptica matricial** (ABCD) y los **haces gaussianos**, y a usar un laboratorio óptico libre.
- **Alcance de contenido:** **óptica completa** (v1 grande), no solo la línea del haz. Dos clímax matriciales: **matrices de Jones** (polarización) y **matrices ABCD** (rayos) — "la óptica se vuelve matrices", por partida doble.

---

## 4. Identidad y lugar en Pharos

- **Nombre:** **Lumina** (una palabra, evocadora — luz —, hermano de Parcella y Curvana). Elimina la confusión con `BeamLabStudio`, la herramienta pesada de escritorio (C++/Qt) que es el nivel de *instrumentación* y queda intacta.
- **Idioma:** español primario + toggle a inglés (estándar del ecosistema).
- **Marca:** kit gráfico Pharos (cálido sobre negro). Tokens en §8.

**Tareas de setup derivadas** (se ejecutan con OK explícito del autor, no parte de la implementación de features):
- Renombrar repo `kegouro/beamlab-web → kegouro/lumina` y carpeta local.
- Actualizar la tarjeta de la app en la landing de Pharos (`kegouro.github.io`): nombre, descripción, enlaces.
- Crear `refs/` para los libros de referencia del autor (Hecht, Pedrotti, Saleh & Teich, etc.).

---

## 5. Estructura del producto

### 5.1 Menú de inicio
Punto de entrada. Permite elegir:
- **Modo Historia** (por defecto), con sub-elección de **ruta**: *pedagógica* (la nuestra) o *histórica* (curiosidad).
- **Modo Laboratorio** (banco libre con instrumentos).
- Continuar donde lo dejaste (progresión persistente).
- Toggle de idioma ES/EN.

### 5.2 Modo Historia — dos rutas sobre el mismo contenido
El contenido se modela como un **grafo de módulos** (cada módulo = un concepto autocontenido, con prerequisitos y la herramienta/instrumento que desbloquea). Una **ruta** es solo un **orden + un marco narrativo** sobre esos módulos. Esto hace barata la segunda ruta.

- **Ruta pedagógica (default):** rayo → onda → polarización (Jones) → matricial (ABCD/gaussianos). Optimizada para aprender.
- **Ruta histórica (curiosidad):** los mismos módulos reordenados por fecha de descubrimiento, con "cartas de época". Arco:
  Herón/Euclides (reflexión, ~300 a.C.) → Alhacén (cámara oscura, visión, ~1021) → Snell & Descartes (refracción, arcoíris, 1621–1637) → Fermat (tiempo estacionario, 1662) → Newton (prisma y color, 1672) → Huygens (onda, 1678) → Young (interferencia, 1801) → Malus (polarización, 1809) → Fresnel (difracción, 1818) → Maxwell (luz = onda EM, 1865) → Rayleigh (cielo azul, 1871) → Planck/Einstein (el fotón, 1900–1905) → Kogelnik & Li + el láser (óptica matricial y gaussianos, 1960–1966).

Presentación (Modo Historia): **escenas cinematográficas a pantalla completa** que en el momento clave se **transforman en el banco interactivo**; el laboratorio es la recompensa de cada idea. Aquí vive el aire poético.

### 5.3 Modo Laboratorio (sandbox)
Un **laboratorio óptico libre** para **calcular · planear · simular**. No es "el banco sin historia": es una herramienta de verdad.
- **Instrumentos de medición** (se desbloquean junto a su concepto; en el lab libre tienes los que ya ganaste): regla/escala, goniómetro (ángulos), medidor de potencia, perfilómetro de haz (w(z), M²), pantalla/sensor de intensidad (perfil I(x)), espectrómetro, polarímetro, cámara/ojo virtual.
- **Calcular:** matriz del sistema, posición y aumento de la imagen, focal efectiva, planos principales, cintura del haz, estabilidad de cavidad.
- **Planear/compartir:** arrastrar y guardar montajes; estado serializado en la URL (como Parcella); export PNG/GIF.
- **El lab crece con lo que sabes:** el espectrómetro aparece tras "dispersión", el polarímetro tras "Jones", el perfilómetro tras "gaussianos", etc.

### 5.4 HUD flotante
Instrumento de lectura en el banco: paneles de **cristal arrastrables y plegables** sobre la escena (matriz ABCD, parámetros del haz w₀/z_R, controles del elemento seleccionado). Inmersivo, coherente con el Modo Laboratorio. El carril profundo (deducción formal) se abre desde aquí o desde la narrativa.

### 5.5 Progresión y persistencia
- Estado de **desbloqueos** (herramientas e instrumentos) y **avance por capítulo**, route-agnóstico (completar un módulo desbloquea su herramienta en cualquier ruta).
- Guardado **local** (IndexedDB) → funciona offline (PWA).

---

## 6. Currículo

Cuatro actos en la ruta pedagógica, con el hilo poético recorriéndolos. Cada capítulo: intuición visual + deducción formal animada + herramienta/instrumento desbloqueado. El detalle fino de cada capítulo se afinará con los libros del autor (`refs/`).

**Acto I — La luz como rayo (óptica geométrica)**
- Principio de Fermat (cimiento: tiempo estacionario).
- El rayo de luz (propagación recta; sombras; cámara oscura) → fuente + rayo.
- Reflexión (espejos planos) → espejo plano.
- Refracción (Snell, índice, reflexión total interna / fibra) → interfaz/medio.
- Dispersión y color (n(λ); prisma, arcoíris; el color como ilusión perceptiva) → espectrómetro.
- Lentes y espejos curvos (focos, formación de imágenes, ecuación de lentes) → lente delgada + espejo curvo.
- Aberraciones (esférica, cromática, coma): el mundo real más allá de lo paraxial.
- Instrumentos (ojo, lupa, microscopio, telescopio) → sistema multi-elemento.

**Acto II — La luz como onda (óptica ondulatoria)** *(usa la capa de shaders)*
- La luz es onda (frente de onda, Huygens, longitud de onda, fase) → fuente coherente.
- Interferencia (Young, doble rendija, coherencia) → rendijas + pantalla de intensidad.
- Películas delgadas (colores de pompa, antirreflejo).
- Difracción (rendija simple, redes, límite de resolución) → red de difracción.
- Dispersión de Rayleigh (por qué el cielo es azul).

**Acto III — La luz tiene orientación (polarización)**
- Polarización (lineal y circular; ley de Malus) → polarizador + polarímetro.
- Matrices de Jones (★ primer clímax matricial; láminas de onda λ/4, λ/2) → retardadores.

**Acto IV — La óptica se vuelve matrices (paraxial/matricial)**
- La aproximación paraxial (ángulos pequeños; el vector de rayo (y, θ)).
- Matrices ABCD (★ segundo clímax; traslación/refracción/lente como matrices; sistemas = producto) → bloque ABCD.
- Sistemas ópticos (matriz de sistema, planos principales, lente gruesa).
- Haces gaussianos (cintura w(z), radio R(z), parámetro q, ley ABCD para q) → láser + perfilómetro.
- Cavidades y estabilidad (resonadores; criterio de estabilidad); láseres e interferómetros (emisión estimulada; Michelson, Fabry-Perot).

**Coda — La luz es más rara de lo que crees**
- Naturaleza onda-partícula y el fotón; el mundo que se escapa de los sentidos. Cierre del hilo poético (clásico → cuántico como horizonte, sin pretender un curso de cuántica).

**Capstone:** el Laboratorio libre completo — armas cualquier sistema y ves, en vivo y a la vez, los rayos, el haz gaussiano y la matriz del sistema, con todos los instrumentos.

---

## 7. Arquitectura técnica

Decisión: **núcleo TS puro + render 2D nítido (Canvas/SVG), con una capa WebGL/shaders donde de verdad brilla** (campos ondulatorios en tiempo real y escenas cinematográficas). La óptica es esencialmente 2D (eje óptico, rayos en plano meridional, envolvente del haz, franjas), por eso 2D es el render primario y Three.js sería sobredimensionado.

```
src/
  core/              # TS PURO, sin DOM ni render — 100% testeable (Vitest)
    ray              # rayo (y, θ) en plano meridional; trazado por superficies
    abcd             # matrices ABCD: traslación, refracción plana/curva, lente
                     #   delgada/gruesa, espejo; composición; matriz de sistema;
                     #   planos principales
    gaussian         # parámetro complejo q; w(z), R(z), z_R; ley ABCD para q; cintura
    jones            # vectores/matrices de Jones; polarizador, retardador, rotador;
                     #   elipse de polarización
    wave             # interferencia (Young), películas delgadas, difracción
                     #   (rendija, red); patrón de intensidad; FFT de Fraunhofer
    dispersion       # n(λ) (Cauchy/Sellmeier); color/espectro; Rayleigh (∝ 1/λ⁴)
    element          # modelo de elemento óptico (tipo, posición en el riel, parámetros)
    system           # el banco = lista ordenada de elementos en el eje; produce
                     #   matriz, traza rayos, propaga q, calcula imagen
    measure          # cálculos de instrumentos (potencia, perfil, espectro, polariz.)
    progression      # grafo de módulos, rutas (pedagógica/histórica), desbloqueos
    colors           # paleta por dominio (rayos ámbar, haz verde, ondas cian)
  render/
    render2d         # Canvas2D: banco, rayos, envolvente gaussiana, instrumentos
    glfields         # WebGL/shaders: campos de interferencia/difracción, cinematics
    labels           # overlay DOM + KaTeX para fórmulas y rótulos nítidos
  ui/
    startmenu        # Historia (ruta) / Laboratorio / continuar / idioma
    story            # escenas cinematográficas, narrativa, carril profundo plegable
    hud              # paneles de cristal arrastrables/plegables
    lab              # panel de instrumentos, calcular/planear, guardar/compartir
    i18n             # ES/EN
  services/          # compartir por URL, export PNG/GIF, persistencia (IndexedDB)
  cinematics/        # subsistema de motion: timeline, easing, transiciones escena↔banco
  app.ts             # orquesta ui ↔ core ↔ render
```

**Subsistema cinematics:** timeline declarativo + easing + orquestación de transiciones (escena → banco, desbloqueos, reveals de deducción). De primera clase, reutilizable, con respeto a `prefers-reduced-motion`.

---

## 8. Motor de óptica y validación

- **Convención:** plano meridional 2D; rayo = (altura y, ángulo θ) respecto al eje óptico; sistema = producto de matrices ABCD en orden de propagación.
- **Gaussianos:** parámetro complejo q con la misma ley ABCD que los rayos (1/q = 1/R − iλ/(πw²)).
- **Jones:** estados como 2-vectores complejos; elementos como matrices 2×2.
- **Ondulatoria:** patrones analíticos donde existan (Young, red, rendija — Fraunhofer); FFT para casos generales; render del campo en shader.
- **Validación (Vitest):** el `core/` se contrasta con **resultados analíticos conocidos** (focal de lente delgada, imagen por ecuación de Gauss, M de un telescopio, w(z) de un gaussiano, ley de Malus, posición de máximos de Young/red, estabilidad de cavidad). Mismo espíritu con que Parcella se valida contra SymPy.

**Tokens de marca (Pharos, cálido sobre negro):** night `#0a0908`, panel `#15110d`, línea `#2a2118`, ink `#efe7d8`, muted `#9a8a76`, beam/ámbar `#f5a72c`, ember `#ff7a3c`, gold `#ffd690`. Acentos por dominio: rayos ámbar, haz gaussiano verde `#34d399`, ondas cian `#38bdf8`. Fuentes: Fraunces (display) + Inter (texto) + IBM Plex Mono (datos).

---

## 9. Plataforma

- **Web-first** en GitHub Pages.
- **PWA instalable y offline** (service worker + caché de recursos + estado en IndexedDB) — pensada para el aula sin conexión fiable.
- **Dispositivos:** escritorio y tablet optimizados (el banco necesita ancho); móvil responsive pero reducido.
- **Electron** de escritorio como fase posterior (patrón Parcella).
- **i18n** ES/EN desde el inicio.

---

## 10. Plan por fases

El alcance es grande; se decompone en fases, **cada una con su propio ciclo spec → plan → build**. Esta spec es el diseño maestro; cada fase tendrá su plan de implementación.

- **Fase 0 · Cimientos + rebanada vertical.** Scaffold (Vite/TS/PWA), arquitectura `core/render/ui/app`, tokens Pharos, i18n, banco 2D + HUD de cristal, motor mínimo (rayo + lente + ABCD de un elemento), persistencia base. **Un capítulo completo de punta a punta** (p. ej. "Lentes y espejos curvos"): historia → banco → desbloqueo → instrumento → tests. Valida TODO el pipeline antes de escalar.
- **Fase 1 · Acto I (geométrica).** Fermat, rayo, reflexión, refracción, dispersión/color, lentes/espejos, aberraciones, instrumentos. Ruta histórica habilitada para los módulos ya existentes.
- **Fase 2 · Acto IV (matricial/gaussiano).** El corazón "BeamLab": paraxial, ABCD completo, sistemas, haces gaussianos, cavidades, láseres/interferómetros.
- **Fase 3 · Acto II (ondulatoria) + capa de shaders.** Onda, interferencia, películas, difracción, redes, Rayleigh.
- **Fase 4 · Acto III (polarización/Jones).** Polarización, Malus, Jones, retardadores, polarímetro.
- **Fase 5 · Coda + capstone + pulido.** Onda-partícula/fotón, color-percepción; **Laboratorio libre completo** con todos los instrumentos; pulido de PWA offline; export/compartir; (Electron opcional).

*Nota:* el orden de **build** (front-load del motor) no es el orden **narrativo** (que lo fija cada ruta). Son independientes por el grafo de módulos.

---

## 11. Testing y calidad

- **Vitest** sobre `core/` con casos analíticos (§8).
- **Verificación visual** headless (Playwright) de escenas/banco, como en Parcella.
- **Calidad de motion:** transiciones con intención, 60 fps objetivo en el banco 2D, `prefers-reduced-motion` respetado, foco de teclado visible, responsive hasta tablet.
- **Accesibilidad de color:** la decodificación por color tiene refuerzo (forma/etiqueta) para no depender solo del tono.

---

## 12. Decisiones a afinar con los libros (`refs/`)

No son huecos del diseño, sino detalle de contenido que se concreta con las fuentes canónicas del autor:
- Profundidad y ejemplos exactos por capítulo; convenciones de signos en formación de imágenes.
- Modelo de `n(λ)` por material (Cauchy vs Sellmeier) y materiales incluidos.
- Selección de montajes "preset" del Laboratorio (telescopio, microscopio, expansor de haz, cavidad estable…).
- Alcance exacto de la coda cuántica (mantenerla como horizonte, sin convertirla en curso de cuántica).

---

## 13. Fuera de alcance (YAGNI por ahora)

- Óptica no lineal, óptica de cristales completa (más allá de polarización básica), óptica de Fourier avanzada, holografía: posibles módulos futuros, no en este diseño.
- Trazado de rayos 3D / skew rays riguroso: el plano meridional 2D cubre el curso; el 3D queda para florituras cinematográficas, no para cálculo.
- Cuentas/login, multiusuario, backend: la app es estática + persistencia local.

---

## 14. Refinamientos físicos y visuales (revisión crítica — incorporados)

Disección técnica que lleva el diseño de "muy bueno" a "obra de arte". Son **requisitos canónicos**, no opcionales.

### 14.1 Física y `core/`
- **Trazado exacto vs paraxial (distinción dura).** El Acto I traza con **Snell exacto** (`n₁ sin θ₁ = n₂ sin θ₂`), **nunca** con ABCD. ABCD vive solo en el Acto IV, bajo la aproximación paraxial.
- **Indicador de paraxialidad.** En modo ABCD, si el rayo se aleja del régimen paraxial (ángulo grande), aviso visual: *"Salimos del reino paraxial; el modelo matricial pierde validez."* Esa fricción es donde ocurre el aprendizaje.
- **Parámetro `q` con cuidado numérico.** Al derivar `w(z)` y `R(z)` de `Im(1/q)`, manejar las ramas de la función compleja; el paso por la cintura (`R → ∞`) no debe generar saltos ni `NaN`. Test explícito del cruce de cintura.
- **Fase de Gouy.** Incluir `Δφ = arctan(z/z_R)` en `core/gaussian`; es lo que hace posible la resonancia en una cavidad láser.
- **Difracción sin FFT ingenua.** Para patrones en tiempo real, usar **expresiones analíticas** de la intensidad (sinc² para rendija, series de Fresnel, Bessel para apertura circular) **evaluadas por-pixel en shader**. Reservar FFT para casos generales offline; evita aliasing, parpadeo y costo al variar parámetros en vivo.

### 14.2 Color y render (la luz tiene física estricta)
- **Colorimetría CIE real.** En dispersión (Acto I) y la Coda, mapear `λ → XYZ` (funciones de igualación CIE 1931) `→ sRGB` con manejo de *gamut*, en `core/colors`. Nada de *lookup* RGB ingenuo: el prisma y el espectrómetro muestran color **físicamente correcto**.
- **Perfiles orgánicos.** El haz gaussiano se renderiza con su perfil de intensidad `I(r) = I₀ e^(−2r²/w²)` mediante gradientes, no dos líneas de envolvente. Antialiasing subpixel en el trazado de rayos.
- **La cuarta dimensión: el tiempo.** Al añadir o mover un elemento, un **pulso de propagación** sutil: el rayo "viaja" desde la fuente, se refleja, se refracta. Hace visible la causalidad óptica, baja la carga cognitiva y sube la sensación cinemática.

### 14.3 Rigor visualizado (animar lo abstracto)
- **Reificación matricial.** El vector de estado `(y, θ)` es un **objeto visual** que se transforma al cruzar un elemento; se anima la matriz **multiplicando** al vector (la refracción como *shear* geométrico del espacio del rayo). Las matrices y la transformada de Fourier son **movimientos geométricos**, no texto KaTeX.
- **Editor de Jones.** El usuario escribe el estado inicial `[Eₓ, E_y]ᵀ` y ve la estela del campo `E` modificarse al cruzar polarizadores/retardadores a lo largo del eje.
- **Scrubbing de fase temporal.** En el Laboratorio, un slider de fase `ωt` que mueve los frentes de onda y **rota la elipse de polarización** en vivo mientras se ajusta una lámina `λ/4`.

### 14.4 Estado y arquitectura
- **Completado = nodo del grafo, no pantalla.** El estado "desbloqueado/completado" se vincula al **concepto** (nodo del grafo de módulos), no a la UI. Aprender "Snell" por la ruta histórica lo marca completado en la pedagógica sin necesidad de *replay*. (Refuerza §5.5.)

### 14.5 Momentos "Aha!" (diseñados para provocar asombro)
- **Cavidad inestable que "explota".** Al mover los espejos, si `g₁g₂ ∉ [0,1]` el haz gaussiano se desborda visualmente —choca contra los bordes del banco, pierde potencia—. El dolor visual del sistema inestable enseña más que la desigualdad.
- **Desafío de Fermat.** El usuario mueve el punto de incidencia entre dos medios y ve una barra de "tiempo de viaje" minimizarse **justo** en el ángulo de Snell. Gamificación con propósito físico.

> **Veredicto de la revisión:** diseño 9/10. Para el 10: precisión numérica/física real (CIE, Gouy, exacto≠paraxial), conceptos abstractos animados (matrices y FT como movimiento), y que la física "sangre" cuando un sistema falla (inestable, no paraxial, polarización cruzada).
