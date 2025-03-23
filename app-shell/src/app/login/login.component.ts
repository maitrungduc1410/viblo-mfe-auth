import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  // Signals for form data and state
  email = signal<string>('');
  password = signal<string>('');
  error = signal<string | null>(null);
  loading = signal<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.loading.set(true);
    this.error.set(null);

    const payload = {
      email: this.email(),
      password: this.password(),
    };

    this.http
      .post<{ token: string; publicKey: string }>(
        'http://localhost:3000/auth/login',
        payload
      )
      .subscribe({
        next: (response) => {
          // Store token (e.g., in localStorage)
          localStorage.setItem('token', response.token);
          localStorage.setItem('publicKey', response.publicKey);
          this.loading.set(false);
          this.router.navigate(['/main'])
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Login failed');
          this.loading.set(false);
        },
      });
  }
}
