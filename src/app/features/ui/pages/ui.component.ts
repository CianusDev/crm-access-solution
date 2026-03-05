import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { H2Directive } from '@/shared/directives/ui/h2/h2';
import { InputDirective } from '@/shared/directives/ui/input/input';
import { Component } from '@angular/core';

@Component({
  selector: 'app-ui',
  imports: [ButtonDirective, InputDirective, H2Directive],
  templateUrl: './ui.html',
})
export class UiComponent {}
