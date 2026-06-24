# Lumina — Fase 0 Oleada 2: Rebanada Vertical Refracción

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el flujo end-to-end del capítulo Refracción: menú de inicio → escena cinematográfica → banco óptico Canvas2D con Snell exacto + arrastre de ángulo + pulso de propagación → momento Aha de Fermat (barra de tiempo mínimo = objetivo que desbloquea la herramienta) → HUD de cristal con n₁/n₂/θ₁/θ₂/TIR → persistencia en localStorage — todo orquestado por `app.ts`.

**Architecture:** Vanilla TS estricto sin frameworks. `app.ts` es la fuente única de estado (`AppState`). El flujo de pantallas es lineal: startmenu → story → bench. El banco óptico vive en un `<canvas>` Canvas2D dibujado por `render2d/bench.ts`. El HUD flota como overlay DOM. El momento Aha de Fermat es una barra DOM adicional sobre el canvas. La persistencia guarda un registro `ConceptProgress` en `localStorage`. Cinematics maneja transiciones fade/scale con respeto a `prefers-reduced-motion`.

**Tech Stack:** TypeScript estricto · Canvas2D (sin Three.js) · CSS custom properties (tokens Pharos) · localStorage · vite-plugin-pwa ya configurado · Vitest para tests nuevos · KaTeX (CDN, ya en index.html) para la fórmula de Snell en el carril de deducción.

## Global Constraints

- Sin frameworks de UI — vanilla TS puro (sin React, Vue, Svelte).
- Comentarios en español.
- `strict: true`, `noUncheckedIndexedAccess: true` en tsconfig (ya activos).
- `core/` se importa pero NUNCA se modifica ni se crean archivos allí.
- Trazado exacto: usar `refract()` y `criticalAngle()` de `core/snell.ts` — nunca aproximación paraxial.
- Los colores de rayo usan `DOMAIN_COLORS.ray` (`#f5a72c`) de `core/colors.ts`.
- Tokens CSS de `src/styles/tokens.css` son fuente de verdad para colores y tipografía.
- `prefers-reduced-motion` respetado en todas las animaciones: `matchMedia('(prefers-reduced-motion: reduce)')`.
- Foco de teclado visible en todos los elementos interactivos (no quitar `outline`).
- Responsive hasta tablet (mínimo 768 px de ancho útil).
- NO hacer commit — el autor revisa antes.
- `npm run build` y `npm test` deben terminar en verde (los 32 tests existentes siguen pasando + los tests nuevos).
- No tocar ningún archivo bajo `src/core/` ni `src/core/__tests__/`.
- Las claves de i18n nuevas se añaden a `src/ui/i18n/es.ts` y `src/ui/i18n/en.ts` (el tipo en `en.ts` es `Record<keyof typeof es, string>`, por lo que ambos archivos deben estar sincronizados).

---

## Mapa de archivos

```
src/
  app.ts                                  (modificar — implementar AppState, init(), navegación)
  main.ts                                 (modificar — llamar a app.init())
  cinematics/
    index.ts                              (modificar — implementar fade(), scale(), runSequence())
  render/
    render2d/
      index.ts                            (modificar — re-exportar desde bench.ts)
      bench.ts                            (crear — Bench class: canvas2D, drawScene, interacción)
  ui/
    i18n/
      es.ts                               (modificar — añadir claves de refracción, HUD, Fermat)
      en.ts                               (modificar — ídem en inglés)
    startmenu/
      index.ts                            (modificar — mountStartMenu(): botones Historia/Lab/idioma)
    story/
      index.ts                            (modificar — mountStory(): escena + carril deducción)
    hud/
      index.ts                            (modificar — mountHUD(): panel glassmorphism arrastrable)
  services/
    persistence.ts                        (crear — saveProgress, loadProgress con localStorage)
    index.ts                              (modificar — re-exportar desde persistence.ts)
  styles/
    bench.css                             (crear — estilos del banco, HUD, Fermat bar)
```

**Archivos de test nuevos:**
```
src/
  render/render2d/__tests__/bench.test.ts       (crear — geometría y cálculo Fermat)
  services/__tests__/persistence.test.ts        (crear — saveProgress/loadProgress)
  ui/__tests__/startmenu.test.ts                (crear — mountStartMenu sin errores)
```

---

## Interfaces clave (contrato entre tareas)

```typescript
// app.ts — estado global
interface AppState {
  screen: 'menu' | 'story' | 'bench';
  lang: 'es' | 'en';
  n1: number;                // índice medio 1 (por defecto: 1.0 — aire)
  n2: number;                // índice medio 2 (por defecto: 1.33 — agua)
  thetaInc: number;          // ángulo de incidencia en radianes
  fermatMode: boolean;       // true = modo Fermat activo
  progress: ConceptProgress;
}

// services/persistence.ts
interface ConceptProgress {
  completados: string[];      // ids de conceptos completados, p. ej. ['refraccion']
  herramientasDesbloqueadas: string[]; // ids de herramientas desbloqueadas
}

// render/render2d/bench.ts
interface BenchConfig {
  canvas: HTMLCanvasElement;
  state: AppState;
  onAngleChange: (theta: number) => void;
  onFermatMinimo: () => void;           // llamado cuando P está en el mínimo óptico
}

// cinematics/index.ts
interface AnimOptions {
  duration: number;           // ms
  easing?: (t: number) => number;
}
```

---

## Task 1: i18n — claves de refracción, HUD y Fermat

**Files:**
- Modify: `src/ui/i18n/es.ts`
- Modify: `src/ui/i18n/en.ts`

**Interfaces:**
- Produce: claves de tipo `TranslationKey` que todas las tareas siguientes pueden usar con `t(key)`.

- [ ] **Step 1: Añadir claves en `es.ts`**

Abrir `/Users/kegouro/HIBRIS/Proyectos/lumina/src/ui/i18n/es.ts` y reemplazar el contenido completo por:

```typescript
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
```

- [ ] **Step 2: Sincronizar `en.ts`**

Reemplazar el contenido completo de `/Users/kegouro/HIBRIS/Proyectos/lumina/src/ui/i18n/en.ts`:

```typescript
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
  'fermat.minimo': 'Minimum time! — this is Snell\'s law',
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
```

- [ ] **Step 3: Verificar que el tipo compila**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sin errores relacionados con i18n. Si aparece "Property X is missing", añadir la clave faltante a `en.ts`.

---

## Task 2: Persistencia (`services/persistence.ts`)

**Files:**
- Create: `src/services/persistence.ts`
- Modify: `src/services/index.ts`
- Create: `src/services/__tests__/persistence.test.ts`

**Interfaces:**
- Produce:
  - `saveProgress(p: ConceptProgress): void`
  - `loadProgress(): ConceptProgress`
  - `marcarCompletado(id: string): ConceptProgress`
  - `desbloquearHerramienta(id: string): ConceptProgress`
  - `isCompletado(id: string): boolean`

- [ ] **Step 1: Escribir el test primero**

Crear `/Users/kegouro/HIBRIS/Proyectos/lumina/src/services/__tests__/persistence.test.ts`:

```typescript
// Tests de persistencia en localStorage
import { describe, it, expect, beforeEach } from 'vitest';
import { saveProgress, loadProgress, marcarCompletado, desbloquearHerramienta, isCompletado } from '../persistence';

// Vitest usa jsdom por defecto — localStorage está disponible.

describe('persistence — localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loadProgress devuelve estado vacío si no hay datos guardados', () => {
    const p = loadProgress();
    expect(p.completados).toEqual([]);
    expect(p.herramientasDesbloqueadas).toEqual([]);
  });

  it('saveProgress y loadProgress son inversos', () => {
    const p = { completados: ['refraccion'], herramientasDesbloqueadas: ['interfaz'] };
    saveProgress(p);
    const cargado = loadProgress();
    expect(cargado.completados).toEqual(['refraccion']);
    expect(cargado.herramientasDesbloqueadas).toEqual(['interfaz']);
  });

  it('marcarCompletado añade id sin duplicados', () => {
    const p1 = marcarCompletado('refraccion');
    const p2 = marcarCompletado('refraccion'); // segunda vez
    expect(p1.completados).toContain('refraccion');
    expect(p2.completados.filter(x => x === 'refraccion').length).toBe(1);
  });

  it('desbloquearHerramienta añade id sin duplicados', () => {
    const p = desbloquearHerramienta('interfaz');
    expect(p.herramientasDesbloqueadas).toContain('interfaz');
    const p2 = desbloquearHerramienta('interfaz');
    expect(p2.herramientasDesbloqueadas.filter(x => x === 'interfaz').length).toBe(1);
  });

  it('isCompletado devuelve true solo para ids guardados', () => {
    marcarCompletado('refraccion');
    expect(isCompletado('refraccion')).toBe(true);
    expect(isCompletado('lentes')).toBe(false);
  });
});
```

