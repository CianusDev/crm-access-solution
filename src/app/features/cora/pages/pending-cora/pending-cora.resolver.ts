import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AgentEnAttente } from '../../interfaces/cora.interface';
import { CoraService } from '../../services/cora/cora.service';

export const pendingCoraResolver: ResolveFn<AgentEnAttente[]> = () => {
  return inject(CoraService).getAgentsEnAttente();
};
