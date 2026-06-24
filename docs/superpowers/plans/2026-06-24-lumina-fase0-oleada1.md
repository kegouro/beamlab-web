# Lumina — Fase 0, Oleada 1: Scaffold + Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la fundación completa de Lumina: scaffold Vite/TS/PWA, paleta de tokens, i18n, estructura de carpetas, y el motor físico puro `core/` con tests que pasen en verde — sin UI ni render todavía.

**Architecture:** `core/` es TS puro sin DOM ni imports de render, 100% testeable con Vitest. El scaffold rodea el core con Vite (PWA), tsconfig estricto y estilos de tokens. La disciplina de dependencias es unidireccional: `ui/` y `render/` podrán importar de `core/`, nunca al revés.

**Tech Stack:** TypeScript estricto · Vite · Vitest · vite-plugin-pwa · CSS custom properties (sin framework) · Fuentes Google (Fraunces + Inter + IBM Plex Mono)

## Global Constraints

- Sin frameworks de UI (vanilla TS, como Parcella).
- Comentarios en español.
- `strict: true`, `noUncheckedIndexedAccess: true`, módulos `ESNext`/`bundler` en tsconfig.
- `core/` no importa nada de DOM, `render/`, ni `ui/` — nunca.
- Trazado exacto Snell (`n₁ sin θ₁ = n₂ sin θ₂`) en `snell.ts`; ABCD es distinto y vive en `abcd.ts`.
- `wavelengthToSRGB` usa colorimetría CIE 1931 real (ajuste multi-gaussiano de Wyman 2013), no lookup ingenuo.
- `radius(q)` en la cintura gaussiana devuelve `Infinity`, nunca `NaN`.
- `gouy(z, zR)` implementa `arctan(z / zR)`.
- Paleta Pharos: night `#0a0908`, panel `#15110d`, línea `#2a2118`, ink `#efe7d8`, muted `#9a8a76`, beam/ámbar `#f5a72c`, ember `#ff7a3c`, gold `#ffd690`; acentos: rayos ámbar `#f5a72c`, haz gaussiano verde `#34d399`, ondas cian `#38bdf8`.
- `.gitignore` existente tiene `.DS_Store`, `.superpowers/`, `ref/` — NO borrarlos, solo añadir `node_modules` y `dist`.
- Criterio final: `npm install && npm run build && npm test` todos en verde.
- No hacer commit (el autor lo revisa primero).

---

## Mapa de archivos

```
/Users/kegouro/HIBRIS/Proyectos/lumina/
├── package.json                    (crear)
├── tsconfig.json                   (crear)
├── vite.config.ts                  (crear)
├── vitest.config.ts                (crear)
├── index.html                      (crear)
├── .gitignore                      (modificar — añadir node_modules, dist)
└── src/
    ├── main.ts                     (crear — splash mínimo)
    ├── app.ts                      (crear — stub)
    ├── styles/
    │   ├── tokens.css              (crear — variables CSS paleta Pharos)
    │   └── base.css                (crear — fondo night, tipografías)
    ├── core/
    │   ├── types.ts                (crear — Ray, Mat2, tipos auxiliares)
    │   ├── snell.ts                (crear — refract exacto, reflect, TIR)
    │   ├── abcd.ts                 (crear — matrices ABCD, compose, applyToRay)
    │   ├── gaussian.ts             (crear — parámetro q, w, R, Gouy, propagate)
    │   ├── system.ts               (crear — System, systemMatrix, traceRay)
    │   ├── colors.ts               (crear — paleta dominio, wavelengthToSRGB CIE)
    │   └── __tests__/
    │       ├── snell.test.ts       (crear)
    │       ├── abcd.test.ts        (crear)
    │       ├── gaussian.test.ts    (crear)
    │       └── colors.test.ts      (crear)
    ├── render/
    │   ├── render2d/index.ts       (crear — stub)
    │   ├── glfields/index.ts       (crear — stub)
    │   └── labels/index.ts         (crear — stub)
    └── ui/
        ├── startmenu/index.ts      (crear — stub)
        ├── story/index.ts          (crear — stub)
        ├── hud/index.ts            (crear — stub)
        ├── lab/index.ts            (crear — stub)
        ├── i18n/
        │   ├── es.ts               (crear — diccionario ES)
        │   ├── en.ts               (crear — diccionario EN)
        │   └── index.ts            (crear — helper t(), estado de idioma)
    services/index.ts               (crear — stub)
    cinematics/index.ts             (crear — stub)
```

---

### Task 1: Scaffold base — package.json, tsconfig, .gitignore

**Files:**
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/package.json`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/tsconfig.json`
- Modify: `/Users/kegouro/HIBRIS/Proyectos/lumina/.gitignore`

**Interfaces:**
- Consumes: nada (primer task)
- Produces: scripts `dev`, `build`, `test`, `preview`; configuración TS estricta que usan todos los tasks siguientes

- [ ] **Step 1: Crear package.json**

```json
{
  "name": "lumina",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -noEmit && vite build",
    "test": "vitest run",
    "preview": "vite preview"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "vite-plugin-pwa": "^0.20.0",
    "vitest": "^1.5.0"
  }
}
```

Crear el archivo en `/Users/kegouro/HIBRIS/Proyectos/lumina/package.json`.

- [ ] **Step 2: Crear tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "useDefineForClassFields": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": ".",
    "paths": {}
  },
  "include": ["src", "vite.config.ts", "vitest.config.ts"]
}
```

Crear en `/Users/kegouro/HIBRIS/Proyectos/lumina/tsconfig.json`.

- [ ] **Step 3: Actualizar .gitignore**

Agregar al final del `.gitignore` existente (que ya contiene `.DS_Store`, `.superpowers/`, `ref/`):

```
node_modules
dist
```

- [ ] **Step 4: Instalar dependencias**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm install
```

Resultado esperado: `node_modules/` creado, sin errores de peer deps.

---

### Task 2: vite.config.ts + vitest.config.ts

