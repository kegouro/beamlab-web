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
