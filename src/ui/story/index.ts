// Story — escena cinematográfica para el capítulo de Refracción.
// Una frase poética → carril intuición + deducción plegable → botón al banco.
import { t } from '../i18n';
import { fade, runSequence } from '../../cinematics';

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
