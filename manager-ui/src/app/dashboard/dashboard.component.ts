import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface User {
  email: string;
  isAdmin: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
  ],
  templateUrl: './dashboard.component.html',
  animations: [
    trigger('sidebarAnimation', [
      state('open', style({ width: '15rem', opacity: 1 })),
      state('closed', style({ width: '0', opacity: 0, overflow: 'hidden' })),
      transition('open => closed', [animate('300ms ease-in-out')]),
      transition('closed => open', [animate('300ms ease-in-out')]),
    ]),
  ],
})
export class DashboardComponent {
  sidebarVisible = signal<boolean>(true);
  user = signal<User | null>(null);
  menuItems = signal<MenuItem[]>([
    { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout() },
  ]);

  constructor(private router: Router, private http: HttpClient) {
    this.loadUser();
  }

  toggleSidebar() {
    this.sidebarVisible.set(!this.sidebarVisible());
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  private loadUser() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.logout()
      return;
    }

    // Decode JWT to get user info (assuming email and isAdmin are in payload)
    const decoded = JSON.parse(atob(token.split('.')[1]));
    this.user.set({ email: decoded.email, isAdmin: decoded.isAdmin });
  }
}