import {
  Component,
  ElementRef,
  input,
  output,
  SimpleChanges,
} from '@angular/core';
import { createElement } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { Data } from '../../types';

@Component({
  selector: 'app-react-wrapper',
  templateUrl: './react-wrapper.component.html',
  styleUrls: ['./react-wrapper.component.scss'],
  standalone: true,
})
export class ReactWrapperComponent {
  component = input.required<any>();
  inputData = input<Data>();
  outputData = output<Data>();

  root!: Root;

  constructor(private readonly host: ElementRef) {}

  ngAfterViewInit() {
    this.root = createRoot(this.host.nativeElement);
    this._renderComponent();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['inputData'] && changes['inputData'].currentValue?.channel) {
      this._renderComponent();
    }
  }

  private _renderComponent() {
    this.root.render(
      createElement(this.component(), {
        inputData: this.inputData(),
        outputData: (data: Data) => this.outputData.emit(data),
      })
    );
  }

  ngOnDestroy() {
    this.root.unmount();
  }
}
