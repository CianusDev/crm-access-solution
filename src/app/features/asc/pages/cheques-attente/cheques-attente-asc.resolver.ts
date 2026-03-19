import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AscService } from '../../services/asc/asc.service';
import { AscDemande } from '../../interfaces/asc.interface';

export const chequesAttenteAscResolver: ResolveFn<AscDemande[]> = () => {
  return inject(AscService).getChequesAttente();
};
