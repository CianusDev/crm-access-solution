import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthService } from './auth.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { LoggerService } from '../logger/logger.service';
import { ApiService } from '../api/api.service';
import { environment } from 'src/environments/environment';
import { User } from '@/core/models/user.model';

const BASE = environment.apiUrl;

const utilisateurMock: User = {
  id: 1,
  matricule: 'EMP001',
  nom: 'Kouassi',
  prenom: 'Jean',
  email: 'jean@creditaccess.ci',
  phone: '',
  dateNaiss: '',
  sexe: 'M',
  nationalite: null,
  profilPhoto: '',
  role: 'Admin',
  fonction: null,
  situationMatri: null,
  description: '',
  cni: null,
  extrait: null,
  diplome: null,
  adresse: null,
  commune: null,
  quartier: null,
  flotte: null,
  etat: 1,
  statut: 1,
  profil: { id: 1, name: 'Admin', libelle: 'Administrateur' },
  agence: null,
  service: null,
  direction: null,
  code: 'ADM',
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Garantir qu'aucun token n'est présent — évite les appels HTTP dans le constructeur
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        ApiService,
        LocalStorageService,
        LoggerService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  it('devrait avoir currentUser à null au démarrage sans token stocké', () => {
    expect(service.currentUser()).toBeNull();
  });

  it('devrait retourner false pour isLoggedIn() en l\'absence de token', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('devrait retourner null pour getToken() sans token stocké', () => {
    expect(service.getToken()).toBeNull();
  });

  // ── login() ───────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('devrait stocker le token et l\'userId puis récupérer l\'utilisateur courant', () => {
      service.login({ email: 'jean@creditaccess.ci', password: 'secret' }).subscribe();

      // Étape 1 : POST /login
      const reqLogin = httpMock.expectOne(`${BASE}/login`);
      expect(reqLogin.request.method).toBe('POST');
      reqLogin.flush({ token: 'jwt-token', user: { id: 1 } });

      // Étape 2 : GET /users/show_user/1
      const reqUser = httpMock.expectOne(`${BASE}/users/show_user/1`);
      reqUser.flush({ data: utilisateurMock });

      expect(localStorage.getItem('TOKEN')).toBe('"jwt-token"');
      expect(localStorage.getItem('USER_ID')).toBe('1');
    });

    it('devrait définir currentUser après une connexion réussie', () => {
      let résultat: any;
      service.login({ email: 'jean@creditaccess.ci', password: 'secret' }).subscribe((res) => {
        résultat = res.data;
      });

      httpMock.expectOne(`${BASE}/login`).flush({ token: 'tok', user: { id: 1 } });
      httpMock.expectOne(`${BASE}/users/show_user/1`).flush({ data: utilisateurMock });

      expect(service.currentUser()).toEqual(utilisateurMock);
    });

    it('devrait retourner une erreur explicite pour un identifiant invalide (401)', () => {
      let erreur: any;
      service.login({ email: 'inconnu@ci', password: 'mauvais' }).subscribe({ error: (e) => (erreur = e) });

      httpMock
        .expectOne(`${BASE}/login`)
        .flush({ status: 401 }, { status: 401, statusText: 'Unauthorized' });

      expect(erreur.message).toContain('Identifiants incorrects');
    });

    it('devrait retourner une erreur explicite pour un accès refusé (403)', () => {
      let erreur: any;
      service.login({ email: 'u@ci', password: 'p' }).subscribe({ error: (e) => (erreur = e) });

      httpMock
        .expectOne(`${BASE}/login`)
        .flush({ status: 403 }, { status: 403, statusText: 'Forbidden' });

      expect(erreur.message).toContain('Accès refusé');
    });

    it('devrait nettoyer le localStorage en cas d\'erreur de connexion', () => {
      localStorage.setItem('TOKEN', '"ancien-token"');
      localStorage.setItem('USER_ID', '99');

      service.login({ email: 'u@ci', password: 'wrong' }).subscribe({ error: () => {} });

      httpMock
        .expectOne(`${BASE}/login`)
        .flush({ status: 401 }, { status: 401, statusText: 'Unauthorized' });

      expect(localStorage.getItem('TOKEN')).toBeNull();
      expect(localStorage.getItem('USER_ID')).toBeNull();
    });
  });

  // ── logout() ──────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('devrait vider currentUser et supprimer le token du localStorage', () => {
      localStorage.setItem('TOKEN', '"tok"');
      localStorage.setItem('USER_ID', '1');

      service.logout();

      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('TOKEN')).toBeNull();
      expect(localStorage.getItem('USER_ID')).toBeNull();
    });
  });

  // ── getToken() ────────────────────────────────────────────────────────────

  describe('getToken()', () => {
    it('devrait retourner le token stocké en localStorage', () => {
      localStorage.setItem('TOKEN', '"mon-token-jwt"');
      expect(service.getToken()).toBe('mon-token-jwt');
    });

    it('devrait retourner null si aucun token stocké', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  // ── isLoggedIn() ──────────────────────────────────────────────────────────

  describe('isLoggedIn()', () => {
    it('devrait retourner true quand un token est présent dans le localStorage', () => {
      localStorage.setItem('TOKEN', '"tok"');
      expect(service.isLoggedIn()).toBe(true);
    });

    it('devrait retourner false quand aucun token n\'est stocké', () => {
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  // ── fetchCurrentUser() ────────────────────────────────────────────────────

  describe('fetchCurrentUser()', () => {
    it('devrait appeler GET /users/show_user/:id et mettre à jour currentUser', () => {
      service.fetchCurrentUser(1).subscribe();
      httpMock.expectOne(`${BASE}/users/show_user/1`).flush({ data: utilisateurMock });
      expect(service.currentUser()).toEqual(utilisateurMock);
    });

    it('devrait remettre currentUser à null si la récupération échoue', () => {
      service.fetchCurrentUser(1).subscribe({ error: () => {} });
      httpMock
        .expectOne(`${BASE}/users/show_user/1`)
        .flush({ message: 'Non trouvé' }, { status: 404, statusText: 'Not Found' });
      expect(service.currentUser()).toBeNull();
    });
  });
});
