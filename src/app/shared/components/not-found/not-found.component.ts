import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ButtonDirective],
  templateUrl: './not-found.component.html',
})
export class NotFound {}
