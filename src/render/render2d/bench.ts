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
  onFermatPChange: (py: number) => void;  // py en coordenadas bench norm [-1, 1]
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
 * Busca en el rango [minPy, maxPy] con 80 iteraciones.
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
   * Dibuja un segmento con antialiasing (línea con halo).
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
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Capa difusa (halo para antialiasing)
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
    ctx.fillStyle = DOMAIN_COLORS.ray;
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

