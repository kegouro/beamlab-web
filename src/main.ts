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
