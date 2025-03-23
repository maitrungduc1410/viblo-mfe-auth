import {
  Component,
  ElementRef,
  input,
  output,
  SimpleChanges,
} from '@angular/core';
import { App, createApp, ref } from 'vue';
import { Data } from '../../types';

@Component({
  selector: 'app-vue-wrapper',
  templateUrl: './vue-wrapper.component.html',
  styleUrls: ['./vue-wrapper.component.scss'],
  standalone: true,
})
export class VueWrapperComponent {
  component = input.required<any>();
  plugins = input<any[]>([]);
  inputData = input<Data>();
  outputData = output<Data>();
  app!: App<Element>;

  _inputData = ref<Data>(this.inputData() || { channel: '', data: {} });

  constructor(private readonly host: ElementRef) {}

  ngAfterViewInit() {
    this.app = createApp(this.component(), {
      inputData: this._inputData,
      outputData: (data: Data) => this.outputData.emit(data),
    });

    if (this.plugins() && Array.isArray(this.plugins())) {
      this.plugins().forEach((plugin: any) => {
        this.app.use(plugin);
      });
    }

    this.app.mount(this.host.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['inputData'] && changes['inputData'].currentValue?.channel) {
      this._inputData.value = this.inputData() || { channel: '', data: {} };
    }
  }

  ngOnDestroy() {
    this.app.unmount();
  }
}