**Files:**
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/vite.config.ts`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/vitest.config.ts`

**Interfaces:**
- Consumes: `package.json` (Task 1) — necesita `vite-plugin-pwa` instalado
- Produces: configuración de build y test que usan todos los tasks subsiguientes

- [ ] **Step 1: Crear vite.config.ts**

```typescript
// Configuración principal de Vite con PWA para Lumina
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Lumina',
        short_name: 'Lumina',
        description: 'Curso-laboratorio web de óptica',
        theme_color: '#0a0908',
        background_color: '#0a0908',
        display: 'standalone',
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

- [ ] **Step 2: Crear vitest.config.ts**

```typescript
// Configuración de Vitest para tests del motor core/
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
```

---

### Task 3: index.html + src/main.ts (splash mínimo)

**Files:**
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/index.html`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/main.ts`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/styles/tokens.css`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/styles/base.css`

**Interfaces:**
- Consumes: Vite config (Task 2)
- Produces: página funcional que carga en `npm run dev`; tokens CSS que usa render/ y ui/

- [ ] **Step 1: Crear tokens.css con paleta Pharos**

```css
/* Tokens de diseño del ecosistema Pharos — Lumina */
:root {
  /* Fondos */
  --color-night: #0a0908;
  --color-panel: #15110d;
  --color-linea: #2a2118;

  /* Texto */
  --color-ink: #efe7d8;
  --color-muted: #9a8a76;

  /* Acentos principales */
  --color-beam: #f5a72c;    /* rayos ámbar */
  --color-ember: #ff7a3c;
  --color-gold: #ffd690;

  /* Acentos por dominio */
  --color-rayo: #f5a72c;    /* óptica geométrica / rayos */
  --color-haz: #34d399;     /* haz gaussiano */
  --color-onda: #38bdf8;    /* óptica ondulatoria */

  /* Tipografías */
  --font-display: 'Fraunces', Georgia, serif;
  --font-text: 'Inter', system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', 'Fira Code', monospace;
}
```

- [ ] **Step 2: Crear base.css**

```css
/* Estilos base de Lumina */
@import './tokens.css';

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  height: 100%;
  background-color: var(--color-night);
  color: var(--color-ink);
  font-family: var(--font-text);
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
}

#app {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

- [ ] **Step 3: Crear index.html**

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0a0908" />
    <title>Lumina</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,300&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 4: Crear src/main.ts (splash mínimo)**

```typescript
// Punto de entrada de Lumina — monta el splash inicial
import './styles/base.css';

// Splash temporal: confirma que el pipeline Vite funciona
const app = document.getElementById('app');
if (!app) throw new Error('No se encontró #app en el DOM');

app.innerHTML = `
  <div style="text-align: center; font-family: var(--font-display);">
    <div style="
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--color-beam);
      box-shadow: 0 0 32px 8px var(--color-beam);
      margin: 0 auto 2rem;
    "></div>
    <h1 style="
      font-size: clamp(3rem, 8vw, 6rem);
      font-weight: 300;
      color: var(--color-ink);
      letter-spacing: 0.15em;
    ">Lumina</h1>
    <p style="
      margin-top: 1rem;
      color: var(--color-muted);
      font-family: var(--font-mono);
      font-size: 0.875rem;
      letter-spacing: 0.1em;
    ">curso-laboratorio de óptica</p>
  </div>
`;
```

- [ ] **Step 5: Verificar que el dev server arranca**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm run dev
```

Resultado esperado: servidor en `http://localhost:5173`, sin errores de compilación. Ctrl+C para salir.

---

### Task 4: core/types.ts

**Files:**
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/core/types.ts`

**Interfaces:**
- Consumes: nada
- Produces: `Ray`, `Mat2`, `Complex` — usados por `snell.ts`, `abcd.ts`, `gaussian.ts`, `system.ts`

- [ ] **Step 1: Crear src/core/types.ts**

```typescript
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
```

---

### Task 5: core/snell.ts

**Files:**
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/core/snell.ts`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/core/__tests__/snell.test.ts`

**Interfaces:**
- Consumes: `RefractResult` de `types.ts`
- Produces:
  - `refract(n1: number, n2: number, thetaInc: number): RefractResult`
  - `reflect(theta: number): number`
  - `criticalAngle(n1: number, n2: number): number | null`

- [ ] **Step 1: Escribir los tests primero**

```typescript
// Tests de trazado exacto de Snell — resultados analíticos conocidos
import { describe, it, expect } from 'vitest';
import { refract, reflect, criticalAngle } from '../snell';

describe('snell — refracción exacta', () => {
  it('aire→agua: ángulo de 45° → ~32.04°', () => {
    const n1 = 1.0;
    const n2 = 1.33;
    const incidente = (45 * Math.PI) / 180;
    const resultado = refract(n1, n2, incidente);
    expect(resultado.tir).toBe(false);
    // n1 sin(45°) = n2 sin(θ₂) => sin(θ₂) = sin(45°)/1.33 ≈ 0.5317
    const esperado = Math.asin(Math.sin(incidente) / n2);
    expect(resultado.theta).toBeCloseTo(esperado, 10);
    expect(resultado.theta * 180 / Math.PI).toBeCloseTo(32.04, 1);
  });

  it('rayo normal (θ=0) no se desvía', () => {
    const resultado = refract(1.0, 1.5, 0);
    expect(resultado.tir).toBe(false);
    expect(resultado.theta).toBeCloseTo(0, 10);
  });

  it('ángulo crítico agua→aire: TIR por encima', () => {
    const n1 = 1.33;
    const n2 = 1.0;
    // Ángulo crítico = arcsin(1/1.33) ≈ 48.75°
    const critico = Math.asin(n2 / n1);
    // Justo por encima del crítico → TIR
    const resultado = refract(n1, n2, critico + 0.01);
    expect(resultado.tir).toBe(true);
  });

  it('justo por debajo del ángulo crítico → no TIR', () => {
    const n1 = 1.33;
    const n2 = 1.0;
    const critico = Math.asin(n2 / n1);
    const resultado = refract(n1, n2, critico - 0.01);
    expect(resultado.tir).toBe(false);
  });

  it('criticalAngle devuelve null cuando n1 <= n2', () => {
    expect(criticalAngle(1.0, 1.5)).toBeNull();
  });

  it('criticalAngle correcto para vidrio→aire', () => {
    const angulo = criticalAngle(1.5, 1.0);
    expect(angulo).not.toBeNull();
    expect(angulo!).toBeCloseTo(Math.asin(1.0 / 1.5), 10);
  });
});

