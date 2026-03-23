import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ParametresService } from './parametres.service';
import { ApiService } from '@/core/services/api/api.service';
import { LocalStorageService } from '@/core/services/local-storage/local-storage.service';
import { environment } from 'src/environments/environment';

const BASE = environment.apiUrl;

describe('ParametresService', () => {
  let service: ParametresService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        ParametresService,
        ApiService,
        LocalStorageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(ParametresService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  // ── Utilisateurs ──────────────────────────────────────────────────────────

  describe('getUtilisateurs()', () => {
    it('devrait appeler GET /users/all et retourner la liste', () => {
      let result: any;
      service.getUtilisateurs().subscribe((res) => (result = res));
      const req = httpMock.expectOne(`${BASE}/users/all`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [{ id: 1, nom: 'Kouassi' }, { id: 2, nom: 'Yao' }] });
      expect(result).toHaveLength(2);
    });
  });

  describe('getUtilisateurById()', () => {
    it('devrait appeler GET /users/show_user/:id et retourner l\'utilisateur', () => {
      let result: any;
      service.getUtilisateurById(5).subscribe((res) => (result = res));
      const req = httpMock.expectOne(`${BASE}/users/show_user/5`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: { id: 5, nom: 'Kouassi' } });
      expect(result.nom).toBe('Kouassi');
    });
  });

  describe('saveUtilisateur()', () => {
    it('devrait appeler POST /users/save_employe avec les données', () => {
      const payload: any = { nom: 'Test', email: 'test@ci', profil: 1 };
      service.saveUtilisateur(payload).subscribe();
      const req = httpMock.expectOne(`${BASE}/users/save_employe`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ status: 201 });
    });
  });

  describe('updateUtilisateur()', () => {
    it('devrait appeler PUT /users/update_employe', () => {
      const payload: any = { id: 1, nom: 'Modifié' };
      service.updateUtilisateur(payload).subscribe();
      const req = httpMock.expectOne(`${BASE}/users/update_employe`);
      expect(req.request.method).toBe('PUT');
      req.flush({ status: 200 });
    });
  });

  describe('changerStatut()', () => {
    it('devrait appeler POST /users/activ_desactiv_employe', () => {
      service.changerStatut({ user: 1 }).subscribe();
      const req = httpMock.expectOne(`${BASE}/users/activ_desactiv_employe`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ user: 1 });
      req.flush({ status: 200 });
    });
  });

  describe('changerMotPasseUser()', () => {
    it('devrait appeler POST /users/change_password', () => {
      const payload = { old_password: 'ancien', password: 'nouveau', password_confirmation: 'nouveau' };
      service.changerMotPasseUser(payload).subscribe();
      const req = httpMock.expectOne(`${BASE}/users/change_password`);
      expect(req.request.method).toBe('POST');
      req.flush({ status: 200 });
    });
  });

  // ── Référentiels ──────────────────────────────────────────────────────────

  describe('getProfils()', () => {
    it('devrait retourner la liste des profils', () => {
      let result: any;
      service.getProfils().subscribe((res) => (result = res));
      httpMock.expectOne(`${BASE}/profils`).flush({ data: [{ id: 1, name: 'Admin' }] });
      expect(result[0].name).toBe('Admin');
    });
  });

  describe('getServices()', () => {
    it('devrait retourner la liste des services', () => {
      let result: any;
      service.getServices().subscribe((res) => (result = res));
      httpMock.expectOne(`${BASE}/services`).flush({ data: [{ id: 1, code: 'INFO' }] });
      expect(result).toHaveLength(1);
    });
  });

  describe('getAgences()', () => {
    it('devrait retourner la liste des agences', () => {
      let result: any;
      service.getAgences().subscribe((res) => (result = res));
      httpMock.expectOne(`${BASE}/agence/list`).flush({ agences: [{ id: 1, libelle: 'Abidjan' }] });
      expect(result[0].libelle).toBe('Abidjan');
    });
  });

  describe('getCommunes()', () => {
    it('devrait retourner la liste des communes', () => {
      let result: any;
      service.getCommunes().subscribe((res) => (result = res));
      httpMock.expectOne(`${BASE}/pays_commune`).flush({ communes: [{ id: 1, libelle: 'Cocody' }] });
      expect(result[0].libelle).toBe('Cocody');
    });
  });

  // ── Zonification ──────────────────────────────────────────────────────────

  describe('getZones()', () => {
    it('devrait retourner la liste des zones', () => {
      let result: any;
      service.getZones().subscribe((res) => (result = res));
      httpMock.expectOne(`${BASE}/zones`).flush({ zones: [{ id: 1, libelle: 'Zone Nord' }] });
      expect(result).toHaveLength(1);
    });

    it('devrait retourner un tableau vide si zones absent', () => {
      let result: any;
      service.getZones().subscribe((res) => (result = res));
      httpMock.expectOne(`${BASE}/zones`).flush({});
      expect(result).toEqual([]);
    });
  });

  describe('affecterZone()', () => {
    it('devrait appeler POST /updateUserZone', () => {
      service.affecterZone({ user: 1, zone: 3 }).subscribe();
      const req = httpMock.expectOne(`${BASE}/updateUserZone`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ user: 1, zone: 3 });
      req.flush({ status: 200 });
    });
  });

  // ── Permissions type crédit ───────────────────────────────────────────────

  describe('getPermissionsTypeCredit()', () => {
    it('devrait appeler GET /credit/permisionComite/:userId', () => {
      let result: any;
      service.getPermissionsTypeCredit(7).subscribe((res) => (result = res));
      const req = httpMock.expectOne(`${BASE}/credit/permisionComite/7`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [{ typeCredit: 1, type: 'COURT' }] });
      expect(result).toHaveLength(1);
    });

    it('devrait retourner un tableau vide si data absent', () => {
      let result: any;
      service.getPermissionsTypeCredit(7).subscribe((res) => (result = res));
      httpMock.expectOne(`${BASE}/credit/permisionComite/7`).flush({});
      expect(result).toEqual([]);
    });
  });

  // ── getFormData (forkJoin) ────────────────────────────────────────────────

  describe('getFormData()', () => {
    it('devrait fusionner profils, services, agences et communes en une seule réponse', () => {
      let result: any;
      service.getFormData().subscribe((res) => (result = res));

      httpMock.expectOne(`${BASE}/profils`).flush({ data: [{ id: 1 }] });
      httpMock.expectOne(`${BASE}/services`).flush({ data: [{ id: 2 }] });
      httpMock.expectOne(`${BASE}/agence/list`).flush({ agences: [{ id: 3 }] });
      httpMock.expectOne(`${BASE}/pays_commune`).flush({ communes: [{ id: 4 }] });

      expect(result.profils).toHaveLength(1);
      expect(result.services).toHaveLength(1);
      expect(result.agences).toHaveLength(1);
      expect(result.communes).toHaveLength(1);
    });
  });

  // ── Gestion des erreurs ───────────────────────────────────────────────────

  describe('gestion des erreurs', () => {
    it('devrait propager l\'erreur HTTP en cas d\'échec', () => {
      let error: any;
      service.getUtilisateurs().subscribe({ error: (e) => (error = e) });
      httpMock
        .expectOne(`${BASE}/users/all`)
        .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
      expect(error).toBeTruthy();
    });
  });
});
