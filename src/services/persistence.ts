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