- [ ] **Step 2: Correr tests para verificar que fallan (TDD)**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm test 2>&1 | tail -20
```

Esperado: falla porque `persistence.ts` no existe todavía. Los 32 tests originales deben seguir en verde.

- [ ] **Step 3: Implementar `persistence.ts`**

Crear `/Users/kegouro/HIBRIS/Proyectos/lumina/src/services/persistence.ts`:

```typescript
// Persistencia simple en localStorage para Fase 0.
// Guarda el progreso por concepto (completados y herramientas desbloqueadas).

const STORAGE_KEY = 'lumina:progress:v1';

/** Estado de progreso por concepto */
export interface ConceptProgress {
  completados: string[];
  herramientasDesbloqueadas: string[];
}

const VACIO: ConceptProgress = {
  completados: [],
  herramientasDesbloqueadas: [],
};

/** Carga el progreso guardado, o devuelve estado vacío */
export function loadProgress(): ConceptProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...VACIO, completados: [], herramientasDesbloqueadas: [] };
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      Array.isArray((parsed as ConceptProgress).completados) &&
      Array.isArray((parsed as ConceptProgress).herramientasDesbloqueadas)
    ) {
      return parsed as ConceptProgress;
    }
    return { ...VACIO, completados: [], herramientasDesbloqueadas: [] };
  } catch {
    return { ...VACIO, completados: [], herramientasDesbloqueadas: [] };
  }
}

/** Guarda el progreso en localStorage */
export function saveProgress(p: ConceptProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // localStorage puede fallar en entornos sin cuota; ignorar silenciosamente
  }
}

/** Marca un concepto como completado (idempotente) y persiste */
export function marcarCompletado(id: string): ConceptProgress {
  const p = loadProgress();
  if (!p.completados.includes(id)) {
    p.completados = [...p.completados, id];
    saveProgress(p);
  }
  return p;
}

/** Desbloquea una herramienta (idempotente) y persiste */
export function desbloquearHerramienta(id: string): ConceptProgress {
  const p = loadProgress();
  if (!p.herramientasDesbloqueadas.includes(id)) {
    p.herramientasDesbloqueadas = [...p.herramientasDesbloqueadas, id];
    saveProgress(p);
  }
  return p;
}

/** ¿Está este concepto marcado como completado? */
export function isCompletado(id: string): boolean {
  return loadProgress().completados.includes(id);
}
```

- [ ] **Step 4: Actualizar `services/index.ts`**

Reemplazar `/Users/kegouro/HIBRIS/Proyectos/lumina/src/services/index.ts`:

```typescript
// Services — persistencia y utilidades compartidas
export * from './persistence';
```

- [ ] **Step 5: Correr tests y verificar verde**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm test 2>&1 | tail -20
```

Esperado: 32 tests originales + los 5 nuevos = 37 tests, todos en verde.

---

## Task 3: Cinematics (`src/cinematics/index.ts`)

**Files:**
- Modify: `src/cinematics/index.ts`

**Interfaces:**
- Produce:
  - `fade(el: HTMLElement, opts: {from: number, to: number, duration: number}): Promise<void>`
  - `scaleIn(el: HTMLElement, duration: number): Promise<void>`
  - `runSequence(steps: Array<() => Promise<void>>): Promise<void>`
  - `prefersReducedMotion(): boolean`

- [ ] **Step 1: Implementar cinematics**

Reemplazar `/Users/kegouro/HIBRIS/Proyectos/lumina/src/cinematics/index.ts`:

```typescript
// Cinematics — subsistema de motion declarativo para Lumina.
// Respeta prefers-reduced-motion: si está activo, las animaciones son instantáneas.

/** ¿El usuario prefiere movimiento reducido? */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Anima la opacidad de un elemento de `from` a `to` en `duration` ms.
 * Si reduced-motion está activo, aplica el valor final inmediatamente.
 */
export function fade(
  el: HTMLElement,
  opts: { from: number; to: number; duration: number }
): Promise<void> {
  return new Promise(resolve => {
    if (prefersReducedMotion() || opts.duration <= 0) {
      el.style.opacity = String(opts.to);
      resolve();
      return;
    }
    const start = performance.now();
    el.style.opacity = String(opts.from);

    function step(now: number) {
      const t = Math.min(1, (now - start) / opts.duration);
      // Easing: ease-in-out cúbico
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      el.style.opacity = String(opts.from + (opts.to - opts.from) * ease);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        el.style.opacity = String(opts.to);
        resolve();
      }
    }
    requestAnimationFrame(step);
  });
}

/**
 * Anima un elemento desde scale(0.92) + opacity 0 hasta escala 1 + opacity 1.
 * Produce el efecto cinematográfico de "emerge".
 */
export function scaleIn(el: HTMLElement, duration: number): Promise<void> {
  return new Promise(resolve => {
    if (prefersReducedMotion() || duration <= 0) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      resolve();
      return;
    }
    const start = performance.now();
    el.style.opacity = '0';
    el.style.transform = 'scale(0.92)';
    el.style.transition = 'none';

    function step(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      el.style.opacity = String(ease);
      el.style.transform = `scale(${0.92 + 0.08 * ease})`;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        el.style.opacity = '1';
        el.style.transform = 'none';
        resolve();
      }
    }
    requestAnimationFrame(step);
  });
}

/**
 * Ejecuta una secuencia de pasos async en orden.
 */
export async function runSequence(steps: Array<() => Promise<void>>): Promise<void> {
  for (const step of steps) {
    await step();
  }
}
```

---

## Task 4: Estilos del banco (`src/styles/bench.css`)

**Files:**
- Create: `src/styles/bench.css`
- Modify: `src/styles/base.css`

- [ ] **Step 1: Crear `bench.css`**

Crear `/Users/kegouro/HIBRIS/Proyectos/lumina/src/styles/bench.css`:

