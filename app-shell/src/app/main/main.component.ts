import { Component, computed, Signal, signal } from '@angular/core';
import { loadRemoteModule } from '../utils/federation-utils';
import { AppService } from '../app.service';
import { CommonModule } from '@angular/common';
import { ReactWrapperComponent } from '../wrappers/react-wrapper/react-wrapper.component';
import { VueWrapperComponent } from '../wrappers/vue-wrapper/vue-wrapper.component';
import { Router, RouterModule } from '@angular/router';
import { WidgetViewComponent } from './widget-view/widget-view.component';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { nanoid } from 'nanoid';
import randomColor from 'randomcolor';
import { Data, MFEConfig } from '../types';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    WidgetViewComponent,
    FormsModule,

    SelectModule,
    ButtonModule,
    ToggleSwitchModule,
    DrawerModule,
    TooltipModule,
    CardModule,
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  loaders = signal<any[]>([]);
  widgetLoaders = computed(() => {
    return this.loaders().filter((loader) => !loader.appView);
  });

  appViewLoaders = computed(() => {
    return this.loaders().filter((loader) => loader.appView);
  });

  isAppView = signal(false);
  isSidebarOpen = signal(false);
  selectableWidgets: Signal<any[]> = signal([]);

  constructor(
    private readonly appService: AppService,
    private readonly router: Router,
    private readonly http: HttpClient
  ) {
    this.fetchMFEConfigs();

    this.selectableWidgets = computed(() => {
      return this.appService
        .registerMFEs()
        .filter((m) => (this.isAppView() ? m.appView : !m.appView));
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('publicKey');
    window.location.reload();
  }

  async fetchMFEConfigs() {
    const token = localStorage.getItem('token');
    this.http
      .get<MFEConfig[]>('http://localhost:3000/mfe-config/accessible', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe((mfeConfigs) => {
        this.loadModules(mfeConfigs);
      });
  }

  async loadModules(modules: MFEConfig[]) {
    for (const m of modules) {
      try {
        const module = await loadRemoteModule(m);

        let loader;
        if (module.default) {
          loader = module.default;
        } else {
          loader = module;
        }

        const exports = Object.keys(loader);

        this.appService.registerMFEs.update((m) => [
          ...m,
          ...exports.map((e) => loader[e]),
        ]);

        this.loaders.update((loaders) => [
          ...loaders,
          ...exports.map((item) => loader[item]),
        ]);

        const mainRoute = this.router.config.find((r) => r.path === 'main');

        if (mainRoute) {
          for (const appView of exports.filter((e) => loader[e].appView)) {
            const l = loader[appView];
            if (l.routeName) {
              const existingRoute = mainRoute.children?.find(
                (r) => r.path === l.routeName
              );

              if (!existingRoute) {
                mainRoute.children?.push({
                  path: l.routeName,
                  ...(l.framework === 'angular'
                    ? { loadChildren: () => l.module }
                    : l.framework === 'react'
                    ? { component: ReactWrapperComponent }
                    : { component: VueWrapperComponent }),
                  data: {
                    component: l.component,
                    plugins: l.plugins,
                  },
                });
              }
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    this.router.resetConfig(this.router.config);
  }

  getWidgetType(widget: any): string {
    if (widget.emittingChannels?.length && widget.receivingChannels?.length) {
      return 'hybrid';
    } else if (widget.emittingChannels?.length) {
      return 'emitter';
    } else if (widget.receivingChannels?.length) {
      return 'receiver';
    } else {
      return 'standalone';
    }
  }

  addWidget(widget: any) {
    if (widget.appView) {
      this.router.navigate([`main/${widget.routeName}`]);
      return;
    }

    this.appService.openingMFEs.update((m) => [
      ...m,
      {
        ...widget,
        _id: nanoid(),
        color: randomColor(),
        type: this.getWidgetType(widget),
        inputData: signal<Data>({
          channel: '',
          data: {},
        }),
      },
    ]);
  }
}
