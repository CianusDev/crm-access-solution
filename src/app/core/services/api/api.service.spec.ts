import { TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpParams } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ApiService } from './api.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { environment } from 'src/environments/environment';

const BASE = environment.apiUrl;

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        LocalStorageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  // ── get() ─────────────────────────────────────────────────────────────────

  describe('get()', () => {
    it('devrait envoyer une requête GET à l\'URL complète', () => {
      service.get('/test').subscribe();
      const req = httpMock.expectOne(`${BASE}/test`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('devrait retourner la réponse du serveur', () => {
      const données = { items: [1, 2, 3] };
      let résultat: any;
      service.get('/items').subscribe((res) => (résultat = res));
      httpMock.expectOne(`${BASE}/items`).flush(données);
      expect(résultat).toEqual(données);
    });

    it('devrait transmettre les HttpParams à la requête', () => {
      const params = new HttpParams().set('page', '1');
      service.get('/items', params).subscribe();
      const req = httpMock.expectOne(
        (r) => r.url === `${BASE}/items` && r.params.get('page') === '1',
      );
      expect(req).toBeTruthy();
      req.flush({});
    });

    it('devrait ajouter l\'en-tête Content-Type application/json', () => {
      service.get('/test').subscribe();
      const req = httpMock.expectOne(`${BASE}/test`);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush({});
    });
  });

  // ── post() ────────────────────────────────────────────────────────────────

  describe('post()', () => {
    it('devrait envoyer une requête POST avec le corps correct', () => {
      const corps = { nom: 'Test' };
      service.post('/save', corps).subscribe();
      const req = httpMock.expectOne(`${BASE}/save`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(corps);
      req.flush({ status: 201 });
    });
  });

  // ── put() ─────────────────────────────────────────────────────────────────

  describe('put()', () => {
    it('devrait envoyer une requête PUT avec le corps correct', () => {
      service.put('/update/1', { nom: 'Modifié' }).subscribe();
      const req = httpMock.expectOne(`${BASE}/update/1`);
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });
  });

  // ── patch() ───────────────────────────────────────────────────────────────

  describe('patch()', () => {
    it('devrait envoyer une requête PATCH avec le corps correct', () => {
      service.patch('/patch/1', { statut: 1 }).subscribe();
      const req = httpMock.expectOne(`${BASE}/patch/1`);
      expect(req.request.method).toBe('PATCH');
      req.flush({});
    });
  });

  // ── delete() ──────────────────────────────────────────────────────────────

  describe('delete()', () => {
    it('devrait envoyer une requête DELETE', () => {
      service.delete('/items/1').subscribe();
      const req = httpMock.expectOne(`${BASE}/items/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  // ── handleResponse — erreurs applicatives dans le body ────────────────────

  describe('handleResponse() — erreurs applicatives (status dans le body)', () => {
    it('devrait lever une ApiErrorBody quand status >= 400 dans le body', () => {
      let erreur: any;
      service.get('/endpoint').subscribe({ error: (e) => (erreur = e) });
      httpMock.expectOne(`${BASE}/endpoint`).flush({ status: 400, message: 'Requête invalide' });
      expect(erreur).toMatchObject({ status: 400, message: 'Requête invalide' });
    });

    it('devrait utiliser le message par défaut si aucun message fourni dans le body', () => {
      let erreur: any;
      service.get('/endpoint').subscribe({ error: (e) => (erreur = e) });
      httpMock.expectOne(`${BASE}/endpoint`).flush({ status: 422 });
      expect(erreur.message).toBeTruthy();
    });

    it('devrait transmettre la réponse normalement si status absent du body', () => {
      let résultat: any;
      service.get('/endpoint').subscribe((res) => (résultat = res));
      httpMock.expectOne(`${BASE}/endpoint`).flush({ data: 'ok' });
      expect(résultat).toEqual({ data: 'ok' });
    });
  });

  // ── handleResponse — session expirée (status = 0) ─────────────────────────

  describe('handleResponse() — session expirée (status = 0)', () => {
    it('devrait supprimer TOKEN et USER_ID du localStorage si status === 0', () => {
      localStorage.setItem('TOKEN', '"jwt-token"');
      localStorage.setItem('USER_ID', '1');

      service.get('/endpoint').subscribe();
      httpMock.expectOne(`${BASE}/endpoint`).flush({ status: 0 });

      expect(localStorage.getItem('TOKEN')).toBeNull();
      expect(localStorage.getItem('USER_ID')).toBeNull();
    });
  });
});