```css
/* Estilos del banco óptico, HUD, startmenu, story y barra de Fermat */

/* ===== LAYOUT RAÍZ ===== */
.lumina-screen {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-night);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lumina-screen.visible {
  opacity: 1;
}

/* ===== START MENU ===== */
.startmenu {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  max-width: 480px;
  width: 100%;
}

.startmenu__title {
  font-family: var(--font-display);
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 300;
  color: var(--color-ink);
  letter-spacing: 0.15em;
  text-align: center;
}

.startmenu__subtitle {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--color-muted);
  letter-spacing: 0.1em;
  text-align: center;
  margin-top: -1.5rem;
}

.startmenu__orb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-beam);
  box-shadow: 0 0 40px 10px var(--color-beam);
  margin: 0 auto;
}

.startmenu__actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.btn-primary {
  display: block;
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: var(--color-beam);
  color: var(--color-night);
  border: none;
  border-radius: 6px;
  font-family: var(--font-text);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: background 0.2s ease, transform 0.1s ease;
}

.btn-primary:hover {
  background: var(--color-gold);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-beam);
  outline-offset: 3px;
}

.btn-secondary {
  display: block;
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: transparent;
  color: var(--color-muted);
  border: 1px solid var(--color-linea);
  border-radius: 6px;
  font-family: var(--font-text);
  font-size: 0.95rem;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.btn-secondary:hover {
  border-color: var(--color-muted);
  color: var(--color-ink);
}

.btn-secondary:focus-visible {
  outline: 2px solid var(--color-muted);
  outline-offset: 3px;
}

.btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.startmenu__lang {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-lang {
  padding: 0.375rem 0.75rem;
  background: transparent;
  border: 1px solid var(--color-linea);
  border-radius: 4px;
  color: var(--color-muted);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.btn-lang.active,
.btn-lang:hover {
  border-color: var(--color-beam);
  color: var(--color-beam);
}

.btn-lang:focus-visible {
  outline: 2px solid var(--color-beam);
  outline-offset: 2px;
}

/* ===== STORY ===== */
.story {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 3rem 2rem;
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.story__frase {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 300;
  font-style: italic;
  color: var(--color-ink);
  letter-spacing: 0.05em;
  line-height: 1.4;
}

.story__intuicion {
  font-family: var(--font-text);
  font-size: 1rem;
  color: var(--color-muted);
  line-height: 1.6;
  max-width: 480px;
}

.story__deduccion-toggle {
  background: transparent;
  border: none;
  color: var(--color-beam);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.story__deduccion-toggle:focus-visible {
  outline: 2px solid var(--color-beam);
  outline-offset: 2px;
  border-radius: 2px;
}

.story__deduccion {
  background: var(--color-panel);
  border: 1px solid var(--color-linea);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: left;
  width: 100%;
  display: none;
}

.story__deduccion.visible {
  display: block;
}

.story__deduccion h3 {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--color-beam);
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}

.story__formula {
  font-family: var(--font-mono);
  font-size: 1.25rem;
  color: var(--color-ink);
  text-align: center;
  padding: 0.75rem;
  letter-spacing: 0.05em;
}

.story__deduccion p {
  font-size: 0.875rem;
  color: var(--color-muted);
  line-height: 1.6;
  margin-top: 0.75rem;
}

/* ===== BENCH CONTAINER ===== */
.bench-wrapper {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
}

.bench-canvas {
  flex: 1;
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

/* ===== HUD ===== */
.hud {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  width: 220px;
  background: rgba(21, 17, 13, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(245, 167, 44, 0.18);
  border-radius: 10px;
  padding: 0.875rem 1rem;
  cursor: grab;
  user-select: none;
  z-index: 100;
  font-family: var(--font-mono);
}

.hud.dragging {
  cursor: grabbing;
}

.hud__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.625rem;
}

.hud__title {
  font-size: 0.7rem;
  color: var(--color-beam);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.hud__toggle {
  background: transparent;
  border: none;
  color: var(--color-muted);
  font-size: 0.7rem;
  cursor: pointer;
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
}

.hud__toggle:hover { color: var(--color-ink); }
.hud__toggle:focus-visible {
  outline: 2px solid var(--color-beam);
  outline-offset: 1px;
}

.hud__body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.375rem 0.75rem;
}

.hud__body.collapsed { display: none; }

.hud__row {
  display: contents;
}

.hud__label {
  font-size: 0.7rem;
  color: var(--color-muted);
  align-self: center;
}

.hud__value {
  font-size: 0.75rem;
  color: var(--color-ink);
  text-align: right;
  align-self: center;
}

.hud__value.tir {
  color: var(--color-ember);
  font-weight: 500;
}

.hud__tir-row {
  grid-column: 1 / -1;
  font-size: 0.65rem;
  color: var(--color-ember);
  padding: 0.25rem 0;
  text-align: center;
  border-top: 1px solid var(--color-linea);
  margin-top: 0.25rem;
}

/* ===== FERMAT BAR ===== */
.fermat-panel {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: min(480px, 90vw);
  background: rgba(21, 17, 13, 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(245, 167, 44, 0.2);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  z-index: 90;
  font-family: var(--font-mono);
}

.fermat-panel__label {
  font-size: 0.7rem;
  color: var(--color-beam);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.fermat-panel__track {
  height: 6px;
  background: var(--color-linea);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.375rem;
}

.fermat-panel__fill {
  height: 100%;
  background: var(--color-beam);
  border-radius: 3px;
  transition: width 0.05s linear;
}

.fermat-panel__fill.minimo {
  background: var(--color-haz);
  box-shadow: 0 0 8px 2px var(--color-haz);
}

.fermat-panel__value {
  font-size: 0.75rem;
  color: var(--color-ink);
  display: flex;
  justify-content: space-between;
}

.fermat-panel__mensaje {
  font-size: 0.75rem;
  color: var(--color-haz);
  text-align: center;
  margin-top: 0.5rem;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.fermat-panel__mensaje.visible {
  opacity: 1;
}

/* ===== BANNER DE DESBLOQUEO ===== */
.unlock-banner {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--color-panel);
  border: 1px solid var(--color-beam);
  border-radius: 12px;
  padding: 2rem 2.5rem;
  text-align: center;
  z-index: 200;
  opacity: 0;
  pointer-events: none;
  font-family: var(--font-text);
  max-width: 380px;
  width: 90vw;
  box-shadow: 0 0 60px 0 rgba(245, 167, 44, 0.15);
}

.unlock-banner.visible {
  opacity: 1;
  pointer-events: auto;
}

.unlock-banner h2 {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: 1.25rem;
  color: var(--color-beam);
  margin-bottom: 0.75rem;
}

.unlock-banner p {
  font-size: 0.875rem;
  color: var(--color-muted);
  line-height: 1.5;
  margin-bottom: 1.25rem;
}

.unlock-banner button {
  padding: 0.625rem 1.5rem;
  background: var(--color-beam);
  color: var(--color-night);
  border: none;
  border-radius: 5px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.unlock-banner button:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 3px;
}
```

- [ ] **Step 2: Importar `bench.css` desde `base.css`**

Editar `/Users/kegouro/HIBRIS/Proyectos/lumina/src/styles/base.css` añadiendo al final:

```css
@import './bench.css';
```

---

## Task 5: `render2d/bench.ts` — Canvas2D con trazado Snell exacto

**Files:**
- Create: `src/render/render2d/bench.ts`
- Modify: `src/render/render2d/index.ts`
- Create: `src/render/render2d/__tests__/bench.test.ts`

**Interfaces:**
- Consumes:
  - `refract(n1, n2, thetaInc): {theta, tir}` de `core/snell`
  - `criticalAngle(n1, n2): number | null` de `core/snell`
  - `DOMAIN_COLORS.ray` de `core/colors`
  - `AppState` de `app.ts` (pasado como parámetro, no import circular)
- Produce:
  - `class Bench { constructor(config: BenchConfig); updateState(s: Partial<AppState>): void; destroy(): void; }`
  - `interface BenchConfig { canvas, n1, n2, thetaInc, fermatMode, onAngleChange(theta: number): void, onFermatPChange(py: number): void }`

- [ ] **Step 1: Escribir tests de lógica pura (no DOM)**

Crear `/Users/kegouro/HIBRIS/Proyectos/lumina/src/render/render2d/__tests__/bench.test.ts`:

```typescript
// Tests de lógica pura del banco (funciones sin DOM)
import { describe, it, expect } from 'vitest';
import { calcularRefraccion, calcularCaminoOptico, encontrarMinimoFermat } from '../bench';

describe('bench — cálculo de refracción', () => {
  it('rayo en agua (n2=1.33) refracta correctamente a 45°', () => {
    const r = calcularRefraccion(1.0, 1.33, Math.PI / 4);
    expect(r.tir).toBe(false);
    // Verificar Snell: n1 sin(θ1) = n2 sin(θ2)
    expect(Math.sin(Math.PI / 4)).toBeCloseTo(1.33 * Math.sin(r.theta), 6);
  });

  it('TIR se detecta para agua→aire con ángulo supercrítico', () => {
    const anguloCritico = Math.asin(1.0 / 1.33);
    const r = calcularRefraccion(1.33, 1.0, anguloCritico + 0.05);
    expect(r.tir).toBe(true);
  });

  it('rayo normal (θ=0) no se refracta en ningún medio', () => {
    const r = calcularRefraccion(1.0, 1.5, 0);
    expect(r.theta).toBeCloseTo(0, 6);
    expect(r.tir).toBe(false);
  });
});

describe('bench — camino óptico de Fermat', () => {
  // Geometría: A = (-2, 0.5) en medio 1, B = (2, -0.5) en medio 2
  // La interfaz está en x=0. El punto P está en (0, py).
  const A = { x: -2, y: 0.5 };
  const B = { x: 2, y: -0.5 };

  it('camino óptico es positivo para cualquier P', () => {
    const L = calcularCaminoOptico(1.0, 1.33, A, B, 0);
    expect(L).toBeGreaterThan(0);
  });

  it('el mínimo de Fermat coincide con el ángulo de Snell', () => {
    // El ángulo de Snell determina el P óptimo:
    // n1 * sin(θ1) = n2 * sin(θ2) => el P que minimiza L
    const py = encontrarMinimoFermat(1.0, 1.33, A, B);
    // Verificar Snell en ese punto
    const theta1 = Math.atan2(Math.abs(A.y - py), Math.abs(A.x));
    const theta2 = Math.atan2(Math.abs(py - B.y), Math.abs(B.x));
    expect(1.0 * Math.sin(theta1)).toBeCloseTo(1.33 * Math.sin(theta2), 3);
  });

  it('camino óptico es mayor lejos del mínimo', () => {
    const pyMin = encontrarMinimoFermat(1.0, 1.33, A, B);
    const Lmin = calcularCaminoOptico(1.0, 1.33, A, B, pyMin);
    const Llejos = calcularCaminoOptico(1.0, 1.33, A, B, pyMin + 0.5);
    expect(Llejos).toBeGreaterThan(Lmin);
  });
});
```

- [ ] **Step 2: Correr tests para verificar que fallan**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm test 2>&1 | tail -20
```

Esperado: nuevos tests fallan. Los 37 tests anteriores siguen verdes.

- [ ] **Step 3: Implementar `bench.ts`**

Crear `/Users/kegouro/HIBRIS/Proyectos/lumina/src/render/render2d/bench.ts`:

```typescript
// Banco óptico Canvas2D — capítulo Refracción.
// Dibuja: eje óptico, interfaz vertical, rayo incidente + refractado (Snell exacto),
// reflexión total interna cuando aplica, punto de cruce P para Fermat.
// Interacción: arrastre del extremo del rayo incidente cambia θ₁.
// Pulso de propagación: al soltar, el rayo "viaja" desde la fuente.

