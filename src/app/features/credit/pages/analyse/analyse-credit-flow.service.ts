import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CreditService } from '../../services/credit/credit.service';
import { AuthService } from '@/core/services/auth/auth.service';

/** Mot de passe refusé (statut 500) ou erreur réseau sur la vérification. */
export class AnalyseFlowPasswordException extends Error {
  override readonly name = 'AnalyseFlowPasswordException';

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export type CrdObservationResponse = { status: number; message?: string };

@Injectable({ providedIn: 'root' })
export class AnalyseCreditFlowService {
  private readonly auth = inject(AuthService);
  private readonly credit = inject(CreditService);

  private verifyPasswordThen(password: string): Observable<void> {
    return this.auth.verifyPassword(password).pipe(
      switchMap((res) => {
        if (res.statut === 500) {
          return throwError(
            () => new AnalyseFlowPasswordException(res.message || 'Mot de passe incorrect.'),
          );
        }
        return of(undefined);
      }),
      catchError((err: unknown) => {
        if (err instanceof AnalyseFlowPasswordException) {
          return throwError(() => err);
        }
        return throwError(
          () => new AnalyseFlowPasswordException('Mot de passe incorrect.'),
        );
      }),
    );
  }

  envoyerDossierChefAgence(
    refDemande: string,
    password: string,
    observation: string,
  ): Observable<CrdObservationResponse> {
    return this.verifyPasswordThen(password).pipe(
      switchMap(() =>
        this.credit.saveCrdObservation({
          refDemande,
          decision: 1,
          observation: observation || '',
          password: password ?? '',
        }),
      ),
    );
  }

  ajournerDossier(
    refDemande: string,
    password: string,
    observation: string,
  ): Observable<CrdObservationResponse> {
    return this.verifyPasswordThen(password).pipe(
      switchMap(() =>
        this.credit.saveCrdObservation({
          refDemande,
          decision: 2,
          observation: observation || '',
          password: password ?? '',
        }),
      ),
    );
  }

  avisDefavorable(
    refDemande: string,
    password: string,
    observation: string,
  ): Observable<CrdObservationResponse> {
    return this.verifyPasswordThen(password).pipe(
      switchMap(() =>
        this.credit.saveCrdObservation({
          refDemande,
          decision: 4,
          observation: observation || '',
          password: password ?? '',
        }),
      ),
    );
  }

  /**
   * Superviseur risque zone — confirmation du rejet (legacy `decision: 0`, même endpoint `saveCrdObservation`).
   */
  confirmerRejetDossier(
    refDemande: string,
    password: string,
    observation: string,
  ): Observable<CrdObservationResponse> {
    return this.verifyPasswordThen(password).pipe(
      switchMap(() =>
        this.credit.saveCrdObservation({
          refDemande,
          decision: 0,
          observation: observation || '',
          password: password ?? '',
        }),
      ),
    );
  }

  affecterAnalysteRisque(
    refDemande: string,
    zone: number,
    codeAr: string,
    password: string,
    observation: string,
  ): Observable<CrdObservationResponse> {
    return this.verifyPasswordThen(password).pipe(
      switchMap(() =>
        this.credit.affecterDemandeAR({
          refDemande,
          decision: 1,
          zone,
          codeAr,
          password,
          observation: observation || '',
        }),
      ),
    );
  }

  saveNumeroPerfect(refDemande: string, numTransaction: string): Observable<unknown> {
    return this.credit.updateDemandeCredit({
      refDemande,
      numTransaction,
    } as never);
  }

  loadZones() {
    return this.credit.getZones();
  }

  loadAnalystesRisqueForZone(zoneId: number) {
    return this.credit.getARsByZone(zoneId).pipe(
      map((ars) =>
        ars.map((ar) => ({
          ...ar,
          libelle: `${ar.nom} ${ar.prenom}`,
        })),
      ),
    );
  }
}
