import { AuthService } from '@/core/services/auth/auth.service';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { H2Directive } from '@/shared/directives/ui/h2/h2';
import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login-form',
  imports: [H2Directive, ButtonDirective, FormInput, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-form.component.html',
})
export class LoginForm implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private subscription: Subscription | null = null;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.subscription = this.authService.login({ email: email!, password: password! }).subscribe({
        next: (user) => {
          console.log('Login successful:', user);
        },
        error: (err) => {
          console.error('Login failed:', err);
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
