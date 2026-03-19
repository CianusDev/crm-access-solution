import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AscService } from '../../services/asc/asc.service';
import { AscBanque, AscNaturePrestation } from '../../interfaces/asc.interface';

export const banquesAscResolver: ResolveFn<AscBanque[]> = () => {
  return inject(AscService).getBanques();
};

export const naturesAscResolver: ResolveFn<AscNaturePrestation[]> = () => {
  return inject(AscService).getNaturesPrestations();
};