import { refract, criticalAngle } from '../../core/snell';
import { DOMAIN_COLORS } from '../../core/colors';

export interface BenchConfig {
  canvas: HTMLCanvasElement;
  n1: number;
  n2: number;
  thetaInc: number;          // radianes, positivo = hacia arriba desde el eje
  fermatMode: boolean;
  onAngleChange: (theta: number) => void;
  onFermatPChange: (py: number) => void;  // py en coordenadas canvas [-1, 1]
}

/** Resultado de un trazado de rayo */
interface TraceResult {
  tir: boolean;
  theta2: number;
  critAngle: number | null;
}

// ── Funciones puras exportadas (testeables sin DOM) ──────────────────────────

/** Llama a refract() del core — envoltorio semántico para tests. */
export function calcularRefraccion(n1: number, n2: number, thetaInc: number) {
  return refract(n1, n2, thetaInc);
}

/**
 * Camino óptico L(P) = n1 * |AP| + n2 * |PB|.
 * A y B son puntos 2D; P está en x=0 con ordenada `py`.
 */
export function calcularCaminoOptico(
  n1: number,
  n2: number,
  A: { x: number; y: number },
  B: { x: number; y: number },
  py: number
): number {
  const dAP = Math.sqrt(A.x * A.x + (A.y - py) * (A.y - py));
  const dPB = Math.sqrt(B.x * B.x + (B.y - py) * (B.y - py));
  return n1 * dAP + n2 * dPB;
}

/**
 * Encuentra el py que minimiza el camino óptico de Fermat usando búsqueda ternaria.
 * Busca en el rango [minPy, maxPy] con 50 iteraciones.
 */
export function encontrarMinimoFermat(
  n1: number,
  n2: number,
  A: { x: number; y: number },
  B: { x: number; y: number },
  minPy = -2,
  maxPy = 2
): number {
  let lo = minPy;
  let hi = maxPy;
  for (let i = 0; i < 80; i++) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    if (calcularCaminoOptico(n1, n2, A, B, m1) < calcularCaminoOptico(n1, n2, A, B, m2)) {
      hi = m2;
    } else {
      lo = m1;
    }
  }
  return (lo + hi) / 2;
}

// ── Clase Bench ──────────────────────────────────────────────────────────────

export class Bench {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: BenchConfig;

  // Estado interno del dibujo
  private n1: number;
  private n2: number;
  private thetaInc: number;
  private fermatMode: boolean;
  private fermatPy: number = 0;  // py normalizado en coordenadas "bench" (no canvas px)

  // Interacción
  private dragging: boolean = false;
  private dragTarget: 'ray' | 'fermat' | null = null;
  private animFrame: number | null = null;
  private pulseProgress: number = 1;  // 0..1 para el pulso de propagación

  // Geometría del bench en píxeles (se recalcula en resize)
  private W = 0;
  private H = 0;
  private CX = 0;  // coordenada X de la interfaz
  private CY = 0;  // coordenada Y del eje óptico

  // Fuente de rayo: siempre a la izquierda
  private readonly SOURCE_X_NORM = -0.6;  // fracción de la mitad de ancho
  private readonly SOURCE_Y_NORM = -0.25; // fracción de la mitad de alto (arriba)

  // Fermat: puntos A y B fijos en coordenadas "bench norm"
  private readonly FERMAT_A = { x: -0.55, y: -0.3 };  // medio 1
  private readonly FERMAT_B = { x:  0.55, y:  0.22 }; // medio 2

  constructor(config: BenchConfig) {
    this.config = config;
    this.canvas = config.canvas;
    this.n1 = config.n1;
    this.n2 = config.n2;
    this.thetaInc = config.thetaInc;
    this.fermatMode = config.fermatMode;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo obtener el contexto 2D del canvas');
    this.ctx = ctx;

    this.resize();
    this.bindEvents();
    this.loop();
  }

  /** Actualiza parámetros del estado externo */
  updateState(s: Partial<BenchConfig>): void {
    if (s.n1 !== undefined) this.n1 = s.n1;
    if (s.n2 !== undefined) this.n2 = s.n2;
    if (s.thetaInc !== undefined) this.thetaInc = s.thetaInc;
    if (s.fermatMode !== undefined) this.fermatMode = s.fermatMode;
    this.triggerPulse();
  }

