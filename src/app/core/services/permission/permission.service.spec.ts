import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { PermissionService } from './permission.service';
import { AuthService } from '../auth/auth.service';
import { UserRole, User } from '@/core/models/user.model';

/** Fabrique un utilisateur minimal avec le profil donné */
function makeUser(roleName: string): User {
  return {
    id: 1,
    matricule: 'EMP001',
    nom: 'Test',
    prenom: 'User',
    email: 'test@ci',
    phone: '',
    dateNaiss: '',
    sexe: 'M',
    nationalite: null,
    profilPhoto: '',
    role: roleName,
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
    profil: { id: 1, name: roleName, libelle: roleName },
    agence: null,
    service: null,
    direction: null,
    code: '',
  };
}

describe('PermissionService', () => {
  let service: PermissionService;
  let currentUserSignal: ReturnType<typeof signal<User | null>>;

  beforeEach(() => {
    currentUserSignal = signal<User | null>(null);

    const authServiceMock = {
      currentUser: currentUserSignal,
    };

    TestBed.configureTestingModule({
      providers: [
        PermissionService,
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    service = TestBed.inject(PermissionService);
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('userRole()', () => {
    it('devrait retourner null si aucun utilisateur connecté', () => {
      expect(service.userRole()).toBeNull();
    });

    it('devrait retourner le rôle du profil de l\'utilisateur connecté', () => {
      TestBed.runInInjectionContext(() => {
        currentUserSignal.set(makeUser(UserRole.Admin));
      });
      expect(service.userRole()).toBe(UserRole.Admin);
    });
  });

  describe('hasRole()', () => {
    it('devrait retourner false si aucun utilisateur connecté', () => {
      expect(service.hasRole(UserRole.Admin)).toBe(false);
    });

    it('devrait retourner true si l\'utilisateur possède le rôle', () => {
      TestBed.runInInjectionContext(() => {
        currentUserSignal.set(makeUser(UserRole.Admin));
      });
      expect(service.hasRole(UserRole.Admin)).toBe(true);
    });

    it('devrait retourner false si l\'utilisateur n\'a pas le rôle', () => {
      TestBed.runInInjectionContext(() => {
        currentUserSignal.set(makeUser(UserRole.ChefAgence));
      });
      expect(service.hasRole(UserRole.Admin)).toBe(false);
    });

    it('devrait retourner true si l\'utilisateur correspond à l\'un des rôles fournis', () => {
      TestBed.runInInjectionContext(() => {
        currentUserSignal.set(makeUser(UserRole.DG));
      });
      expect(service.hasRole(UserRole.Admin, UserRole.DG, UserRole.DGA)).toBe(true);
    });
  });

  describe('lacksRole()', () => {
    it('devrait retourner true si l\'utilisateur n\'a pas le rôle', () => {
      TestBed.runInInjectionContext(() => {
        currentUserSignal.set(makeUser(UserRole.ChefAgence));
      });
      expect(service.lacksRole(UserRole.Admin)).toBe(true);
    });

    it('devrait retourner false si l\'utilisateur possède le rôle', () => {
      TestBed.runInInjectionContext(() => {
        currentUserSignal.set(makeUser(UserRole.Admin));
      });
      expect(service.lacksRole(UserRole.Admin)).toBe(false);
    });

    it('devrait retourner true si aucun utilisateur connecté', () => {
      expect(service.lacksRole(UserRole.Admin)).toBe(true);
    });
  });
});
