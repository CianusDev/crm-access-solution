import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AscService } from '../../services/asc/asc.service';
import { AscTireur } from '../../interfaces/asc.interface';

export const tireursAscResolver: ResolveFn<AscTireur[]> = () => {
  return inject(AscService).getTireurs();
};
