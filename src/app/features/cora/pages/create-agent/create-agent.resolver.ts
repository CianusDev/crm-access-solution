import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { CreateAgentFormData } from '../../interfaces/cora.interface';
import { CoraService } from '../../services/cora/cora.service';

export const createAgentFormDataResolver: ResolveFn<CreateAgentFormData> = () =>
  inject(CoraService).getCreateAgentFormData();