  /** Lanza el pulso de propagación */
  private triggerPulse(): void {
    // Si el usuario prefiere movimiento reducido, saltamos la animación
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      this.pulseProgress = 1;
      return;
    }
    this.pulseProgress = 0;
  }

  /** Redimensiona el canvas al tamaño del contenedor */
  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio ?? 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.W = rect.width;
    this.H = rect.height;
    this.CX = this.W / 2;
    this.CY = this.H / 2;
  }

  // ── Conversiones coordenadas ──────────────────────────────────────────────

  /** Coordenadas "norm" [-1,1] x [-1,1] → píxeles del canvas */
  private normToPx(nx: number, ny: number): { x: number; y: number } {
    return {
      x: this.CX + nx * this.CX,
      y: this.CY - ny * this.CY,  // y positivo = arriba
    };
  }

  /** Píxeles → coordenadas norm */
  private pxToNorm(px: number, py: number): { x: number; y: number } {
    return {
      x: (px - this.CX) / this.CX,
      y: -(py - this.CY) / this.CY,
    };
  }

  // ── Dibujo ────────────────────────────────────────────────────────────────

  private draw(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    this.drawMedios();
    this.drawInterface();
    this.drawEjeOptico();

    if (this.fermatMode) {
      this.drawFermatPoints();
      this.drawFermatPath();
    } else {
      this.drawRay();
    }
  }

  /** Dibuja los dos medios con tinte sutil */
  private drawMedios(): void {
    const ctx = this.ctx;
    // Medio 1 (izquierda): ligeramente más cálido
    ctx.fillStyle = 'rgba(245, 167, 44, 0.03)';
    ctx.fillRect(0, 0, this.CX, this.H);
    // Medio 2 (derecha): tinte azul-agua
    ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
    ctx.fillRect(this.CX, 0, this.CX, this.H);
  }

  /** Dibuja la interfaz vertical */
  private drawInterface(): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(this.CX, 0);
    ctx.lineTo(this.CX, this.H);
    ctx.stroke();
    ctx.restore();
  }

  /** Dibuja el eje óptico */
  private drawEjeOptico(): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(154, 138, 118, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(0, this.CY);
    ctx.lineTo(this.W, this.CY);
    ctx.stroke();
    ctx.restore();
  }

  /** Dibuja el sistema de rayo con Snell exacto + pulso de propagación */
  private drawRay(): void {
    const ctx = this.ctx;
    const result = refract(this.n1, this.n2, this.thetaInc);

    // Fuente del rayo
    const src = this.normToPx(this.SOURCE_X_NORM, this.SOURCE_Y_NORM);
    // Punto de cruce en la interfaz (calculado desde el ángulo)
    // El rayo va desde src con ángulo thetaInc hasta la interfaz x=CX
    const dxInc = this.CX - src.x;
    const dyInc = dxInc * Math.tan(-this.thetaInc);  // y crece hacia abajo en canvas
    const cruce = { x: this.CX, y: src.y + dyInc };

    // Destino del rayo refractado/reflejado
    let dest: { x: number; y: number };
    const rayColor = DOMAIN_COLORS.ray;

    if (result.tir) {
      // Reflexión total interna: el rayo rebota
      const dxRef = this.CX - src.x;
      const dyRef = -dyInc;  // simetría especular
      dest = { x: this.CX - dxRef * 0.5, y: cruce.y + dyRef * 0.5 };
      this.drawSegmentAA(ctx, src, cruce, rayColor, 2.0, this.pulseProgress, 0, 0.5);
      this.drawSegmentAA(ctx, cruce, dest, '#ff7a3c', 1.8, this.pulseProgress, 0.5, 1.0);
    } else {
      // Refracción: continúa en medio 2
      const dxRef = this.W - this.CX;
      const dyRef = dxRef * Math.tan(-result.theta);
      dest = { x: this.W - 20, y: cruce.y + dyRef };
      this.drawSegmentAA(ctx, src, cruce, rayColor, 2.0, this.pulseProgress, 0, 0.5);
      this.drawSegmentAA(ctx, cruce, dest, rayColor, 2.0, this.pulseProgress, 0.5, 1.0);
    }

    // Marcador de la fuente
    ctx.save();
    ctx.fillStyle = rayColor;
    ctx.shadowColor = rayColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(src.x, src.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Marcador del punto de cruce
    ctx.save();
    ctx.strokeStyle = 'rgba(245,167,44,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cruce.x, cruce.y, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Ángulo crítico indicator (arco)
    const ca = criticalAngle(this.n1, this.n2);
    if (ca !== null) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 122, 60, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      const r = 40;
      ctx.beginPath();
      ctx.arc(cruce.x, cruce.y, r, -Math.PI / 2, -Math.PI / 2 + ca);
      ctx.stroke();
      ctx.restore();
    }
  }

  /**
   * Dibuja un segmento con antialiasing (línea con blur de 1px).
   * `pulseT` en [0,1] anima la longitud visible del segmento si < 1.
   * `segStart` y `segEnd` son fracciones del pulso total asignadas a este segmento.
   */
  private drawSegmentAA(
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number },
    color: string,
    width: number,
    pulseT: number,
    segStart: number,
    segEnd: number
  ): void {
    // Fracción del segmento actualmente visible según el pulso
    const segRange = segEnd - segStart;
    const localT = Math.max(0, Math.min(1, (pulseT - segStart) / segRange));
    if (localT <= 0) return;

    const ex = from.x + (to.x - from.x) * localT;
    const ey = from.y + (to.y - from.y) * localT;

    ctx.save();
    // Antialiasing: dos capas (una más ancha y transparente)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Capa difusa (halo)
    ctx.strokeStyle = color;
    ctx.lineWidth = width + 2;
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // Línea principal
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.restore();
  }

  /** Dibuja puntos A y B del modo Fermat */
  private drawFermatPoints(): void {
    const ctx = this.ctx;
    const A = this.normToPx(this.FERMAT_A.x, this.FERMAT_A.y);
    const B = this.normToPx(this.FERMAT_B.x, this.FERMAT_B.y);
    const P = this.normToPx(0, this.fermatPy);

    // Punto A
    ctx.save();
    ctx.fillStyle = DOMAIN_COLORS.ray;
    ctx.font = '12px var(--font-mono, monospace)';
    ctx.beginPath();
    ctx.arc(A.x, A.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('A', A.x + 8, A.y - 6);

    // Punto B
    ctx.fillStyle = DOMAIN_COLORS.wave;
    ctx.beginPath();
    ctx.arc(B.x, B.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = DOMAIN_COLORS.wave;
    ctx.fillText('B', B.x + 8, B.y - 6);

    // Punto P (arrastrable en la interfaz)
    const pyMin = encontrarMinimoFermat(this.n1, this.n2, this.FERMAT_A, this.FERMAT_B);
    const esMinimo = Math.abs(this.fermatPy - pyMin) < 0.04;
    ctx.fillStyle = esMinimo ? DOMAIN_COLORS.beam : '#efe7d8';
    ctx.shadowColor = esMinimo ? DOMAIN_COLORS.beam : 'transparent';
    ctx.shadowBlur = esMinimo ? 12 : 0;
    ctx.beginPath();
    ctx.arc(P.x, P.y, esMinimo ? 7 : 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ctx.fillStyle;
    ctx.fillText('P', P.x + 8, P.y - 6);
    ctx.restore();
  }

  /** Dibuja el camino A→P→B en modo Fermat */
  private drawFermatPath(): void {
    const ctx = this.ctx;
    const A = this.normToPx(this.FERMAT_A.x, this.FERMAT_A.y);
    const B = this.normToPx(this.FERMAT_B.x, this.FERMAT_B.y);
    const P = this.normToPx(0, this.fermatPy);

    ctx.save();
    ctx.strokeStyle = DOMAIN_COLORS.ray;
    ctx.lineWidth = 1.8;
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.7;

    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(P.x, P.y);
    ctx.stroke();

    ctx.strokeStyle = DOMAIN_COLORS.wave;
    ctx.beginPath();
    ctx.moveTo(P.x, P.y);
    ctx.lineTo(B.x, B.y);
    ctx.stroke();
    ctx.restore();
  }

  // ── Loop de animación ────────────────────────────────────────────────────

  private loop(): void {
    this.draw();

    // Avanzar el pulso de propagación
    if (this.pulseProgress < 1) {
      this.pulseProgress = Math.min(1, this.pulseProgress + 0.04);
    }

    this.animFrame = requestAnimationFrame(() => this.loop());
  }

  // ── Interacción ──────────────────────────────────────────────────────────

  private bindEvents(): void {
    const canvas = this.canvas;

    // Soporte ratón
    canvas.addEventListener('mousedown', this.onPointerDown.bind(this));
    canvas.addEventListener('mousemove', this.onPointerMove.bind(this));
    canvas.addEventListener('mouseup', this.onPointerUp.bind(this));

    // Soporte táctil
    canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });
    canvas.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });

    // Redimensionar
    window.addEventListener('resize', this.onResize.bind(this));
  }

  private pointerFromEvent(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private onPointerDown(e: MouseEvent): void {
    const pos = this.pointerFromEvent(e);
    this.dragging = true;

    if (this.fermatMode) {
      this.dragTarget = 'fermat';
    } else {
      this.dragTarget = 'ray';
    }
    this.handleDrag(pos);
  }

  private onPointerMove(e: MouseEvent): void {
    if (!this.dragging) return;
    this.handleDrag(this.pointerFromEvent(e));
  }

  private onPointerUp(_e: MouseEvent): void {
    if (this.dragging) {
      this.dragging = false;
      this.dragTarget = null;
      this.triggerPulse();
    }
  }

  private onTouchStart(e: TouchEvent): void {
    const t = e.touches[0];
    if (!t) return;
    const rect = this.canvas.getBoundingClientRect();
    this.dragging = true;
    this.dragTarget = this.fermatMode ? 'fermat' : 'ray';
    this.handleDrag({ x: t.clientX - rect.left, y: t.clientY - rect.top });
  }

  private onTouchMove(e: TouchEvent): void {
    const t = e.touches[0];
    if (!t || !this.dragging) return;
    const rect = this.canvas.getBoundingClientRect();
    this.handleDrag({ x: t.clientX - rect.left, y: t.clientY - rect.top });
  }

  private onTouchEnd(_e: TouchEvent): void {
    if (this.dragging) {
      this.dragging = false;
      this.dragTarget = null;
      this.triggerPulse();
    }
  }

  private handleDrag(px: { x: number; y: number }): void {
    const norm = this.pxToNorm(px.x, px.y);

    if (this.dragTarget === 'ray') {
      // El ángulo se calcula desde la fuente al puntero del ratón
      const srcPx = this.normToPx(this.SOURCE_X_NORM, this.SOURCE_Y_NORM);
      const dx = px.x - srcPx.x;
      const dy = srcPx.y - px.y;  // y crece hacia abajo en canvas
      if (dx > 0) {
        const theta = Math.atan2(dy, dx);
        // Limitar a ±80°
        const thetaLimitado = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, theta));
        this.thetaInc = thetaLimitado;
        this.config.onAngleChange(thetaLimitado);
      }
    } else if (this.dragTarget === 'fermat') {
      // P solo se mueve a lo largo de la interfaz (x=0), py varía
      const pyClamp = Math.max(-0.9, Math.min(0.9, norm.y));
      this.fermatPy = pyClamp;
      this.config.onFermatPChange(pyClamp);
    }
  }

  private onResize(): void {
    this.resize();
  }

  /** Limpia recursos */
  destroy(): void {
    if (this.animFrame !== null) {
      cancelAnimationFrame(this.animFrame);
    }
    window.removeEventListener('resize', this.onResize.bind(this));
  }
}
```

- [ ] **Step 4: Actualizar `render2d/index.ts`**

Reemplazar `/Users/kegouro/HIBRIS/Proyectos/lumina/src/render/render2d/index.ts`:

```typescript
// Render 2D — re-exporta el banco óptico Canvas2D
export * from './bench';
```

- [ ] **Step 5: Correr tests**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm test 2>&1 | tail -30
```

Esperado: los tests de bench pasan (geometría, camino óptico, mínimo de Fermat). Total acumulado: ≥40 tests verdes.

---

## Task 6: HUD de cristal (`src/ui/hud/index.ts`)

**Files:**
- Modify: `src/ui/hud/index.ts`

**Interfaces:**
- Consumes: `t()` de `ui/i18n`, `AppState` como parámetro (no import directo para evitar circular).
- Produce:
  - `mountHUD(container: HTMLElement, state: HUDState): HUDHandle`
  - `interface HUDState { n1, n2, theta1Deg, theta2Deg, tir }`
  - `interface HUDHandle { update(s: HUDState): void; destroy(): void }`

- [ ] **Step 1: Implementar `hud/index.ts`**

Reemplazar `/Users/kegouro/HIBRIS/Proyectos/lumina/src/ui/hud/index.ts`:

