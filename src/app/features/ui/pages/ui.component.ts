import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { InputDirective } from '@/shared/directives/ui/input/input';
import { Component } from '@angular/core';

@Component({
  selector: 'app-ui',
  imports: [ButtonDirective, InputDirective],
  templateUrl: './ui.html',
})
export class UiComponent {}
