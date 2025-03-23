import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { HttpClient } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule, ToastModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService],
})
export class LoginComponent {
  // Signals for form data and state
  email = signal<string>('');
  password = signal<string>('');
  error = signal<string | null>(null);
  loading = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService
  ) {}

  login() {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const payload = {
      email: this.email(),
      password: this.password(),
    };

    this.http
      .post<{ token: string }>('http://localhost:3000/auth/login', payload)
      .subscribe({
        next: (response) => {
          this.loading.set(false);

          const token = response.token;
          if (!token) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No token received',
            });
            return;
          }

          // Decode JWT to get user info (assuming email and isAdmin are in payload)
          const decoded = JSON.parse(atob(token.split('.')[1]));

          if (!decoded.isAdmin) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'You are not authorized to access this application',
            });

            return;
          }

          // Store token (e.g., in localStorage)
          localStorage.setItem('token', token);
          this.router.navigate(['/dashboard']); // Redirect to a dashboard route
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Login failed');
          this.loading.set(false);

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.error() || 'Login failed',
          });
        },
      });
  }
}