```typescript
// HUD de cristal — panel arrastrable y plegable con glassmorphism Pharos.
// Muestra n₁, n₂, θ₁, θ₂ y estado TIR en tiempo real.
import { t } from '../i18n';

export interface HUDState {
  n1: number;
  n2: number;
  theta1Deg: number;
  theta2Deg: number;
  tir: boolean;
}

export interface HUDHandle {
  update(s: HUDState): void;
  destroy(): void;
}

export function mountHUD(container: HTMLElement, initial: HUDState): HUDHandle {
  // Crear el panel
  const panel = document.createElement('div');
  panel.className = 'hud';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', t('hud.elemento'));

  let collapsed = false;

  const render = (s: HUDState) => {
    const fmt = (v: number, dec = 2) => v.toFixed(dec);
    panel.innerHTML = `
      <div class="hud__header">
        <span class="hud__title">Refracción</span>
        <button class="hud__toggle" aria-expanded="${!collapsed}"
                aria-controls="hud-body">
          ${collapsed ? t('hud.desplegar') : t('hud.plegar')}
        </button>
      </div>
      <div class="hud__body ${collapsed ? 'collapsed' : ''}" id="hud-body">
        <span class="hud__label">${t('hud.n1')}</span>
        <span class="hud__value">${fmt(s.n1)}</span>
        <span class="hud__label">${t('hud.n2')}</span>
        <span class="hud__value">${fmt(s.n2)}</span>
        <span class="hud__label">${t('hud.theta1')}</span>
        <span class="hud__value">${fmt(s.theta1Deg, 1)}°</span>
        <span class="hud__label">${t('hud.theta2')}</span>
        <span class="hud__value ${s.tir ? 'tir' : ''}">${s.tir ? '—' : fmt(s.theta2Deg, 1) + '°'}</span>
        ${s.tir ? `<div class="hud__tir-row">${t('hud.tir')}</div>` : ''}
      </div>
    `;
    // Conectar botón plegar
    const btn = panel.querySelector('.hud__toggle') as HTMLButtonElement | null;
    if (btn) {
      btn.onclick = () => {
        collapsed = !collapsed;
        render(s);
      };
    }
  };

  render(initial);
  container.appendChild(panel);

  // Hacer el HUD arrastrable
  makeDraggable(panel);

  return {
    update(s: HUDState) { render(s); },
    destroy() { panel.remove(); },
  };
}

/** Hace un elemento arrastrable dentro del viewport */
function makeDraggable(el: HTMLElement): void {
  let startX = 0;
  let startY = 0;
  let origLeft = 0;
  let origTop = 0;
  let dragging = false;

  const onDown = (e: PointerEvent) => {
    // No iniciar drag si se hace clic en el botón de plegar
    if ((e.target as HTMLElement).classList.contains('hud__toggle')) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = el.getBoundingClientRect();
    origLeft = rect.left;
    origTop = rect.top;
    el.classList.add('dragging');
    el.setPointerCapture(e.pointerId);
  };

  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    // Mantener dentro del viewport
    const newLeft = Math.max(0, Math.min(window.innerWidth - el.offsetWidth, origLeft + dx));
    const newTop = Math.max(0, Math.min(window.innerHeight - el.offsetHeight, origTop + dy));
    el.style.left = `${newLeft}px`;
    el.style.top = `${newTop}px`;
    el.style.right = 'auto';
  };

  const onUp = () => {
    dragging = false;
    el.classList.remove('dragging');
  };

  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onUp);
}
```

---

## Task 7: Start Menu (`src/ui/startmenu/index.ts`)

**Files:**
- Modify: `src/ui/startmenu/index.ts`

**Interfaces:**
- Produce:
  - `mountStartMenu(container: HTMLElement, opts: StartMenuOptions): void`
  - `interface StartMenuOptions { onHistoria(): void; onLaboratorio(): void; onLangChange(lang: 'es'|'en'): void; lang: 'es'|'en' }`

- [ ] **Step 1: Implementar `startmenu/index.ts`**

Reemplazar `/Users/kegouro/HIBRIS/Proyectos/lumina/src/ui/startmenu/index.ts`:

```typescript
// Start Menu — punto de entrada de Lumina.
// Botones: Modo Historia, Modo Laboratorio (stub), toggle idioma ES/EN.
import { t, setLang } from '../i18n';
import type { Lang } from '../i18n';
import { scaleIn } from '../../cinematics';

export interface StartMenuOptions {
  onHistoria: () => void;
  onLaboratorio: () => void;
  onLangChange: (lang: Lang) => void;
  lang: Lang;
}

export function mountStartMenu(container: HTMLElement, opts: StartMenuOptions): void {
  const screen = document.createElement('div');
  screen.className = 'lumina-screen';
  screen.setAttribute('role', 'main');

  const render = () => {
    screen.innerHTML = `
      <div class="startmenu">
        <div class="startmenu__orb" aria-hidden="true"></div>
        <h1 class="startmenu__title">${t('app.title')}</h1>
        <p class="startmenu__subtitle">${t('app.subtitle')}</p>
        <div class="startmenu__actions">
          <button class="btn-primary" id="btn-historia">${t('menu.historia')}</button>
          <button class="btn-secondary" id="btn-laboratorio" disabled
                  title="${t('menu.lab.proximamente')}">
            ${t('menu.laboratorio')} — ${t('menu.lab.proximamente')}
          </button>
        </div>
        <div class="startmenu__lang" role="group" aria-label="Idioma / Language">
          <button class="btn-lang ${opts.lang === 'es' ? 'active' : ''}"
                  id="btn-es" aria-pressed="${opts.lang === 'es'}">ES</button>
          <button class="btn-lang ${opts.lang === 'en' ? 'active' : ''}"
                  id="btn-en" aria-pressed="${opts.lang === 'en'}">EN</button>
        </div>
      </div>
    `;

    screen.querySelector('#btn-historia')?.addEventListener('click', opts.onHistoria);

    screen.querySelector('#btn-es')?.addEventListener('click', () => {
      setLang('es');
      opts.onLangChange('es');
      opts.lang = 'es';
      render();
    });

    screen.querySelector('#btn-en')?.addEventListener('click', () => {
      setLang('en');
      opts.onLangChange('en');
      opts.lang = 'en';
      render();
    });
  };

  render();
  container.appendChild(screen);

  // Animar entrada
  requestAnimationFrame(() => {
    screen.classList.add('visible');
    scaleIn(screen.querySelector('.startmenu') as HTMLElement, 500);
  });
}
```

---

## Task 8: Story + Cinematics de transición (`src/ui/story/index.ts`)

**Files:**
- Modify: `src/ui/story/index.ts`

**Interfaces:**
- Consumes: `fade()`, `scaleIn()`, `runSequence()` de `cinematics/index.ts`; `t()` de i18n.
- Produce:
  - `mountStory(container, opts: StoryOptions): void`
  - `interface StoryOptions { capituloId: 'refraccion'; onComenzar(): void }`

- [ ] **Step 1: Implementar `story/index.ts`**

Reemplazar `/Users/kegouro/HIBRIS/Proyectos/lumina/src/ui/story/index.ts`:

```typescript
// Story — escena cinematográfica para el capítulo de Refracción.
// Una frase poética → carril intuición + deducción plegable → botón al banco.
import { t } from '../i18n';
import { fade, scaleIn, runSequence } from '../../cinematics';

export interface StoryOptions {
  capituloId: 'refraccion';
  onComenzar: () => void;
}

export function mountStory(container: HTMLElement, opts: StoryOptions): void {
  const screen = document.createElement('div');
  screen.className = 'lumina-screen';
  screen.style.opacity = '0';
  screen.setAttribute('role', 'main');
  screen.setAttribute('aria-label', t('refraccion.titulo'));

  screen.innerHTML = `
    <div class="story">
      <p class="story__frase" id="story-frase">${t('refraccion.frase')}</p>
      <p class="story__intuicion" id="story-intuicion">${t('refraccion.intuicion')}</p>
      <button class="story__deduccion-toggle" id="story-toggle"
              aria-expanded="false" aria-controls="story-deduccion">
        ${t('refraccion.deduccion.ver')}
      </button>
      <div class="story__deduccion" id="story-deduccion" aria-hidden="true">
        <h3>${t('refraccion.deduccion.titulo')}</h3>
        <div class="story__formula">${t('refraccion.deduccion.texto')}</div>
        <p>${t('refraccion.deduccion.derivacion')}</p>
      </div>
      <button class="btn-primary" id="story-comenzar" style="max-width: 280px;">
        ${t('refraccion.comenzar')}
      </button>
    </div>
  `;

  container.appendChild(screen);

  // Conectar toggle de deducción
  const toggleBtn = screen.querySelector('#story-toggle') as HTMLButtonElement;
  const deduccion = screen.querySelector('#story-deduccion') as HTMLElement;
  let abierto = false;
  toggleBtn.addEventListener('click', () => {
    abierto = !abierto;
    deduccion.classList.toggle('visible', abierto);
    deduccion.setAttribute('aria-hidden', String(!abierto));
    toggleBtn.setAttribute('aria-expanded', String(abierto));
    toggleBtn.textContent = abierto
      ? t('refraccion.deduccion.ocultar')
      : t('refraccion.deduccion.ver');
  });

  // Botón al banco
  screen.querySelector('#story-comenzar')?.addEventListener('click', opts.onComenzar);

  // Secuencia cinematográfica de entrada
  const frase = screen.querySelector('#story-frase') as HTMLElement;
  const intuicion = screen.querySelector('#story-intuicion') as HTMLElement;
  const comenzarBtn = screen.querySelector('#story-comenzar') as HTMLElement;
  frase.style.opacity = '0';
  intuicion.style.opacity = '0';
  comenzarBtn.style.opacity = '0';

  runSequence([
    () => fade(screen, { from: 0, to: 1, duration: 600 }),
    () => new Promise(r => setTimeout(r, 200)),
    () => fade(frase, { from: 0, to: 1, duration: 800 }),
    () => new Promise(r => setTimeout(r, 400)),
    () => fade(intuicion, { from: 0, to: 1, duration: 600 }),
    () => new Promise(r => setTimeout(r, 300)),
    () => fade(comenzarBtn, { from: 0, to: 1, duration: 400 }),
  ]);
}
```

