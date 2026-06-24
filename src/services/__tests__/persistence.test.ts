// Tests de persistencia en localStorage
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveProgress, loadProgress, marcarCompletado, desbloquearHerramienta, isCompletado } from '../persistence';

// Implementación mínima de localStorage para entornos sin DOM
class LocalStorageMock {
  private store: Map<string, string> = new Map();
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.get(key) ?? null; }
  setItem(key: string, value: string) { this.store.set(key, value); }
  removeItem(key: string) { this.store.delete(key); }
  get length() { return this.store.size; }
  key(index: number) { return [...this.store.keys()][index] ?? null; }
}

const lsMock = new LocalStorageMock();
vi.stubGlobal('localStorage', lsMock);

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
