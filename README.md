<div align="center">
  <img src="public/banner.png" alt="Lumina Banner" width="100%" style="max-width: 800px; border-radius: 8px;" />

  # Lumina

  *Óptica paraxial: matrices ABCD, trazado de rayos y propagación de haces gaussianos. Del colegio a la universidad.*

  [![Pharos Project](https://img.shields.io/badge/Pharos_Project-Ecosistema-f5a72c?style=flat-square)](https://kegouro.github.io)
  ![Estado](https://img.shields.io/badge/Estado-En_Construcción-ff7a3c?style=flat-square)
  ![Licencia](https://img.shields.io/badge/Licencia-MIT-38bdf8?style=flat-square)
</div>

<br />

**Lumina** es un curso-laboratorio interactivo web de física diseñado para guiar a estudiantes desde los conceptos más básicos de la luz hasta la óptica matricial de nivel universitario (matrices ABCD y propagación de haces gaussianos). 

No es simplemente un simulador aislado ni un libro de texto estático; es un ecosistema educativo donde cada concepto teórico se acompaña de explicaciones visuales de primer nivel ("rigor visualizado") y desbloquea herramientas interactivas que expanden de forma persistente tu banco óptico personal.

---

## 🚀 Principios del Proyecto

1. **Híbrido de Historia y Laboratorio:** Cada capítulo introduce una idea física que, al ser comprendida y resuelta, desbloquea un instrumento óptico o una herramienta que se conserva para el resto del curso y para el modo de laboratorio libre.
2. **Doble Carril Visual:** Un carril enfocado en la **intuición física** convive con un carril profundo de **rigor formal universitario** (deducciones y matemáticas). El rigor no es solo texto: tiene sus propias animaciones y visualizaciones interactivas.
3. **Estética Científica Rigurosa:** Inspirado en los instrumentos clásicos de metal y vidrio (latón, bronce) combinados con la luminiscencia de los laboratorios modernos. Toda la física (trazado de rayos exacto frente a paraxial, perfiles gaussianos de haces y refracción cromática) está modelada con rigor científico y colorimetría CIE real.
4. **Enfoque Static-First e Independiente:** Diseñado como una PWA (Progressive Web App) estática que corre enteramente en el cliente y funciona offline, permitiendo su uso en aulas o laboratorios sin acceso estable a Internet.

---

## 🗺️ Estructura del Curso

El viaje didáctico de Lumina se divide en cuatro actos temáticos más una coda de cierre:

* **Acto I — La luz como rayo (Óptica Geométrica):**
  El principio de Fermat, propagación rectilínea, reflexión (espejos planos), refracción (ley de Snell exacta), dispersión cromática (prismas) y formación de imágenes (lentes delgadas y espejos curvos).
* **Acto II — La luz como onda (Óptica Ondulatoria):**
  Frentes de onda, principio de Huygens, interferencia (experimento de Young de doble rendija), difracción (redes y rendijas) y la física detrás del cielo azul (dispersión de Rayleigh).
* **Acto III — La luz tiene orientación (Polarización):**
  Polarización lineal y circular, ley de Malus y formalismo matemático de las matrices de Jones para láminas de retardo de onda ($\lambda/2$ y $\lambda/4$).
* **Acto IV — La óptica se vuelve matrices (Óptica Paraxial/Matricial):**
  La aproximación paraxial, trazado matricial por matrices ABCD para sistemas multielemento complejos, y propagación de haces gaussianos con el parámetro complejo $q$.
* **Coda — La luz es más rara de lo que crees:**
  Naturaleza dual onda-partícula y una introducción conceptual al fotón.

---

## 🛠️ Guía del Desarrollador

Este proyecto está construido sobre TypeScript puro en su núcleo óptico (`src/core/`), Canvas 2D en el motor de renderizado primario (`src/render/`), y Vite como empaquetador rápido de frontend.

### Requisitos Previos
- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- `npm` (incluido con Node.js)

### Instalación de Dependencias
Clona el repositorio e instala los paquetes necesarios:
```bash
npm install
```

### Servidor de Desarrollo
Para levantar el servidor de desarrollo local con recarga en vivo (HMR):
```bash
npm run dev
```
Abre tu navegador en `http://localhost:5173` para interactuar con la aplicación.

### Construcción para Producción
Para compilar y empaquetar la aplicación optimizada para producción:
```bash
npm run build
```
Los archivos de distribución se generarán en la carpeta `dist/`.

### Pruebas Unitarias
El núcleo físico (`src/core/`) está cubierto por pruebas analíticas rigurosas para validar ecuaciones y comportamientos ópticos (Vitest):
```bash
npm run test
```

---

## 🎨 Identidad Visual y Diseño

Para conocer los códigos Hex de color, las fuentes y los principios de renderizado visual del banco de óptica, consulta la guía en [graphic_kit.md](docs/graphic_kit.md).

---

## 📄 Créditos y Licencia

- **Autor:** José Labarca Baeza ([@kegouro](https://github.com/kegouro))
- **Proyecto:** Parte del **Pharos Project** — infraestructura científica y educativa sin barreras de entrada.
- **Licencia:** MIT (ver archivo [LICENSE](LICENSE) para más detalles).
