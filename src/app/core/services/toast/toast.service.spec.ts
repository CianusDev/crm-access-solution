import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ToastService] });
    service = TestBed.inject(ToastService);
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  it('devrait démarrer avec une liste de toasts vide', () => {
    expect(service.getToasts()).toHaveLength(0);
  });

  describe('show()', () => {
    it('devrait ajouter un toast avec les bonnes propriétés', () => {
      service.show('Message test', 'success', 3000, 'Titre');
      const toasts = service.getToasts();
      expect(toasts).toHaveLength(1);
      expect(toasts[0]).toMatchObject({
        message: 'Message test',
        type: 'success',
        duration: 3000,
        title: 'Titre',
      });
    });

    it('devrait incrémenter l\'id à chaque nouveau toast', () => {
      service.show('Premier', 'info');
      service.show('Second', 'info');
      const toasts = service.getToasts();
      expect(toasts[0].id).toBe(0);
      expect(toasts[1].id).toBe(1);
    });

    it('devrait utiliser "info" comme type par défaut', () => {
      service.show('Message sans type');
      expect(service.getToasts()[0].type).toBe('info');
    });
  });

  describe('success()', () => {
    it('devrait ajouter un toast de type "success"', () => {
      service.success('Opération réussie');
      expect(service.getToasts()[0].type).toBe('success');
      expect(service.getToasts()[0].message).toBe('Opération réussie');
    });
  });

  describe('error()', () => {
    it('devrait ajouter un toast de type "error"', () => {
      service.error('Une erreur est survenue');
      expect(service.getToasts()[0].type).toBe('error');
    });
  });

  describe('warning()', () => {
    it('devrait ajouter un toast de type "warning"', () => {
      service.warning('Attention, vérifiez les données');
      expect(service.getToasts()[0].type).toBe('warning');
    });
  });

  describe('info()', () => {
    it('devrait ajouter un toast de type "info"', () => {
      service.info('Information importante');
      expect(service.getToasts()[0].type).toBe('info');
    });
  });

  describe('remove()', () => {
    it('devrait supprimer le toast correspondant à l\'id fourni', () => {
      service.show('A', 'info');
      service.show('B', 'info');
      const idASupprimer = service.getToasts()[0].id;
      service.remove(idASupprimer);
      expect(service.getToasts()).toHaveLength(1);
      expect(service.getToasts()[0].message).toBe('B');
    });

    it('ne devrait rien changer si l\'id est inconnu', () => {
      service.show('Toast existant', 'info');
      service.remove(999);
      expect(service.getToasts()).toHaveLength(1);
    });
  });

  describe('accumulation de toasts', () => {
    it('devrait accumuler plusieurs toasts indépendamment', () => {
      service.success('Succès');
      service.error('Erreur');
      service.warning('Avertissement');
      expect(service.getToasts()).toHaveLength(3);
    });

    it('devrait vider la liste après suppression de tous les toasts', () => {
      service.show('A', 'info');
      service.show('B', 'info');
      const [a, b] = service.getToasts();
      service.remove(a.id);
      service.remove(b.id);
      expect(service.getToasts()).toHaveLength(0);
    });
  });
});
