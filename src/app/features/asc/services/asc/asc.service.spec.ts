import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AscService } from './asc.service';
import { ApiService } from '@/core/services/api/api.service';
import { LocalStorageService } from '@/core/services/local-storage/local-storage.service';
import { environment } from 'src/environments/environment';

const BASE = environment.apiUrl;

describe('AscService', () => {
  let service: AscService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AscService,
        ApiService,
        LocalStorageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(AscService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  // ── getDashboard ──────────────────────────────────────────────────────────

  describe('getDashboard()', () => {
    it('devrait appeler GET /cheque/dashboard_asc avec l\'année', () => {
      service.getDashboard(2024).subscribe();
      const req = httpMock.expectOne(`${BASE}/cheque/dashboard_asc?annee=2024`);
      expect(req.request.method).toBe('GET');
      req.flush({ total: 100 });
    });
  });

  // ── getDashboardMensuel ───────────────────────────────────────────────────

  describe('getDashboardMensuel()', () => {
    it('devrait appeler le bon endpoint avec année et agence', () => {
      service.getDashboardMensuel(2024, 3).subscribe();
      const req = httpMock.expectOne(`${BASE}/cheque/statByAgenceMonth?annee=2024&agence=3`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('devrait retourner un tableau même si la réponse est enveloppée dans { data }', () => {
      let result: any;
      service.getDashboardMensuel(2024, 3).subscribe((res) => (result = res));
      httpMock
        .expectOne(`${BASE}/cheque/statByAgenceMonth?annee=2024&agence=3`)
        .flush({ data: [{ mois: 1, montant: 500 }] });
      expect(result).toHaveLength(1);
    });
  });

  // ── searchClient ──────────────────────────────────────────────────────────

  describe('searchClient()', () => {
    it('devrait appeler POST /cheque/searchClientAvc et retourner le client', () => {
      let result: any;
      service.searchClient('CLI001').subscribe((res) => (result = res));
      const req = httpMock.expectOne(`${BASE}/cheque/searchClientAvc`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ codeClient: 'CLI001' });
      req.flush({ client: { id: 1, nom: 'Kouassi' } });
      expect(result.nom).toBe('Kouassi');
    });
  });

  // ── getDemandesEnAttente ──────────────────────────────────────────────────

  describe('getDemandesEnAttente()', () => {
    it('devrait retourner la liste des demandes en attente', () => {
      let result: any;
      service.getDemandesEnAttente().subscribe((res) => (result = res));
      httpMock.expectOne(`${BASE}/cheque/ascEnAttente`).flush({ avCheques: [{ id: 1 }, { id: 2 }] });
      expect(result).toHaveLength(2);
    });
  });

  // ── getListeDemandes ──────────────────────────────────────────────────────

  describe('getListeDemandes()', () => {
    it('devrait retourner toutes les demandes ASC', () => {
      let result: any;
      service.getListeDemandes().subscribe((res) => (result = res));
      httpMock.expectOne(`${BASE}/cheque/listeAsc`).flush({ avCheques: [{ id: 10 }] });
      expect(result[0].id).toBe(10);
    });
  });

  // ── getDemandeById ────────────────────────────────────────────────────────

  describe('getDemandeById()', () => {
    it('devrait appeler GET /cheque/showAsc/:id et retourner la demande', () => {
      let result: any;
      service.getDemandeById(5).subscribe((res) => (result = res));
      const req = httpMock.expectOne(`${BASE}/cheque/showAsc/5`);
      expect(req.request.method).toBe('GET');
      req.flush({ avCheque: { id: 5, montant: 500000 } });
      expect(result.montant).toBe(500000);
    });
  });

  // ── deleteDemandeAsc ──────────────────────────────────────────────────────

  describe('deleteDemandeAsc()', () => {
    it('devrait appeler DELETE /cheque/delete/:id', () => {
      service.deleteDemandeAsc(3).subscribe();
      const req = httpMock.expectOne(`${BASE}/cheque/delete/3`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  // ── sendDecision ──────────────────────────────────────────────────────────

  describe('sendDecision()', () => {
    it('devrait appeler POST /cheque/saveDecisionAsc avec les données de décision', () => {
      const payload = { idAsc: 1, decision: 1, observation: 'OK' };
      service.sendDecision(payload).subscribe();
      const req = httpMock.expectOne(`${BASE}/cheque/saveDecisionAsc`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ status: 200 });
    });
  });

  // ── getBanques ────────────────────────────────────────────────────────────

  describe('getBanques()', () => {
    it('devrait retourner la liste des banques', () => {
      let result: any;
      service.getBanques().subscribe((res) => (result = res));
      httpMock.expectOne(`${BASE}/banque/liste`).flush({ banque: [{ id: 1, libelle: 'BICICI' }] });
      expect(result[0].libelle).toBe('BICICI');
    });
  });

  // ── getNaturesPrestations ─────────────────────────────────────────────────

  describe('getNaturesPrestations()', () => {
    it('devrait retourner la liste des natures de prestations', () => {
      let result: any;
      service.getNaturesPrestations().subscribe((res) => (result = res));
      httpMock
        .expectOne(`${BASE}/cheque/liste_nature_prestation`)
        .flush({ naturePrestation: [{ id: 1, libelle: 'Commerce' }] });
      expect(result).toHaveLength(1);
    });
  });

  // ── getTireurs ────────────────────────────────────────────────────────────

  describe('getTireurs()', () => {
    it('devrait retourner la liste des tireurs', () => {
      let result: any;
      service.getTireurs().subscribe((res) => (result = res));
      httpMock.expectOne(`${BASE}/cheque/tireurs`).flush({ tireus: [{ id: 1 }, { id: 2 }] });
      expect(result).toHaveLength(2);
    });
  });

  // ── getChequesAttente ─────────────────────────────────────────────────────

  describe('getChequesAttente()', () => {
    it('devrait retourner les chèques en attente', () => {
      let result: any;
      service.getChequesAttente().subscribe((res) => (result = res));
      httpMock.expectOne(`${BASE}/cheque/chequesattente`).flush({ cheques: [{ id: 1 }] });
      expect(result).toHaveLength(1);
    });
  });

  // ── Gestion des erreurs ───────────────────────────────────────────────────

  describe('gestion des erreurs', () => {
    it('devrait propager l\'erreur HTTP en cas d\'échec', () => {
      let error: any;
      service.getDemandeById(999).subscribe({ error: (e) => (error = e) });
      httpMock
        .expectOne(`${BASE}/cheque/showAsc/999`)
        .flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' });
      expect(error).toBeTruthy();
    });
  });
});
