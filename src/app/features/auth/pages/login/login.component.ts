import { Component } from '@angular/core';
import { LoginForm } from '../../components/login-form/login-form.component';

@Component({
  selector: 'app-login-page',
  imports: [LoginForm],
  templateUrl: './login.component.html',
})
export class LoginPage {}
