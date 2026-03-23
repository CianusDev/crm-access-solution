import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [LocalStorageService] });
    service = TestBed.inject(LocalStorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('setState()', () => {
    it('devrait sérialiser et stocker une valeur primitive', () => {
      service.setState('cle', 'valeur');
      expect(localStorage.getItem('cle')).toBe('"valeur"');
    });

    it('devrait stocker un objet en JSON', () => {
      service.setState('utilisateur', { id: 1, nom: 'Dupont' });
      expect(localStorage.getItem('utilisateur')).toBe('{"id":1,"nom":"Dupont"}');
    });

    it('devrait stocker un nombre', () => {
      service.setState('compteur', 42);
      expect(localStorage.getItem('compteur')).toBe('42');
    });

    it('devrait écraser une valeur existante pour la même clé', () => {
      service.setState('cle', 'ancienne');
      service.setState('cle', 'nouvelle');
      expect(localStorage.getItem('cle')).toBe('"nouvelle"');
    });
  });

  describe('getState()', () => {
    it('devrait retourner la valeur désérialisée', () => {
      localStorage.setItem('cle', '"valeur"');
      expect(service.getState<string>('cle')).toBe('valeur');
    });

    it('devrait désérialiser un objet correctement', () => {
      localStorage.setItem('utilisateur', '{"id":1,"nom":"Dupont"}');
      expect(service.getState<{ id: number; nom: string }>('utilisateur')).toEqual({ id: 1, nom: 'Dupont' });
    });

    it('devrait retourner undefined si la clé est absente', () => {
      expect(service.getState<string>('cle_absente')).toBeUndefined();
    });
  });

  describe('removeState()', () => {
    it('devrait supprimer la clé du localStorage', () => {
      localStorage.setItem('cle', '"valeur"');
      service.removeState('cle');
      expect(localStorage.getItem('cle')).toBeNull();
    });

    it('ne devrait pas lever d\'erreur si la clé est absente', () => {
      expect(() => service.removeState('cle_absente')).not.toThrow();
    });
  });

  describe('clearState()', () => {
    it('devrait vider intégralement le localStorage', () => {
      service.setState('a', 1);
      service.setState('b', 2);
      service.clearState();
      expect(localStorage.length).toBe(0);
    });
  });
});
