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
    const inner = screen.querySelector('.startmenu') as HTMLElement | null;
    if (inner) scaleIn(inner, 500);
  });
}
