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
