import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AgentCoraDetail } from '../../interfaces/cora.interface';
import { CoraService } from '../../services/cora/cora.service';

export const detailAgentResolver: ResolveFn<AgentCoraDetail> = (route) => {
  return inject(CoraService).getAgentById(Number(route.paramMap.get('id')));
};
