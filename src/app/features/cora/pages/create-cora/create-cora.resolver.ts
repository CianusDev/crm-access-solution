import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { CoraFormData } from '../../interfaces/create-cora-dto.interface';
import { CoraService } from '../../services/cora/cora.service';

export const createCoraFormDataResolver: ResolveFn<CoraFormData> = () => {
  return inject(CoraService).getFormData();
};
