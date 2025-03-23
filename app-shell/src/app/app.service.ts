import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  registerMFEs = signal<any[]>([]);
  openingMFEs = signal<any[]>([]);
}
