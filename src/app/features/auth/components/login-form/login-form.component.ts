import { ApiErrorBody } from '@/core/services/api/api.interface';
import { AuthService } from '@/core/services/auth/auth.service';
import { LoggerService } from '@/core/services/logger/logger.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { ButtonComponent } from '@/shared/components/button/button.component';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { H2Directive } from '@/shared/directives/ui/h2/h2';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login-form',
  imports: [H2Directive, ButtonComponent, FormInput, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-form.component.html',
})
export class LoginForm implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private logger = inject(LoggerService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private subscription: Subscription | null = null;

  isLoading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    this.logger.debug({
      message: 'onSubmit called',
      data: { valid: this.loginForm.valid, value: this.loginForm.value },
    });
    if (this.loginForm.valid) {
      this.logger.debug({ message: 'Form is valid, setting isLoading to true' });
      this.isLoading.set(true);
      const { email, password } = this.loginForm.value;
      this.subscription = this.authService.login({ email: email!, password: password! }).subscribe({
        next: (user) => {
          this.logger.info({ message: 'Login successful', data: { user } });
          this.isLoading.set(false);
          this.router.navigate(['/ui']);
        },
        error: (err: ApiErrorBody) => {
          this.logger.debug({ message: 'Error callback reached', data: { err } });
          this.logger.error({ message: 'Login failed', data: { error: err.message } });
          this.toastService.show(err.message, 'error');
          this.logger.debug({
            message: 'Toast show called',
            data: { toasts: this.toastService.getToasts() },
          });
          this.isLoading.set(false);
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