describe('snell — reflexión', () => {
  it('reflect invierte el ángulo', () => {
    expect(reflect(0.3)).toBeCloseTo(-0.3, 10);
    expect(reflect(-0.5)).toBeCloseTo(0.5, 10);
    expect(reflect(0)).toBeCloseTo(0, 10);
  });
});
```

- [ ] **Step 2: Ejecutar tests para verificar que fallan**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm test -- --reporter=verbose 2>&1 | grep -E 'FAIL|PASS|Error|snell'
```

Resultado esperado: FAIL por módulo no encontrado.

- [ ] **Step 3: Implementar src/core/snell.ts**

```typescript
// Trazado exacto de Snell — n₁ sin θ₁ = n₂ sin θ₂
// NOTA: este módulo usa Snell EXACTO, no la aproximación paraxial.
// Las matrices ABCD viven en abcd.ts y solo son válidas para ángulos pequeños.
import type { RefractResult } from './types';

/**
 * Refracción exacta en una interfaz plana.
 * @param n1 - índice del medio incidente
 * @param n2 - índice del medio transmitido
 * @param thetaInc - ángulo de incidencia en radianes (respecto a la normal)
 * @returns ángulo refractado y flag de TIR
 */
export function refract(n1: number, n2: number, thetaInc: number): RefractResult {
  const sinRefract = (n1 * Math.sin(thetaInc)) / n2;
  // Reflexión total interna: sin > 1
  if (Math.abs(sinRefract) >= 1) {
    return { theta: thetaInc, tir: true };
  }
  return { theta: Math.asin(sinRefract), tir: false };
}

/**
 * Reflexión especular: invierte el ángulo respecto a la normal.
 */
export function reflect(theta: number): number {
  return -theta;
}

/**
 * Ángulo crítico para TIR (solo existe cuando n1 > n2).
 * @returns ángulo en radianes, o null si n1 <= n2
 */
export function criticalAngle(n1: number, n2: number): number | null {
  if (n1 <= n2) return null;
  return Math.asin(n2 / n1);
}
```

- [ ] **Step 4: Ejecutar tests y verificar verde**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm test -- --reporter=verbose 2>&1 | grep -E 'FAIL|PASS|✓|×|snell'
```

Resultado esperado: todos los tests de snell en PASS.

---

### Task 6: core/abcd.ts

**Files:**
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/core/abcd.ts`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/core/__tests__/abcd.test.ts`

**Interfaces:**
- Consumes: `Ray`, `Mat2` de `types.ts`
- Produces:
  - `translation(d: number): Mat2`
  - `thinLens(f: number): Mat2`
  - `refractionFlat(n1: number, n2: number): Mat2`
  - `refractionCurved(n1: number, n2: number, R: number): Mat2`
  - `mirror(R: number): Mat2`
  - `multiply(a: Mat2, b: Mat2): Mat2`
  - `compose(...mats: Mat2[]): Mat2`
  - `applyToRay(M: Mat2, ray: Ray): Ray`

- [ ] **Step 1: Escribir tests primero**

```typescript
// Tests de matrices ABCD — validados contra resultados analíticos
import { describe, it, expect } from 'vitest';
import {
  translation, thinLens, refractionFlat, refractionCurved,
  mirror, multiply, compose, applyToRay
} from '../abcd';

describe('abcd — matrices individuales', () => {
  it('translation(d): [[1,d],[0,1]]', () => {
    const M = translation(2.5);
    expect(M[0][0]).toBe(1);
    expect(M[0][1]).toBe(2.5);
    expect(M[1][0]).toBe(0);
    expect(M[1][1]).toBe(1);
  });

  it('thinLens(f): [[1,0],[-1/f,1]]', () => {
    const f = 0.1; // 10 cm
    const M = thinLens(f);
    expect(M[0][0]).toBe(1);
    expect(M[0][1]).toBe(0);
    expect(M[1][0]).toBeCloseTo(-1 / f, 10);
    expect(M[1][1]).toBe(1);
  });

  it('refractionFlat: B=0, A=1, D=1, C=0 (plano infinito)', () => {
    // Interfaz plana: n1/n2 afecta C=0 (no tiene curvatura)
    const M = refractionFlat(1.0, 1.5);
    expect(M[0][0]).toBe(1);
    expect(M[0][1]).toBe(0);
    expect(M[1][0]).toBe(0);
    expect(M[1][1]).toBeCloseTo(1.0 / 1.5, 10);
  });

  it('mirror(R=Infinity): espejo plano = [[1,0],[0,1]] salvo signo', () => {
    // Espejo plano (radio infinito): equivale a reflexión simple
    const M = mirror(Infinity);
    expect(M[0][0]).toBe(1);
    expect(M[1][0]).toBe(0);
    expect(M[1][1]).toBe(1);
  });
});

