import {
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  input,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactWrapperComponent } from '../../wrappers/react-wrapper/react-wrapper.component';
import { VueWrapperComponent } from '../../wrappers/vue-wrapper/vue-wrapper.component';
import { AngularWrapperComponent } from '../../wrappers/angular-wrapper/angular-wrapper.component';
import { toObservable } from '@angular/core/rxjs-interop';
import { AppService } from '../../app.service';
import Muuri, { Item } from 'muuri';
import { ButtonModule } from 'primeng/button';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { PopoverModule } from 'primeng/popover';
import { ChipModule } from 'primeng/chip';
import { BadgeModule } from 'primeng/badge';
import { Data } from '../../types';

@Component({
  selector: 'widget-view-shell',
  templateUrl: './widget-view.component.html',
  styleUrls: ['./widget-view.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactWrapperComponent,
    VueWrapperComponent,
    AngularWrapperComponent,
    ButtonModule,
    ContextMenuModule,
    PopoverModule,
    ChipModule,
    BadgeModule,
  ],
})
export class WidgetViewComponent {
  loaders = input<any[]>([]);

  op = viewChild<ContextMenu>('op');

  private readonly gridEl = viewChild<ElementRef<HTMLDivElement>>('grid');
  private readonly items = viewChildren<ElementRef<HTMLElement>>('item');
  private _muuri!: Muuri;
  private resizeObserver!: ResizeObserver;
  private resizeTimeout: any; // For debouncing
  availableLinks = signal<any[]>([]);

  selectedWidget = signal<any>(null);

  constructor(readonly appService: AppService, private cdr: ChangeDetectorRef) {
    // Initialize Muuri and ResizeObserver
    effect(() => {
      const grid = this.gridEl()?.nativeElement;
      if (grid && !this._muuri) {
        this._muuri = new Muuri(grid, {
          dragEnabled: true,
          dragHandle: '.js-drag-handle',
        });
      }

      this.resizeObserver = new ResizeObserver(() => {
        // console.log('Resize detected');
        // Clear any existing timeout
        clearTimeout(this.resizeTimeout);
        // Debounce the layout update by 100ms
        this.resizeTimeout = setTimeout(() => {
          this._muuri.refreshItems(); // Update item sizes
          this._muuri.layout(); // Re-layout the grid
          // console.log('Layout updated after debounce');
        }, 100); // Adjust debounce time as needed (e.g., 100ms)
      });
    });

    // Observe all items for resize events
    effect(() => {
      const currentItems = this.items();
      this.resizeObserver.disconnect(); // Clear previous observers
      currentItems.forEach((item) => {
        this.resizeObserver.observe(item.nativeElement);
      });
    });

    // Sync Muuri when openingMFEs changes
    const openingMFEs = toObservable(this.appService.openingMFEs);
    openingMFEs.subscribe((mfes) => {
      // console.log('openingMFEs updated', mfes);
      this.syncMuuriWithItems();
    });
  }

  private syncMuuriWithItems() {
    this.cdr.detectChanges();

    const currentItems = this.items().map((item) => item.nativeElement);
    const muuriItems = this._muuri.getItems();
    // .map((item) => item.getElement()) as HTMLDivElement[];
    const muuriItemsElements = muuriItems.map((item) => item.getElement());

    const itemsToAdd = currentItems.filter(
      (el) => !muuriItemsElements.includes(el)
    );
    if (itemsToAdd.length > 0) {
      this._muuri.add(itemsToAdd, { index: 0 });
      // console.log('Added to Muuri:', itemsToAdd);
    }

    const itemsToRemove = muuriItems.filter((el) => {
      const element = el.getElement();
      return element && !currentItems.includes(element);
    });

    if (itemsToRemove.length > 0) {
      this._muuri.remove(itemsToRemove as unknown as Item[], {
        removeElements: false,
      });
      // console.log('Removed from Muuri:', itemsToRemove);
      // Ensure layout updates after removal
      setTimeout(() => {
        this._muuri.refreshItems();
        this._muuri.layout();
      }, 0);
    } else {
      // Refresh layout even if no removals, to ensure consistency
      this._muuri.refreshItems();
      this._muuri.layout();
    }
  }

  removeWidget(widget: any) {
    this.appService.openingMFEs.update((mfes) =>
      mfes.filter((m) => m !== widget)
    );
  }

  ngOnDestroy() {
    clearTimeout(this.resizeTimeout); // Clean up debounce timeout
    this.resizeObserver?.disconnect(); // Clean up observer
    this._muuri?.destroy(); // Destroy Muuri instance
  }

  getWidgetIcon(widgetType: string) {
    switch (widgetType) {
      case 'hybrid':
        return 'pi pi-arrow-right-arrow-left';
      case 'emitter':
        return 'pi pi-wifi';
      case 'receiver':
        return 'pi pi-download';
      default:
        return 'pi';
    }
  }

  showLinks(widget: any, event: any) {
    if (widget.type === 'standalone' || widget.type === 'emitter') {
      return;
    }

    this.availableLinks.set([]);
    for (const mfe of this.appService.openingMFEs()) {
      if (mfe._id === widget._id) {
        continue;
      }

      if (
        mfe.emittingChannels?.length &&
        mfe.emittingChannels.some((c: any) =>
          widget.receivingChannels?.includes(c)
        )
      ) {
        this.availableLinks.update((links) => [...links, mfe]);
      }
    }

    this.selectedWidget.set(widget);
    this.op()?.toggle(event);
  }

  linkWidget(link: any) {
    this.appService.openingMFEs.update((mfes) => {
      return mfes.map((m) => {
        if (m._id === this.selectedWidget()._id) {
          return {
            ...m,
            connectedTo: link,
          };
        }

        return m;
      });
    });

    this.op()?.hide();
  }

  handleOutputData(widget: any, event: Data) {
    // console.log('Output data received:', widget, event);

    if (!widget.emittingChannels?.includes(event.channel)) {
      return;
    }

    for (const mfe of this.appService.openingMFEs()) {
      if (mfe._id === widget._id) {
        continue;
      }

      if (
        mfe.connectedTo?._id === widget._id &&
        mfe.receivingChannels.includes(event.channel)
      ) {
        mfe.inputData.set(event);
      }
    }
  }
}
