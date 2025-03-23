import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';

interface MFEConfig {
  id: number;
  remoteEntry: string;
  remoteName: string;
  exposedModule: string;
  scopes: { name: string }[];
}

interface EditableMFEConfig {
  id: number;
  remoteEntry: string;
  remoteName: string;
  exposedModule: string;
  scopes: string[];
}

interface Scope {
  id: number;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-mfe-config',
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
    MultiSelectModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './mfe-config.component.html',
})
export class MfeConfigComponent {
  mfeConfigs = signal<MFEConfig[]>([]);
  scopes = signal<Scope[]>([]);
  displayAddDialog = signal<boolean>(false);
  displayEditDialog = signal<boolean>(false);
  newConfig = signal<{
    remoteEntry: string;
    remoteName: string;
    exposedModule: string;
    scopes: string[];
  }>({
    remoteEntry: '',
    remoteName: '',
    exposedModule: '',
    scopes: [],
  });
  editedConfig = signal<EditableMFEConfig | null>(null);

  constructor(
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.loadConfigs();
    this.loadScopes();
  }

  loadConfigs() {
    const token = localStorage.getItem('token');
    this.http
      .get<MFEConfig[]>('http://localhost:3000/mfe-config', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe((configs) => this.mfeConfigs.set(configs));
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
    this.newConfig.set({
      remoteEntry: '',
      remoteName: '',
      exposedModule: '',
      scopes: [],
    });
  }

  showEditDialog(config: MFEConfig) {
    this.displayEditDialog.set(true);
    this.editedConfig.set({
      id: config.id,
      remoteEntry: config.remoteEntry,
      remoteName: config.remoteName,
      exposedModule: config.exposedModule,
      scopes: config.scopes.map((s) => s.name),
    });
  }

  createConfig() {
    const token = localStorage.getItem('token');
    this.http
      .post('http://localhost:3000/mfe-config', this.newConfig(), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe(() => {
        this.loadConfigs();
        this.displayAddDialog.set(false);
      });
  }

  updateConfig() {
    const token = localStorage.getItem('token');
    const config = this.editedConfig();
    if (!config) return;

    this.http
      .put(`http://localhost:3000/mfe-config/${config.id}`, config, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe(() => {
        this.loadConfigs();
        this.displayEditDialog.set(false);
        this.editedConfig.set(null);
      });
  }

  deleteConfig(id: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this MFE config?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const token = localStorage.getItem('token');
        this.http
          .delete(`http://localhost:3000/mfe-config/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .subscribe(() => this.loadConfigs());
      },
    });
  }

  getScopeNames(config: MFEConfig): string {
    return config.scopes.map((s) => s.name).join(', ');
  }
}