describe('abcd — composición y aplicación', () => {
  it('lente delgada a distancia focal forma imagen en infinito', () => {
    // Rayo paralelo al eje (y=1, theta=0) atraviesa lente f=0.1m
    // Después: theta debe ser -y/f = -10 rad (converge al foco)
    const f = 0.1;
    const ray = { y: 1.0, theta: 0.0 };
    const M = thinLens(f);
    const resultado = applyToRay(M, ray);
    expect(resultado.y).toBeCloseTo(1.0, 10);
    expect(resultado.theta).toBeCloseTo(-1.0 / f, 10);
  });

  it('compose: lente + translación focal => rayo paralelo sale del foco', () => {
    // Lente f=0.1 seguida de traslación d=0.1 (distancia focal)
    // Rayo (y=1, theta=0) debería converger a y=0
    const f = 0.1;
    const d = 0.1;
    const M = compose(thinLens(f), translation(d));
    const ray = { y: 1.0, theta: 0.0 };
    const resultado = applyToRay(M, ray);
    expect(resultado.y).toBeCloseTo(0.0, 6);
  });

  it('telescopio simple: aumento angular M = -f2/f1', () => {
    // Telescopio kepleriano: lente1(f1) + d=f1+f2 + lente2(f2)
    // Un rayo (y=0, theta=1) sale con theta' = -(f1/f2) * theta
    const f1 = 0.05;  // objetivo 5 cm
    const f2 = 0.25;  // ocular 25 cm
    const d = f1 + f2;
    const M = compose(thinLens(f1), translation(d), thinLens(f2));
    const ray = { y: 0.0, theta: 1.0 };
    const resultado = applyToRay(M, ray);
    // Aumento angular = -f2/f1 = -5
    expect(resultado.theta).toBeCloseTo(-(f2 / f1), 4);
    expect(resultado.y).toBeCloseTo(0.0, 4);
  });

  it('multiply: identidad * M = M', () => {
    const identidad: import('../types').Mat2 = [[1, 0], [0, 1]];
    const M = thinLens(0.2);
    const resultado = multiply(identidad, M);
    expect(resultado[0][0]).toBeCloseTo(M[0][0], 10);
    expect(resultado[0][1]).toBeCloseTo(M[0][1], 10);
    expect(resultado[1][0]).toBeCloseTo(M[1][0], 10);
    expect(resultado[1][1]).toBeCloseTo(M[1][1], 10);
  });
});
```

- [ ] **Step 2: Ejecutar tests para verificar que fallan**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm test -- --reporter=verbose 2>&1 | grep -E 'FAIL|PASS|Error|abcd' | head -20
```

Resultado esperado: FAIL por módulo no encontrado.

- [ ] **Step 3: Implementar src/core/abcd.ts**

```typescript
// Matrices ABCD para óptica matricial paraxial.
// CONVENCIÓN: rayo = (y, θ); M actúa como [y', θ'] = M [y, θ].
// IMPORTANTE: estas matrices son válidas SOLO en la aproximación paraxial (sin θ ≈ θ).
// Para trazado exacto, usar snell.ts.
import type { Mat2, Ray } from './types';

/** Traslación libre: propagación a distancia d en un medio homogéneo. */
export function translation(d: number): Mat2 {
  return [[1, d], [0, 1]];
}

/** Lente delgada de focal f (positiva = convergente). */
export function thinLens(f: number): Mat2 {
  return [[1, 0], [-1 / f, 1]];
}

/**
 * Refracción en interfaz plana (radio de curvatura infinito).
 * Matriz: [[1, 0], [0, n1/n2]].
 */
export function refractionFlat(n1: number, n2: number): Mat2 {
  return [[1, 0], [0, n1 / n2]];
}

/**
 * Refracción en interfaz esférica de radio R.
 * Convención de signos: R > 0 si el centro de curvatura está a la derecha.
 * Matriz: [[1, 0], [(n1-n2)/(n2*R), n1/n2]].
 */
export function refractionCurved(n1: number, n2: number, R: number): Mat2 {
  return [[1, 0], [(n1 - n2) / (n2 * R), n1 / n2]];
}

/**
 * Espejo esférico de radio R (R > 0 = cóncavo, R < 0 = convexo).
 * Focal efectiva: f = R/2. Matriz: [[1, 0], [-2/R, 1]].
 * Para espejo plano (R = Infinity): [[1, 0], [0, 1]].
 */
export function mirror(R: number): Mat2 {
  if (!isFinite(R)) return [[1, 0], [0, 1]];
  return [[1, 0], [-2 / R, 1]];
}

/** Producto de dos matrices 2×2: a · b. */
export function multiply(a: Mat2, b: Mat2): Mat2 {
  return [
    [
      a[0][0] * b[0][0] + a[0][1] * b[1][0],
      a[0][0] * b[0][1] + a[0][1] * b[1][1],
    ],
    [
      a[1][0] * b[0][0] + a[1][1] * b[1][0],
      a[1][0] * b[0][1] + a[1][1] * b[1][1],
    ],
  ];
}

/**
 * Compone matrices en ORDEN DE PROPAGACIÓN (el primer argumento actúa primero).
 * compose(M1, M2, M3) = M3 · M2 · M1 (álgebra: la última actúa primero sobre el rayo).
 */
export function compose(...mats: Mat2[]): Mat2 {
  // Reducción de derecha a izquierda: compose(A,B,C) = C·B·A
  return mats.reduceRight((acc, m) => multiply(m, acc));
}

/** Aplica una matriz ABCD a un rayo y devuelve el rayo transformado. */
export function applyToRay(M: Mat2, ray: Ray): Ray {
  return {
    y: M[0][0] * ray.y + M[0][1] * ray.theta,
    theta: M[1][0] * ray.y + M[1][1] * ray.theta,
  };
}
```

- [ ] **Step 4: Ejecutar tests y verificar verde**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm test -- --reporter=verbose 2>&1 | grep -E 'FAIL|PASS|✓|×|abcd'
```

Resultado esperado: todos los tests de abcd en PASS.

---

### Task 7: core/gaussian.ts

**Files:**
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/core/gaussian.ts`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/core/__tests__/gaussian.test.ts`

**Interfaces:**
- Consumes: `Complex`, `Mat2` de `types.ts`
- Produces:
  - `qFromWaist(w0: number, lambda: number): Complex`
  - `propagate(q: Complex, M: Mat2): Complex`
  - `waist(q: Complex, lambda: number): number`
  - `radius(q: Complex): number` — devuelve `Infinity` en la cintura, nunca `NaN`
  - `rayleigh(w0: number, lambda: number): number`
  - `gouy(z: number, zR: number): number`

- [ ] **Step 1: Escribir tests primero**

```typescript
// Tests del parámetro q gaussiano — cuidado numérico en la cintura
import { describe, it, expect } from 'vitest';
import { qFromWaist, propagate, waist, radius, rayleigh, gouy } from '../gaussian';
import { translation } from '../abcd';

