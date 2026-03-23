import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CoraService } from './cora.service';
import { ApiService } from '@/core/services/api/api.service';
import { LocalStorageService } from '@/core/services/local-storage/local-storage.service';
import { environment } from 'src/environments/environment';

const BASE = environment.apiUrl;

describe('CoraService', () => {
  let service: CoraService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        CoraService,
        ApiService,
        LocalStorageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(CoraService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  // ── getDashboardCoraData ──────────────────────────────────────────────────

  describe('getDashboardCoraData()', () => {
    it('devrait appeler GET /cora/dashboard_cora', () => {
      service.getDashboardCoraData().subscribe();
      const req = httpMock.expectOne(`${BASE}/cora/dashboard_cora`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: {} });
    });
  });

  // ── getFormData ───────────────────────────────────────────────────────────

  describe('getFormData()', () => {
    it('devrait appeler GET /pays_commune', () => {
      service.getFormData().subscribe();
      const req = httpMock.expectOne(`${BASE}/pays_commune`);
      expect(req.request.method).toBe('GET');
      req.flush({ communes: [], pays: [] });
    });
  });

  // ── createCora ────────────────────────────────────────────────────────────

  describe('createCora()', () => {
    it('devrait appeler POST /cora/save_cora avec les données fournies', () => {
      const payload: any = { nom: 'Cora Test', commune: 1 };
      service.createCora(payload).subscribe();
      const req = httpMock.expectOne(`${BASE}/cora/save_cora`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ status: 201 });
    });
  });

  // ── getListCoraData (forkJoin) ────────────────────────────────────────────

  describe('getListCoraData()', () => {
    it('devrait appeler les 3 endpoints et retourner les données fusionnées', () => {
      let result: any;
      service.getListCoraData().subscribe((res) => (result = res));

      httpMock.expectOne(`${BASE}/cora/cora_list`).flush({ coras: [{ id: 1 }] });
      httpMock.expectOne(`${BASE}/pays_commune`).flush({ communes: [{ id: 10, libelle: 'Abidjan' }] });
      httpMock.expectOne(`${BASE}/cora/all_gestionnaires`).flush({ data: [{ id: 5 }] });

      expect(result.coras).toHaveLength(1);
      expect(result.communes).toHaveLength(1);
      expect(result.gestionnaires).toHaveLength(1);
    });
  });

  // ── getCoraById ───────────────────────────────────────────────────────────

  describe('getCoraById()', () => {
    it('devrait appeler GET /cora/show_cora/:id et retourner cora', () => {
      let result: any;
      service.getCoraById(42).subscribe((res) => (result = res));
      const req = httpMock.expectOne(`${BASE}/cora/show_cora/42`);
      expect(req.request.method).toBe('GET');
      req.flush({ cora: { id: 42, nom: 'Test Cora' } });
      expect(result).toEqual({ id: 42, nom: 'Test Cora' });
    });
  });

  // ── getAgentById ──────────────────────────────────────────────────────────

  describe('getAgentById()', () => {
    it('devrait appeler POST /cora/show_agent avec l\'id et retourner agent', () => {
      let result: any;
      service.getAgentById(7).subscribe((res) => (result = res));
      const req = httpMock.expectOne(`${BASE}/cora/show_agent`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ agent: 7 });
      req.flush({ agent: { id: 7, nom: 'Agent Test' } });
      expect(result).toEqual({ id: 7, nom: 'Agent Test' });
    });
  });

  // ── getAgentsEnAttente ────────────────────────────────────────────────────

  describe('getAgentsEnAttente()', () => {
    it('devrait retourner la liste des agents en attente', () => {
      let result: any;
      service.getAgentsEnAttente().subscribe((res) => (result = res));
      httpMock.expectOne(`${BASE}/cora/agent_attente`).flush({ agents: [{ id: 1 }, { id: 2 }] });
      expect(result).toHaveLength(2);
    });
  });

  // ── getGestionnaires ──────────────────────────────────────────────────────

  describe('getGestionnaires()', () => {
    it('devrait retourner la liste des gestionnaires', () => {
      let result: any;
      service.getGestionnaires().subscribe((res) => (result = res));
      httpMock.expectOne(`${BASE}/cora/all_gestionnaires`).flush({ data: [{ id: 1 }] });
      expect(result).toHaveLength(1);
    });
  });

  // ── getCommunes ───────────────────────────────────────────────────────────

  describe('getCommunes()', () => {
    it('devrait retourner la liste des communes', () => {
      let result: any;
      service.getCommunes().subscribe((res) => (result = res));
      httpMock.expectOne(`${BASE}/pays_commune`).flush({ communes: [{ id: 1, libelle: 'Abidjan' }] });
      expect(result[0].libelle).toBe('Abidjan');
    });
  });

  // ── getPublicCoraList ─────────────────────────────────────────────────────

  describe('getPublicCoraList()', () => {
    it('devrait retourner la liste publique des CORA', () => {
      let result: any;
      service.getPublicCoraList().subscribe((res) => (result = res));
      httpMock.expectOne(`${BASE}/cora/cora_list`).flush({ coras: [{ id: 1 }, { id: 2 }] });
      expect(result).toHaveLength(2);
    });
  });

  // ── saveAgent ─────────────────────────────────────────────────────────────

  describe('saveAgent()', () => {
    it('devrait appeler POST /cora/save_agent et retourner l\'agent créé', () => {
      const payload: any = { nom: 'Nouvel Agent', cora: 1 };
      let result: any;
      service.saveAgent(payload).subscribe((res) => (result = res));
      const req = httpMock.expectOne(`${BASE}/cora/save_agent`);
      expect(req.request.method).toBe('POST');
      req.flush({ agent: { id: 99, nom: 'Nouvel Agent' } });
      expect(result.nom).toBe('Nouvel Agent');
    });
  });

  // ── searchCoras ───────────────────────────────────────────────────────────

  describe('searchCoras()', () => {
    it('devrait appeler POST /cora/recherce_cora avec le filtre et retourner les résultats', () => {
      const filtre: any = { commune: 1, statut: 'actif' };
      let result: any;
      service.searchCoras(filtre).subscribe((res) => (result = res));
      const req = httpMock.expectOne(`${BASE}/cora/recherce_cora`);
      expect(req.request.body).toEqual(filtre);
      req.flush({ data: [{ id: 1 }, { id: 2 }] });
      expect(result).toHaveLength(2);
    });
  });

  // ── Gestion des erreurs ───────────────────────────────────────────────────

  describe('gestion des erreurs', () => {
    it('devrait propager l\'erreur HTTP via catchError', () => {
      let error: any;
      service.getCoraById(999).subscribe({ error: (e) => (error = e) });
      httpMock
        .expectOne(`${BASE}/cora/show_cora/999`)
        .flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' });
      expect(error).toBeTruthy();
    });
  });
});
