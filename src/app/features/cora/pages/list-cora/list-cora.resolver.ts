import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ListCoraData } from '../../interfaces/cora.interface';
import { CoraService } from '../../services/cora/cora.service';

export const listCoraResolver: ResolveFn<ListCoraData> = () => {
  return inject(CoraService).getListCoraData();
};