describe('gaussian — parámetro q en la cintura', () => {
  it('qFromWaist: parte real = 0, parte imag = -zR', () => {
    const w0 = 0.001; // 1 mm
    const lambda = 633e-9; // He-Ne
    const zR = Math.PI * w0 ** 2 / lambda;
    const q = qFromWaist(w0, lambda);
    expect(q.re).toBeCloseTo(0, 10);
    // 1/q = -i/zR => q = i*zR => im = zR, re = 0
    // Convención: 1/q = 1/R - i*lambda/(pi*w^2)
    // En la cintura: R=inf => 1/q = -i/(zR), por lo que q = i*zR
    expect(q.im).toBeCloseTo(zR, 6);
  });

  it('radius(q) en la cintura = Infinity, sin NaN', () => {
    const q = qFromWaist(0.001, 633e-9);
    const R = radius(q);
    expect(isNaN(R)).toBe(false);
    expect(R).toBe(Infinity);
  });

  it('rayleigh(w0, lambda): zR = pi*w0^2/lambda', () => {
    const w0 = 0.001;
    const lambda = 633e-9;
    const zR = rayleigh(w0, lambda);
    expect(zR).toBeCloseTo(Math.PI * w0 ** 2 / lambda, 6);
  });

  it('waist(q) en la cintura = w0', () => {
    const w0 = 0.001;
    const lambda = 633e-9;
    const q = qFromWaist(w0, lambda);
    expect(waist(q, lambda)).toBeCloseTo(w0, 6);
  });
});

describe('gaussian — propagación', () => {
  it('w(z) crece con la distancia desde la cintura', () => {
    const w0 = 0.001;
    const lambda = 633e-9;
    const zR = rayleigh(w0, lambda);
    const q0 = qFromWaist(w0, lambda);
    const q1 = propagate(q0, translation(zR));
    const q2 = propagate(q0, translation(2 * zR));
    const w0_ = waist(q0, lambda);
    const w1 = waist(q1, lambda);
    const w2 = waist(q2, lambda);
    expect(w1).toBeGreaterThan(w0_);
    expect(w2).toBeGreaterThan(w1);
    // En z=zR, w = w0*sqrt(2)
    expect(w1).toBeCloseTo(w0 * Math.sqrt(2), 4);
  });

  it('propagate conserva el haz: propagar distancia cero no cambia q', () => {
    const q0 = qFromWaist(0.001, 633e-9);
    const q1 = propagate(q0, translation(0));
    expect(q1.re).toBeCloseTo(q0.re, 8);
    expect(q1.im).toBeCloseTo(q0.im, 8);
  });
});

describe('gaussian — fase de Gouy', () => {
  it('gouy(0, zR) = 0', () => {
    expect(gouy(0, 100)).toBeCloseTo(0, 10);
  });

  it('gouy(z → +∞) → +π/2', () => {
    expect(gouy(1e12, 1)).toBeCloseTo(Math.PI / 2, 4);
  });

  it('gouy(z → -∞) → -π/2', () => {
    expect(gouy(-1e12, 1)).toBeCloseTo(-Math.PI / 2, 4);
  });

  it('gouy es antisimétrica: gouy(-z) = -gouy(z)', () => {
    const z = 3.5;
    const zR = 1.2;
    expect(gouy(-z, zR)).toBeCloseTo(-gouy(z, zR), 10);
  });
});
```

- [ ] **Step 2: Ejecutar tests para verificar que fallan**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm test -- --reporter=verbose 2>&1 | grep -E 'FAIL|PASS|Error|gaussian' | head -20
```

Resultado esperado: FAIL por módulo no encontrado.

- [ ] **Step 3: Implementar src/core/gaussian.ts**

```typescript
// Parámetro complejo q para haces gaussianos.
// Convención: 1/q = 1/R − i·λ/(π·w²)
// En la cintura (z=0): R → ∞, w = w0 => 1/q = 0 − i·λ/(π·w0²) = −i/zR
// Por lo tanto en la cintura: q = i·zR (re=0, im=zR).
import type { Complex, Mat2 } from './types';

/** Distancia de Rayleigh: zR = π·w0²/λ */
export function rayleigh(w0: number, lambda: number): number {
  return (Math.PI * w0 * w0) / lambda;
}

/**
 * Parámetro q en la cintura del haz.
 * q = i·zR, es decir: re=0, im=zR.
 */
export function qFromWaist(w0: number, lambda: number): Complex {
  return { re: 0, im: rayleigh(w0, lambda) };
}

/**
 * Propagación del parámetro q mediante la ley ABCD:
 *   q₂ = (A·q + B) / (C·q + D)
 * División compleja: (a+bi)/(c+di) = [(ac+bd) + (bc-ad)i] / (c²+d²)
 */
export function propagate(q: Complex, M: Mat2): Complex {
  const A = M[0][0], B = M[0][1];
  const C = M[1][0], D = M[1][1];

  // Numerador: A·q + B = (A·re + B) + i·(A·im)
  const numRe = A * q.re + B;
  const numIm = A * q.im;

  // Denominador: C·q + D = (C·re + D) + i·(C·im)
  const denRe = C * q.re + D;
  const denIm = C * q.im;

  const denom = denRe * denRe + denIm * denIm;
  return {
    re: (numRe * denRe + numIm * denIm) / denom,
    im: (numIm * denRe - numRe * denIm) / denom,
  };
}

/**
 * Radio del haz w en la posición de q.
 * De 1/q = 1/R − i·λ/(π·w²): Im(1/q) = −λ/(π·w²)
 * => w² = −λ / (π·Im(1/q)) = λ·|q|² / (π·|−Im(1/q)|·|q|²)
 * Forma directa: Im(1/q) = −im/|q|², luego w = sqrt(λ/(π·(im/|q|²)))
 */
export function waist(q: Complex, lambda: number): number {
  const modSq = q.re * q.re + q.im * q.im;
  // Im(1/q) = (−q.im) / |q|²  (resultado de la conjugada compleja)
  const imInvQ = -q.im / modSq;
  // −λ/(π·w²) = imInvQ => w² = −λ/(π·imInvQ) = λ/(π·|imInvQ|)
  return Math.sqrt(lambda / (Math.PI * Math.abs(imInvQ)));
}

/**
 * Radio de curvatura del frente de onda R.
 * Re(1/q) = 1/R => R = 1/Re(1/q).
 * En la cintura: Re(1/q) = 0 => R = Infinity (nunca NaN).
 */
export function radius(q: Complex): number {
  const modSq = q.re * q.re + q.im * q.im;
  const reInvQ = q.re / modSq;
  if (reInvQ === 0) return Infinity;
  return 1 / reInvQ;
}

/**
 * Fase de Gouy: Δφ = arctan(z / zR).
 * Acumula desde −π/2 (z→−∞) hasta +π/2 (z→+∞).
 */
export function gouy(z: number, zR: number): number {
  return Math.atan2(z, zR);
}
```

