import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

interface Scope {
  id: number;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-scopes',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService], // Add ConfirmationService
  templateUrl: './scopes.component.html',
})
export class ScopesComponent {
  scopes = signal<Scope[]>([]);
  displayAddDialog = signal<boolean>(false);
  displayEditDialog = signal<boolean>(false);
  newScope = signal<{ name: string; description: string }>({
    name: '',
    description: '',
  });
  editedScope = signal<Scope | null>(null);

  constructor(private http: HttpClient, private confirmationService: ConfirmationService) {
    this.loadScopes();
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
    this.newScope.set({ name: '', description: '' });
  }

  showEditDialog(scope: Scope) {
    this.displayEditDialog.set(true);
    this.editedScope.set({ ...scope });
  }

  createScope() {
    const token = localStorage.getItem('token');
    this.http
      .post('http://localhost:3000/scopes', this.newScope(), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe(() => {
        this.loadScopes();
        this.displayAddDialog.set(false);
      });
  }

  updateScope() {
    const token = localStorage.getItem('token');
    const scope = this.editedScope();
    if (!scope) return;

    this.http
      .put(`http://localhost:3000/scopes/${scope.id}`, scope, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe(() => {
        this.loadScopes();
        this.displayEditDialog.set(false);
        this.editedScope.set(null);
      });
  }

  deleteScope(id: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this scope?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const token = localStorage.getItem('token');
        this.http
          .delete(`http://localhost:3000/scopes/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .subscribe(() => this.loadScopes());
      },
    });
  }
}