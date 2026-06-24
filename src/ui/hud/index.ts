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
  let currentState = initial;

  const render = (s: HUDState) => {
    currentState = s;
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
        render(currentState);
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