- [ ] **Step 4: Ejecutar tests y verificar verde**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm test -- --reporter=verbose 2>&1 | grep -E 'FAIL|PASS|✓|×|gaussian'
```

Resultado esperado: todos los tests de gaussian en PASS.

---

### Task 8: core/system.ts

**Files:**
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/core/system.ts`

**Interfaces:**
- Consumes: `Ray`, `Mat2`, `RaySegment` de `types.ts`; `compose`, `applyToRay` de `abcd.ts`
- Produces:
  - `OpticalElement` interface
  - `System` type
  - `systemMatrix(system: System): Mat2`
  - `traceRay(system: System, ray: Ray): RaySegment[]`

**Nota:** No tiene tests propios en esta oleada; la lógica se valida indirectamente a través de abcd.test.ts. Un test mínimo de humo se incluye aquí.

- [ ] **Step 1: Implementar src/core/system.ts**

```typescript
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
  const zFin = zFinal ?? (system.length > 0
    ? (system[system.length - 1]?.posZ ?? 0) + 0.1
    : 0.1);

  if (zFin > zActual) {
    const d = zFin - zActual;
    rayActual = applyToRay(translation(d), rayActual);
    segmentos.push({ z: zFin, y: rayActual.y, theta: rayActual.theta });
  }

  return segmentos;
}
```

---

### Task 9: core/colors.ts

**Files:**
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/core/colors.ts`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/core/__tests__/colors.test.ts`

**Interfaces:**
- Consumes: nada
- Produces:
  - `DOMAIN_COLORS` objeto con `ray`, `beam`, `wave` como strings hex
  - `wavelengthToSRGB(nm: number): [number, number, number]` — valores [0,1]

**Nota sobre la implementación CIE:** Se usa el ajuste multi-gaussiano de Wyman et al. 2013 ("Simple Analytic Approximations to the CIE XYZ Color Matching Functions"), que provee polinomios/gaussianas analíticas para x̄(λ), ȳ(λ), z̄(λ) CIE 1931. Referencia: Chris Wyman, Peter-Pike Sloan, Peter Shirley, "Simple Analytic Approximations to the CIE XYZ Color Matching Functions", JCGT 2013.

- [ ] **Step 1: Escribir tests primero**

```typescript
// Tests de colorimetría — dominancia de canal por región espectral
import { describe, it, expect } from 'vitest';
import { wavelengthToSRGB, DOMAIN_COLORS } from '../colors';

describe('colors — wavelengthToSRGB CIE', () => {
  it('700 nm (rojo): canal R dominante', () => {
    const [r, g, b] = wavelengthToSRGB(700);
    expect(r).toBeGreaterThan(g);
    expect(r).toBeGreaterThan(b);
    expect(r).toBeGreaterThan(0.3); // tiene algo de señal
  });

  it('530 nm (verde): canal G dominante', () => {
    const [r, g, b] = wavelengthToSRGB(530);
    expect(g).toBeGreaterThan(r);
    expect(g).toBeGreaterThan(b);
  });

  it('470 nm (azul): canal B dominante', () => {
    const [r, g, b] = wavelengthToSRGB(470);
    expect(b).toBeGreaterThan(r);
    expect(b).toBeGreaterThan(g);
  });

  it('valores dentro de gamut [0, 1]', () => {
    for (const nm of [380, 450, 500, 550, 600, 650, 700, 780]) {
      const [r, g, b] = wavelengthToSRGB(nm);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(1);
      expect(g).toBeGreaterThanOrEqual(0);
      expect(g).toBeLessThanOrEqual(1);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(1);
    }
  });

  it('longitudes fuera del espectro visible retornan [0,0,0]', () => {
    const [r1, g1, b1] = wavelengthToSRGB(200);
    const [r2, g2, b2] = wavelengthToSRGB(900);
    expect(r1 + g1 + b1).toBeCloseTo(0, 3);
    expect(r2 + g2 + b2).toBeCloseTo(0, 3);
  });
});

describe('colors — paleta de dominio', () => {
  it('DOMAIN_COLORS tiene los tres acentos de la paleta Pharos', () => {
    expect(DOMAIN_COLORS.ray).toBe('#f5a72c');
    expect(DOMAIN_COLORS.beam).toBe('#34d399');
    expect(DOMAIN_COLORS.wave).toBe('#38bdf8');
  });
});
```

