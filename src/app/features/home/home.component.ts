import { Logo } from '@/shared/components/logo/logo.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [Logo],
})
export class Home {}