---

## Task 9: Panel de Fermat (`src/ui/fermat/index.ts`)

**Files:**
- Create: `src/ui/fermat/index.ts`

**Interfaces:**
- Consumes: `calcularCaminoOptico`, `encontrarMinimoFermat` de `render/render2d/bench`.
- Produce:
  - `mountFermatPanel(container, opts: FermatPanelOptions): FermatHandle`
  - `interface FermatPanelOptions { n1, n2, A, B; onMinimo(): void }`
  - `interface FermatHandle { updateP(py: number): void; destroy(): void }`

- [ ] **Step 1: Crear `src/ui/fermat/index.ts`**

```typescript
// Panel de Fermat — barra de tiempo de viaje + indicador de mínimo.
// Cableado al modo Fermat del banco: cuando el usuario arrastra P al mínimo,
// resalta el mensaje y llama onMinimo() para desbloquear la herramienta.
import { t } from '../i18n';
import { calcularCaminoOptico, encontrarMinimoFermat } from '../../render/render2d/bench';

export interface FermatPanelOptions {
  n1: number;
  n2: number;
  A: { x: number; y: number };
  B: { x: number; y: number };
  onMinimo: () => void;
}

export interface FermatHandle {
  updateP(py: number): void;
  destroy(): void;
}

export function mountFermatPanel(container: HTMLElement, opts: FermatPanelOptions): FermatHandle {
  const panel = document.createElement('div');
  panel.className = 'fermat-panel';
  panel.setAttribute('role', 'status');
  panel.setAttribute('aria-live', 'polite');

  // Calcular rango de camino óptico para normalizar la barra
  const pyMin = encontrarMinimoFermat(opts.n1, opts.n2, opts.A, opts.B);
  const Lmin = calcularCaminoOptico(opts.n1, opts.n2, opts.A, opts.B, pyMin);
  const Lmax = calcularCaminoOptico(opts.n1, opts.n2, opts.A, opts.B, pyMin + 0.8);

  let minimoAlcanzado = false;

  const render = (py: number) => {
    const L = calcularCaminoOptico(opts.n1, opts.n2, opts.A, opts.B, py);
    // La barra llena = Lmax, vacía = Lmin
    const pct = Math.max(0, Math.min(100, ((L - Lmin) / (Lmax - Lmin)) * 100));
    const esMinimo = Math.abs(py - pyMin) < 0.04;

    panel.innerHTML = `
      <div class="fermat-panel__label">${t('fermat.titulo')}</div>
      <div class="fermat-panel__track" role="progressbar"
           aria-valuenow="${L.toFixed(3)}" aria-valuemin="${Lmin.toFixed(3)}"
           aria-valuemax="${Lmax.toFixed(3)}" aria-label="${t('fermat.tiempo')}">
        <div class="fermat-panel__fill ${esMinimo ? 'minimo' : ''}"
             style="width: ${pct}%"></div>
      </div>
      <div class="fermat-panel__value">
        <span>${t('fermat.tiempo')}</span>
        <span>${L.toFixed(3)} ${t('fermat.unidades')}</span>
      </div>
      <div class="fermat-panel__mensaje ${esMinimo ? 'visible' : ''}"
           aria-live="assertive">
        ${esMinimo ? t('fermat.minimo') : ''}
      </div>
      <p style="font-size:0.65rem; color: var(--color-muted); margin-top:0.5rem; text-align:center;">
        ${t('fermat.instruccion')}
      </p>
    `;

    if (esMinimo && !minimoAlcanzado) {
      minimoAlcanzado = true;
      opts.onMinimo();
    }
  };

  render(0);
  container.appendChild(panel);

  return {
    updateP(py: number) { render(py); },
    destroy() { panel.remove(); },
  };
}
```

---

## Task 10: Banner de desbloqueo (inline en `app.ts`)

El banner de desbloqueo se construye inline dentro de `app.ts` para no crear un módulo de una sola función. Queda como función privada del orquestador.

_(No hay archivos nuevos aquí — se implementa en Task 11 dentro de `app.ts`)_

---

## Task 11: `app.ts` — orquestador principal

**Files:**
- Modify: `src/app.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Consumes: todos los módulos anteriores.
- Produce: `init(): void` — punto de entrada del ciclo de vida de la app.

- [ ] **Step 1: Implementar `app.ts`**

Reemplazar `/Users/kegouro/HIBRIS/Proyectos/lumina/src/app.ts`:

```typescript
// app.ts — orquestador principal de Lumina.
// Fuente única de estado. Coordina startmenu ↔ story ↔ bench ↔ HUD ↔ Fermat ↔ persistencia.

import { setLang, getLang } from './ui/i18n';
import type { Lang } from './ui/i18n';
import { mountStartMenu } from './ui/startmenu';
import { mountStory } from './ui/story';
import { mountHUD } from './ui/hud';
import type { HUDHandle } from './ui/hud';
import { mountFermatPanel } from './ui/fermat';
import type { FermatHandle } from './ui/fermat';
import { Bench } from './render/render2d';
import { refract } from './core/snell';
import { marcarCompletado, desbloquearHerramienta, loadProgress } from './services/persistence';
import { fade } from './cinematics';
import { t } from './ui/i18n';

/** Estado global de la aplicación */
interface AppState {
  screen: 'menu' | 'story' | 'bench';
  lang: Lang;
  n1: number;
  n2: number;
  thetaInc: number;        // radianes
  fermatMode: boolean;
}

const STATE: AppState = {
  screen: 'menu',
  lang: 'es',
  n1: 1.0,
  n2: 1.33,
  thetaInc: Math.PI / 6,  // 30° por defecto
  fermatMode: false,
};

let appContainer: HTMLElement;
let hudHandle: HUDHandle | null = null;
let fermatHandle: FermatHandle | null = null;
let bench: Bench | null = null;
let currentScreen: HTMLElement | null = null;

export function init(): void {
  const el = document.getElementById('app');
  if (!el) throw new Error('No se encontró #app en el DOM');
  appContainer = el;

  // Recuperar progreso guardado (para futuras rutas)
  loadProgress();

  irAMenu();
}

// ── Navegación ──────────────────────────────────────────────────────────────

function irAMenu(): void {
  limpiarPantalla();
  STATE.screen = 'menu';

  mountStartMenu(appContainer, {
    lang: STATE.lang,
    onHistoria: irAStory,
    onLaboratorio: () => { /* stub Fase 0 */ },
    onLangChange(lang) {
      STATE.lang = lang;
      setLang(lang);
    },
  });
}

function irAStory(): void {
  limpiarPantalla();
  STATE.screen = 'story';

  mountStory(appContainer, {
    capituloId: 'refraccion',
    onComenzar: irAlBanco,
  });
}

function irAlBanco(): void {
  limpiarPantalla();
  STATE.screen = 'bench';

  // Wrapper del banco
  const wrapper = document.createElement('div');
  wrapper.className = 'bench-wrapper';

  const canvas = document.createElement('canvas');
  canvas.className = 'bench-canvas';
  canvas.setAttribute('aria-label', t('bench.arrastrar'));
  canvas.setAttribute('role', 'img');

  wrapper.appendChild(canvas);
  appContainer.appendChild(wrapper);
  currentScreen = wrapper;

  // Fade de entrada
  wrapper.style.opacity = '0';
  requestAnimationFrame(() => {
    fade(wrapper, { from: 0, to: 1, duration: 500 });
  });

  // Banco Canvas2D
  bench = new Bench({
    canvas,
    n1: STATE.n1,
    n2: STATE.n2,
    thetaInc: STATE.thetaInc,
    fermatMode: STATE.fermatMode,
    onAngleChange(theta) {
      STATE.thetaInc = theta;
      actualizarHUD();
    },
    onFermatPChange(py) {
      if (fermatHandle) fermatHandle.updateP(py);
    },
  });

  // HUD
  hudHandle = mountHUD(appContainer, calcularHUDState());

  // Panel de Fermat (siempre visible en el banco de refracción Fase 0)
  const FERMAT_A = { x: -0.55, y: -0.3 };
  const FERMAT_B = { x: 0.55, y: 0.22 };
  fermatHandle = mountFermatPanel(appContainer, {
    n1: STATE.n1,
    n2: STATE.n2,
    A: FERMAT_A,
    B: FERMAT_B,
    onMinimo: manejarDesbloqueo,
  });
}