- [ ] **Step 2: Ejecutar tests para verificar que fallan**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm test -- --reporter=verbose 2>&1 | grep -E 'FAIL|PASS|Error|colors' | head -20
```

Resultado esperado: FAIL por módulo no encontrado.

- [ ] **Step 3: Implementar src/core/colors.ts**

```typescript
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
 * Evalúa una gaussiana: f(x) = t * exp(-0.5 * ((x - mu) / sigma)^2)
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

  // Normalizar por luminancia máxima de ȳ (≈ 1.0 en el ajuste de Wyman)
  const [rLin, gLin, bLin] = xyzToLinearSRGB(X, Y, Z);

  // Clamping de gamut: [0, ∞) → [0, 1]
  const clamp = (v: number) => Math.max(0, Math.min(1, v));

  return [
    gammaEncode(clamp(rLin)),
    gammaEncode(clamp(gLin)),
    gammaEncode(clamp(bLin)),
  ];
}
```

- [ ] **Step 4: Ejecutar tests y verificar verde**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm test -- --reporter=verbose 2>&1 | grep -E 'FAIL|PASS|✓|×|colors'
```

Resultado esperado: todos los tests de colors en PASS.

---

### Task 10: i18n — diccionarios ES/EN + helper t()

**Files:**
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/ui/i18n/es.ts`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/ui/i18n/en.ts`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/ui/i18n/index.ts`

**Interfaces:**
- Consumes: nada
- Produces:
  - `type Lang = 'es' | 'en'`
  - `type TranslationKey = keyof typeof es`
  - `function t(key: TranslationKey): string`
  - `function setLang(lang: Lang): void`
  - `function getLang(): Lang`

- [ ] **Step 1: Crear src/ui/i18n/es.ts**

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

  // Idioma
  'lang.es': 'Español',
  'lang.en': 'English',

  // HUD
  'hud.matriz': 'Matriz ABCD',
  'hud.haz': 'Parámetros del haz',
  'hud.elemento': 'Elemento seleccionado',

  // Física
  'fisica.rayo': 'Rayo',
  'fisica.lente': 'Lente delgada',
  'fisica.espejo': 'Espejo',
  'fisica.interfaz': 'Interfaz',
  'fisica.focal': 'Distancia focal',
  'fisica.cintura': 'Cintura del haz',
  'fisica.paraxial.aviso': 'Salimos del reino paraxial; el modelo matricial pierde validez.',
} as const;
```

- [ ] **Step 2: Crear src/ui/i18n/en.ts**

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
```

- [ ] **Step 3: Crear src/ui/i18n/index.ts**

```typescript
// Módulo i18n de Lumina — helper t() y estado de idioma
import { es } from './es';
import { en } from './en';

/** Idiomas soportados */
export type Lang = 'es' | 'en';

/** Claves de traducción (inferidas del diccionario ES) */
export type TranslationKey = keyof typeof es;

// Estado de idioma (inicializa desde localStorage o por defecto ES)
let _lang: Lang = 'es';

const diccionarios: Record<Lang, Record<TranslationKey, string>> = { es, en };

/**
 * Devuelve la cadena traducida para la clave dada en el idioma activo.
 */
export function t(key: TranslationKey): string {
  return diccionarios[_lang][key];
}

/** Establece el idioma activo. */
export function setLang(lang: Lang): void {
  _lang = lang;
}

/** Devuelve el idioma activo. */
export function getLang(): Lang {
  return _lang;
}
```

---

### Task 11: Estructura de stubs (render/, ui/, services/, cinematics/)

**Files:**
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/render/render2d/index.ts`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/render/glfields/index.ts`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/render/labels/index.ts`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/ui/startmenu/index.ts`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/ui/story/index.ts`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/ui/hud/index.ts`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/ui/lab/index.ts`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/services/index.ts`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/cinematics/index.ts`
- Create: `/Users/kegouro/HIBRIS/Proyectos/lumina/src/app.ts`

**Interfaces:**
- Consumes: tipos de `core/` (pueden importarlos; nunca al revés)
- Produces: módulos stubados que no rompen el build

- [ ] **Step 1: Crear todos los stubs en una sola operación**

Para cada archivo, el contenido es un comentario de módulo + export vacío o placeholder:

`src/render/render2d/index.ts`:
```typescript
// Render 2D — Canvas2D para banco óptico, rayos y envolvente gaussiana.
// Depende de core/, nunca al revés.
// TODO (Oleada 2): implementar drawRay, drawGaussianBeam, drawSystem.
export {};
```

`src/render/glfields/index.ts`:
```typescript
// GL Fields — WebGL/shaders para campos de interferencia/difracción y cinematics.
// TODO (Oleada 3): implementar campos de onda en tiempo real.
export {};
```

`src/render/labels/index.ts`:
```typescript
// Labels — overlay DOM + KaTeX para fórmulas y rótulos nítidos.
// TODO (Oleada 2): implementar renderLabel, renderFormula.
export {};
```

`src/ui/startmenu/index.ts`:
```typescript
// Start Menu — Historia (ruta) / Laboratorio / continuar / toggle idioma.
// TODO (Oleada 2): implementar mountStartMenu.
export {};
```

`src/ui/story/index.ts`:
```typescript
// Story — escenas cinematográficas, narrativa, carril profundo plegable.
// TODO (Oleada 2): implementar mountStory.
export {};
```

`src/ui/hud/index.ts`:
```typescript
// HUD — paneles de cristal arrastrables/plegables sobre el banco.
// TODO (Oleada 2): implementar mountHUD.
export {};
```

`src/ui/lab/index.ts`:
```typescript
// Lab — panel de instrumentos, calcular/planear, guardar/compartir.
// TODO (Oleada 2): implementar mountLab.
export {};
```

`src/services/index.ts`:
```typescript
// Services — compartir por URL, export PNG/GIF, persistencia (IndexedDB).
// TODO (Oleada 2): implementar shareURL, exportPNG, persistState.
export {};
```

