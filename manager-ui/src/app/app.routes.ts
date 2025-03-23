import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './dashboard/users/users.component';
import { ScopesComponent } from './dashboard/scopes/scopes.component';
import { MfeConfigComponent } from './dashboard/mfe-config/mfe-config.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: 'users', component: UsersComponent },
      { path: 'scopes', component: ScopesComponent },
      { path: 'mfe-config', component: MfeConfigComponent },
      { path: '', redirectTo: 'users', pathMatch: 'full' },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