// ── HUD ─────────────────────────────────────────────────────────────────────

function calcularHUDState() {
  const r = refract(STATE.n1, STATE.n2, STATE.thetaInc);
  return {
    n1: STATE.n1,
    n2: STATE.n2,
    theta1Deg: (STATE.thetaInc * 180) / Math.PI,
    theta2Deg: (r.theta * 180) / Math.PI,
    tir: r.tir,
  };
}

function actualizarHUD(): void {
  if (hudHandle) hudHandle.update(calcularHUDState());
}

// ── Desbloqueo ───────────────────────────────────────────────────────────────

let desbloqueadoYa = false;  // Evitar mostrar el banner múltiples veces

function manejarDesbloqueo(): void {
  if (desbloqueadoYa) return;
  desbloqueadoYa = true;

  marcarCompletado('refraccion');
  desbloquearHerramienta('interfaz');

  mostrarBannerDesbloqueo();
}

function mostrarBannerDesbloqueo(): void {
  const banner = document.createElement('div');
  banner.className = 'unlock-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-modal', 'true');
  banner.setAttribute('aria-label', t('desbloqueo.interfaz'));

  banner.innerHTML = `
    <h2>${t('desbloqueo.interfaz')}</h2>
    <p>${t('desbloqueo.descripcion')}</p>
    <button id="btn-cerrar-banner">${t('refraccion.comenzar')}</button>
  `;

  appContainer.appendChild(banner);

  // Animar entrada
  requestAnimationFrame(() => {
    banner.classList.add('visible');
  });

  banner.querySelector('#btn-cerrar-banner')?.addEventListener('click', () => {
    fade(banner, { from: 1, to: 0, duration: 300 }).then(() => banner.remove());
  });
}

// ── Utilidades ───────────────────────────────────────────────────────────────

function limpiarPantalla(): void {
  // Destruir recursos anteriores
  bench?.destroy();
  bench = null;
  hudHandle?.destroy();
  hudHandle = null;
  fermatHandle?.destroy();
  fermatHandle = null;

  // Limpiar DOM (excepto el appContainer)
  while (appContainer.firstChild) {
    appContainer.removeChild(appContainer.firstChild);
  }
  currentScreen = null;
  desbloqueadoYa = false;
}
```

- [ ] **Step 2: Actualizar `main.ts`**

Reemplazar `/Users/kegouro/HIBRIS/Proyectos/lumina/src/main.ts`:

```typescript
// Punto de entrada de Lumina — inicializa la app
import './styles/base.css';
import { init } from './app';

init();
```

---

## Task 12: PWA — verificar instalabilidad offline

**Files:**
- Modify: `vite.config.ts` (solo si falta algo)

- [ ] **Step 1: Verificar que el manifest tiene `start_url` y `scope`**

Leer el vite.config.ts actual. Si falta `start_url` o `scope`, añadirlos:

```typescript
// vite.config.ts — configuración con PWA completa
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Cachear todos los assets estáticos
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      manifest: {
        name: 'Lumina',
        short_name: 'Lumina',
        description: 'Curso-laboratorio web de óptica',
        theme_color: '#0a0908',
        background_color: '#0a0908',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
```

- [ ] **Step 2: Verificar build completo**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm run build 2>&1 | tail -30
```

Esperado: build finaliza sin errores de TypeScript ni de bundling.

---

## Task 13: Verificación final

- [ ] **Step 1: Correr todos los tests**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm test 2>&1
```

Esperado: 32 tests originales + tests nuevos (≥10) = todos verdes. Cero FAIL.

- [ ] **Step 2: Build de producción**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm run build 2>&1
```

Esperado: `✓ built in X.XXs` sin errores.

- [ ] **Step 3: Arrancar dev server y verificar el flujo**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm run dev 2>&1 &
```

Verificar manualmente:
1. Se ve el menú de inicio (título Lumina, botón "Historia", botón "Laboratorio" deshabilitado, toggle ES/EN).
2. Click en "Historia" → escena cinematográfica con la frase poética y fade de entrada.
3. Click en "Explorar el banco" → canvas 2D con rayo ámbar cruzando la interfaz.
4. Arrastrar el rayo → ángulo cambia en tiempo real, HUD actualiza n₁/n₂/θ₁/θ₂.
5. Arrastrar P en el panel Fermat → barra de camino óptico se mueve; al llegar al mínimo aparece el mensaje y el banner de desbloqueo.
6. localStorage tiene la clave `lumina:progress:v1` con `refraccion` en `completados`.

---

## Auto-revisión del plan

### 1. Cobertura de especificación

| Requisito | Cubierto en |
|-----------|------------|
| Startmenu (Historia / Lab stub / idioma) | Task 7 |
| Escena cinematográfica + carril deducción | Task 8 |
| Transición fade/scale | Task 3 + Task 8 |
| Banco Canvas2D con interfaz y tinte | Task 5 |
| Trazado Snell exacto con `refract()` | Task 5 |
| TIR (reflexión total interna) | Task 5 |
| Antialiasing de rayos | Task 5 (`drawSegmentAA`) |
| Pulso de propagación (respeta reduced-motion) | Task 5 (`triggerPulse`) |
| Arrastre de ángulo | Task 5 (`handleDrag`) |
| HUD glassmorphism arrastrable/plegable | Task 6 |
| n₁, n₂, θ₁, θ₂, TIR en HUD | Task 6 |
| Momento Aha de Fermat | Task 9 |
| Barra de camino óptico | Task 9 |
| Mínimo = ley de Snell (resaltado) | Task 9 |
| Desbloqueo de herramienta al alcanzar mínimo | Task 11 |
| Persistencia localStorage por id de concepto | Task 2 |
| `npm test` verde (32 + nuevos) | Task 13 |
| `npm run build` verde | Task 12 + 13 |
| i18n ES/EN claves nuevas sincronizadas | Task 1 |
| prefers-reduced-motion | Task 3 + Task 5 |
| Foco de teclado visible | Task 4 (CSS) |
| Responsive tablet | Task 4 (CSS con min-width implícito) |
| PWA instalable (manifest + workbox) | Task 12 |

### 2. Posibles gaps detectados

- **`src/ui/fermat/`** no existía en la fundación — se crea como directorio nuevo con `mkdir` implícito al crear el archivo. Si el agente necesita crearlo explícitamente: `mkdir -p /Users/kegouro/HIBRIS/Proyectos/lumina/src/ui/fermat`.
- **`src/render/render2d/__tests__/`** tampoco existía — mismo caso.
- **`src/services/__tests__/`** tampoco existía — mismo caso.
- El test de `persistence.ts` usa `localStorage` que en Vitest con jsdom está disponible por defecto; si el config de Vitest no especifica `environment: 'jsdom'`, añadir `/// <reference types="vitest" />` o configurar `vitest.config.ts`.

### 3. Vitest config — verificar entorno jsdom

Leer `/Users/kegouro/HIBRIS/Proyectos/lumina/vitest.config.ts` antes de Task 2. Si no especifica `environment: 'jsdom'`, actualizarlo:

```typescript
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
```

Esto es necesario para que `localStorage` esté disponible en los tests de persistencia.

### 4. Consistencia de tipos

- `BenchConfig` en `bench.ts` expone `onFermatPChange(py: number)` — coincide con el uso en `app.ts`.
- `HUDHandle.update(s: HUDState)` — el campo `tir` es `boolean`, coincide con `RefractResult.tir`.
- `FermatHandle.updateP(py: number)` — coincide con la llamada desde `app.ts`.
- `mountStory` recibe `capituloId: 'refraccion'` (literal string) — si se añaden capítulos futuros, ampliar la unión.

---

**Plan completo y guardado en `docs/superpowers/plans/2026-06-24-lumina-fase0-oleada2.md`.**

**Dos opciones de ejecución:**

**1. Subagent-Driven (recomendado)** — un subagente fresco por tarea, revisión entre tareas, iteración rápida. Usar `superpowers:subagent-driven-development`.

**2. Inline Execution** — ejecutar tareas en esta sesión con `superpowers:executing-plans`, lotes con checkpoints.

**¿Cuál prefieres?**
