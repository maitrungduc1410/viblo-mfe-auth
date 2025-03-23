import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmationService, MessageService } from 'primeng/api';

interface User {
  id: number;
  email: string;
  isAdmin: boolean;
  scopes: { name: string }[];
}

interface Scope {
  id: number;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    ConfirmDialogModule,
    MultiSelectModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './users.component.html',
})
export class UsersComponent {
  users = signal<User[]>([]);
  scopes = signal<Scope[]>([]);
  displayAddDialog = signal<boolean>(false);
  displayEditDialog = signal<boolean>(false);
  newUser = signal<{
    email: string;
    password: string;
    isAdmin: boolean;
    scopes: string[];
  }>({
    email: '',
    password: '',
    isAdmin: false,
    scopes: [],
  });
  editedUser = signal<{
    id: number;
    password: string;
    isAdmin: boolean;
    scopes: string[];
  } | null>(null);

  constructor(
    private http: HttpClient,
    private confirmationService: ConfirmationService
  ) {
    this.loadUsers();
    this.loadScopes();
  }

  loadUsers() {
    const token = localStorage.getItem('token');
    this.http
      .get<User[]>('http://localhost:3000/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe((users) => this.users.set(users));
  }

  loadScopes() {
    const token = localStorage.getItem('token');
    this.http
      .get<Scope[]>('http://localhost:3000/scopes', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe((scopes) => this.scopes.set(scopes));
  }

  showAddDialog() {
    this.displayAddDialog.set(true);
    this.newUser.set({ email: '', password: '', isAdmin: false, scopes: [] });
  }

  showEditDialog(user: User) {
    this.displayEditDialog.set(true);
    this.http
      .get<User>(`http://localhost:3000/users/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .subscribe((fullUser) => {
        this.editedUser.set({
          id: user.id,
          password: '',
          isAdmin: user.isAdmin,
          scopes: fullUser.scopes.map((s) => s.name),
        });
      });
  }

  createUser() {
    const token = localStorage.getItem('token');
    this.http
      .post('http://localhost:3000/users', this.newUser(), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe(() => {
        this.loadUsers();
        this.displayAddDialog.set(false);
      });
  }

  updateUser() {
    const token = localStorage.getItem('token');
    const user = this.editedUser();
    if (!user) return;

    const updateData = {
      password: user.password || undefined,
      isAdmin: user.isAdmin,
      scopes: user.scopes,
    };

    this.http
      .put(`http://localhost:3000/users/${user.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe(() => {
        this.loadUsers();
        this.displayEditDialog.set(false);
        this.editedUser.set(null);
      });
  }

  deleteUser(id: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this user?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const token = localStorage.getItem('token');
        this.http
          .delete(`http://localhost:3000/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .subscribe(() => this.loadUsers());
      },
    });
  }

  getScopeNames(user: User): string {
    return user.scopes.map((s) => s.name).join(', ');
  }
}
