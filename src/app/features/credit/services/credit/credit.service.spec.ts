import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CreditService } from './credit.service';
import { ApiService } from '@/core/services/api/api.service';
import { LocalStorageService } from '@/core/services/local-storage/local-storage.service';
import { environment } from 'src/environments/environment';

const BASE = environment.apiUrl;

describe('CreditService', () => {
  let service: CreditService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        CreditService,
        ApiService,
        LocalStorageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(CreditService);
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
    it('devrait appeler GET /credit/dashCrdCaa et retourner data', () => {
      let result: any;
      service.getDashboard().subscribe((res) => (result = res));
      const req = httpMock.expectOne(`${BASE}/credit/dashCrdCaa`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: { total: 50 } });
      expect(result.total).toBe(50);
    });
  });

  // ── filtrerDashboard ──────────────────────────────────────────────────────

  describe('filtrerDashboard()', () => {
    it('devrait envoyer clickSearch=YES et les paramètres du filtre', () => {
      service.filtrerDashboard({ codeClient: 'CLI001', statut: 2 }).subscribe();
      const req = httpMock.expectOne(
        (r) =>
          r.url === `${BASE}/credit/dashCrdCaa` &&
          r.params.get('clickSearch') === 'YES' &&
          r.params.get('codeClient') === 'CLI001' &&
          r.params.get('statut') === '2',
      );
      expect(req).toBeTruthy();
      req.flush({ data: {} });
    });

    it('devrait ignorer les paramètres non définis', () => {
      service.filtrerDashboard({}).subscribe();
      const req = httpMock.expectOne((r) => r.url === `${BASE}/credit/dashCrdCaa`);
      expect(req.request.params.has('codeClient')).toBe(false);
      req.flush({ data: {} });
    });
  });

  // ── getDashboardTypeCredit ────────────────────────────────────────────────

  describe('getDashboardTypeCredit()', () => {
    it('devrait appeler GET /credit/dashCrdBytype', () => {
      service.getDashboardTypeCredit().subscribe();
      const req = httpMock.expectOne(`${BASE}/credit/dashCrdBytype`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  // ── getDashboardStatut ────────────────────────────────────────────────────

  describe('getDashboardStatut()', () => {
    it('devrait appeler GET /credit/dashCrdByStatut', () => {
      service.getDashboardStatut().subscribe();
      httpMock.expectOne(`${BASE}/credit/dashCrdByStatut`).flush({});
    });
  });

  // ── getStatsByAgence ──────────────────────────────────────────────────────

  describe('getStatsByAgence()', () => {
    it('devrait retourner les stats par agence', () => {
      let result: any;
      service.getStatsByAgence().subscribe((res) => (result = res));
      httpMock
        .expectOne(`${BASE}/credit/dashCrdByAgence`)
        .flush({ demandesParAgence: [{ agence: 'Abidjan', total: 10 }] });
      expect(result[0].agence).toBe('Abidjan');
    });
  });

  // ── searchClientCredit ────────────────────────────────────────────────────

  describe('searchClientCredit()', () => {
    it('devrait appeler POST /credit/searchClient et retourner le client', () => {
      let result: any;
      service.searchClientCredit('CLI001').subscribe((res) => (result = res));
      const req = httpMock.expectOne(`${BASE}/credit/searchClient`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ codeClient: 'CLI001' });
      req.flush({ client: { id: 1, nom: 'Test Client' } });
      expect(result.nom).toBe('Test Client');
    });
  });

  // ── getListeDemandes ──────────────────────────────────────────────────────

  describe('getListeDemandes()', () => {
    it('devrait appeler GET /credit/listeDemande sans paramètres', () => {
      let result: any;
      service.getListeDemandes().subscribe((res) => (result = res));
      const req = httpMock.expectOne(`${BASE}/credit/listeDemande`);
      expect(req.request.method).toBe('GET');
      req.flush({ demande: [{ ref: 'REF001' }, { ref: 'REF002' }] });
      expect(result).toHaveLength(2);
    });

    it('devrait passer le paramètre action si fourni', () => {
      service.getListeDemandes('cloture').subscribe();
      const req = httpMock.expectOne(
        (r) => r.url === `${BASE}/credit/listeDemande` && r.params.get('action') === 'cloture',
      );
      expect(req).toBeTruthy();
      req.flush({ demande: [] });
    });

    it('devrait retourner un tableau vide si demande est absent', () => {
      let result: any;
      service.getListeDemandes().subscribe((res) => (result = res));
      httpMock.expectOne(`${BASE}/credit/listeDemande`).flush({});
      expect(result).toEqual([]);
    });
  });

  // ── getFicheCredit ────────────────────────────────────────────────────────

  describe('getFicheCredit()', () => {
    it('devrait appeler GET /credit/getinfosdmde/:ref', () => {
      service.getFicheCredit('REF001').subscribe();
      const req = httpMock.expectOne(`${BASE}/credit/getinfosdmde/REF001`);
      expect(req.request.method).toBe('GET');
      req.flush({ ref: 'REF001' });
    });
  });

  // ── getResumeAnalyse ──────────────────────────────────────────────────────

  describe('getResumeAnalyse()', () => {
    it('devrait appeler GET /credit/getresume/:ref', () => {
      service.getResumeAnalyse('REF001').subscribe();
      const req = httpMock.expectOne(`${BASE}/credit/getresume/REF001`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  // ── getGarantiesDemande ───────────────────────────────────────────────────

  describe('getGarantiesDemande()', () => {
    it('devrait retourner les garanties de la demande', () => {
      let result: any;
      service.getGarantiesDemande('REF001').subscribe((res) => (result = res));
      httpMock
        .expectOne(`${BASE}/credit/getGarantiesDemande/REF001`)
        .flush({ demande: { actifs: [] } });
      expect(result.actifs).toEqual([]);
    });
  });

  // ── getObservations ───────────────────────────────────────────────────────

  describe('getObservations()', () => {
    it('devrait retourner les observations de la demande', () => {
      let result: any;
      service.getObservations('REF001').subscribe((res) => (result = res));
      httpMock
        .expectOne(`${BASE}/credit/listeObservations/REF001`)
        .flush({ observations: [{ id: 1 }] });
      expect(result).toHaveLength(1);
    });

    it('devrait retourner un tableau vide si observations absent', () => {
      let result: any;
      service.getObservations('REF001').subscribe((res) => (result = res));
      httpMock.expectOne(`${BASE}/credit/listeObservations/REF001`).flush({});
      expect(result).toEqual([]);
    });
  });

  // ── saveDemandeCredit ─────────────────────────────────────────────────────

  describe('saveDemandeCredit()', () => {
    it('devrait appeler POST /credit/saveDemandeCredit', () => {
      const payload: any = { codeClient: 'CLI001', typeCredit: 1, montant: 500000 };
      service.saveDemandeCredit(payload).subscribe();
      const req = httpMock.expectOne(`${BASE}/credit/saveDemandeCredit`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ status: 201, demande: { refDemande: 'REF001' } });
    });
  });

  // ── getListeEmployeurs ────────────────────────────────────────────────────

  describe('getListeEmployeurs()', () => {
    it('devrait retourner tous les employeurs sans filtre', () => {
      let result: any;
      service.getListeEmployeurs().subscribe((res) => (result = res));
      httpMock
        .expectOne(`${BASE}/credit/listeEmployeur`)
        .flush({ employeurs: [{ id: 1 }, { id: 2 }] });
      expect(result).toHaveLength(2);
    });

    it('devrait passer le paramètre action si fourni', () => {
      service.getListeEmployeurs('valide').subscribe();
      const req = httpMock.expectOne(`${BASE}/credit/listeEmployeur?action=valide`);
      expect(req).toBeTruthy();
      req.flush({ employeurs: [] });
    });
  });

  // ── getDetailAgence ───────────────────────────────────────────────────────

  describe('getDetailAgence()', () => {
    it('devrait appeler GET /credit/statCrdAgence avec le code agence', () => {
      let result: any;
      service.getDetailAgence('AG001').subscribe((res) => (result = res));
      const req = httpMock.expectOne(
        (r) => r.url === `${BASE}/credit/statCrdAgence` && r.params.get('agence') === 'AG001',
      );
      expect(req).toBeTruthy();
      req.flush({ data: { agence: 'Abidjan', total: 20 } });
      expect(result.agence).toBe('Abidjan');
    });
  });

  // ── saveTirage ────────────────────────────────────────────────────────────

  describe('saveTirage()', () => {
    it('devrait appeler POST /credit/saveCrdTirage', () => {
      const payload: any = { refDemande: 'REF001', montant: 100000 };
      service.saveTirage(payload).subscribe();
      const req = httpMock.expectOne(`${BASE}/credit/saveCrdTirage`);
      expect(req.request.method).toBe('POST');
      req.flush({ status: 201, demande: { refDemande: 'REF001' } });
    });
  });

  // ── Gestion des erreurs ───────────────────────────────────────────────────

  describe('gestion des erreurs', () => {
    it('devrait propager l\'erreur en cas d\'échec HTTP', () => {
      let error: any;
      service.getDashboard().subscribe({ error: (e) => (error = e) });
      httpMock
        .expectOne(`${BASE}/credit/dashCrdCaa`)
        .flush({ message: 'Server Error' }, { status: 500, statusText: 'Internal Server Error' });
      expect(error).toBeTruthy();
    });
  });
});