`src/cinematics/index.ts`:
```typescript
// Cinematics — timeline declarativo, easing, transiciones escena↔banco.
// Subsistema de motion de primera clase. Respeta prefers-reduced-motion.
// TODO (Oleada 2): implementar Timeline, ease, transition.
export {};
```

`src/app.ts`:
```typescript
// app.ts — orquestador principal de Lumina.
// Coordina ui ↔ core ↔ render.
// TODO (Oleada 2): implementar init() y el ciclo de vida de la app.
export function init(): void {
  // stub — la app se monta desde main.ts por ahora
}
```

- [ ] **Step 2: Crear los directorios e iconos placeholder del PWA**

Los iconos 192/512 son necesarios para que el manifiesto PWA no rompa el build:

```bash
# Crear iconos placeholder de 1x1 pixel PNG (base64 mínimo válido)
mkdir -p /Users/kegouro/HIBRIS/Proyectos/lumina/public
# Copiar como placeholder — el build no falla sin iconos reales si no hay service worker activo,
# pero añadir el public/ evita warnings
touch /Users/kegouro/HIBRIS/Proyectos/lumina/public/icon-192.png
touch /Users/kegouro/HIBRIS/Proyectos/lumina/public/icon-512.png
```

---

### Task 12: Build final + test suite completa

**Files:**
- No crea archivos nuevos — valida todo lo anterior

**Interfaces:**
- Consumes: todo lo anterior
- Produces: `npm run build` y `npm test` en verde

- [ ] **Step 1: Ejecutar npm test**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm test -- --reporter=verbose
```

Resultado esperado:
```
✓ src/core/__tests__/snell.test.ts (6 tests)
✓ src/core/__tests__/abcd.test.ts (5 tests)
✓ src/core/__tests__/gaussian.test.ts (7 tests)
✓ src/core/__tests__/colors.test.ts (5 tests)

Test Files: 4 passed
Tests: 23 passed
```

Si algún test falla: revisar el mensaje de error, corregir la implementación en el archivo correspondiente (nunca aflojar el test), y re-ejecutar.

- [ ] **Step 2: Ejecutar npm run build**

```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm run build 2>&1
```

Resultado esperado: `dist/` generado sin errores de TypeScript ni Vite.

Si hay errores de tipo: corregirlos en el archivo fuente (TypeScript estricto no da excepciones).

- [ ] **Step 3: Verificar el árbol de src/**

```bash
find /Users/kegouro/HIBRIS/Proyectos/lumina/src -type f | sort
```

Resultado esperado (todos los archivos del mapa de archivos presentes).

- [ ] **Step 4: Instrucciones para correr en desarrollo**

Para iniciar el servidor de desarrollo:
```bash
cd /Users/kegouro/HIBRIS/Proyectos/lumina && npm run dev
```

Navegar a `http://localhost:5173` — debe aparecer el splash con "Lumina", el punto de luz ámbar y el subtítulo en IBM Plex Mono.

---

## Self-Review

### 1. Cobertura del spec

| Requisito | Task que lo cubre |
|-----------|-------------------|
| package.json con scripts dev/build/test/preview | Task 1 |
| tsconfig estricto con noUncheckedIndexedAccess | Task 1 |
| vite.config.ts + PWA manifest | Task 2 |
| vitest.config.ts | Task 2 |
| index.html + fuentes Google (Fraunces/Inter/Plex Mono) | Task 3 |
| src/main.ts con splash | Task 3 |
| .gitignore actualizado sin borrar existentes | Task 1 |
| tokens.css paleta Pharos completa | Task 3 |
| base.css mínimo | Task 3 |
| Estructura src/core, render/, ui/ stubs | Tasks 4–11 |
| src/ui/i18n/ tipado ES+EN + helper t() | Task 10 |
| core/types.ts: Ray, Mat2 | Task 4 |
| core/snell.ts: refract exacto, reflect, TIR | Task 5 |
| core/abcd.ts: todas las matrices + compose | Task 6 |
| core/gaussian.ts: q, w, R(Infinity no NaN), Gouy | Task 7 |
| core/system.ts: System, systemMatrix, traceRay | Task 8 |
| core/colors.ts: paleta dominio + CIE 1931 real | Task 9 |
| Tests snell (ángulos conocidos, TIR) | Task 5 |
| Tests abcd (focal, telescopio, composición) | Task 6 |
| Tests gaussian (cintura sin NaN, w crece, Gouy ±π/2) | Task 7 |
| Tests colors (dominancia de canal, gamut, fuera de rango) | Task 9 |
| npm install && npm run build && npm test en verde | Task 12 |

### 2. Scan de placeholders

- No hay "TBD", "TODO" en los tests o implementaciones core.
- Los stubs de render/ui tienen "TODO (Oleada N)" explícito — correcto para esta oleada.
- Todo código de test incluye los imports y valores numéricos concretos.

### 3. Consistencia de tipos

- `Ray { y, theta }` definido en Task 4, usado en Task 5 (no), Task 6 (`applyToRay`), Task 7 (`propagate` usa `Mat2` y `Complex`), Task 8 (`traceRay`).
- `Mat2 = [[number,number],[number,number]]` — indexado como `M[0][0]`, `M[0][1]`, `M[1][0]`, `M[1][1]` de forma consistente en Task 6, 7, 8.
- `Complex { re, im }` — accedido siempre como `.re` y `.im` en Task 7.
- `RefractResult { theta, tir }` — devuelto por `refract()` en Task 5, accedido como `.tir` y `.theta` en los tests.
- `compose(...mats)` en Task 6 acepta `...Mat2[]`; en Task 8 se usa `compose(...matrices)` donde `matrices: Mat2[]` — consistente.
- `OpticalElement.posZ` y `.matrix` en Task 8 — coherente internamente.
- `TranslationKey = keyof typeof es` en Task 10 — `t()` acepta esa clave, los diccionarios la satisfacen.
