import {
  Component,
  ComponentRef,
  EventEmitter,
  input,
  output,
  SimpleChange,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Data } from '../../types';
import { toObservable } from '@angular/core/rxjs-interop';

export type ComponentInstance = {
  inputData: Data;
  outputData?: EventEmitter<Data>;
  ngOnChanges?(changes: SimpleChanges): void;
};

@Component({
  selector: 'app-angular-wrapper',
  templateUrl: './angular-wrapper.component.html',
  styleUrls: ['./angular-wrapper.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class AngularWrapperComponent {
  component = input.required<any>();
  module = input<any>();
  inputData = input<Data>();
  outputData = output<Data>();

  componentRef!: ComponentRef<ComponentInstance>;

  constructor(private readonly viewContainerRef: ViewContainerRef) {}

  ngOnInit() {
    this.componentRef = this.viewContainerRef.createComponent(
      this.component(),
      {}
    );

    this.updateComponent();

    this.componentRef.instance.outputData?.subscribe((data: Data) => {
      this.outputData.emit(data);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['inputData'] && changes['inputData'].currentValue.channel) {
      this.updateComponent();
    }
  }

  private updateComponent() {
    const newChanges: SimpleChanges = {
      inputData: new SimpleChange(null, this.inputData(), false),
    };
    this.componentRef.instance.ngOnChanges?.(newChanges);
  }
}
