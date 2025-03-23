import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import angularLogo from '../assets/angular.png';

type Data = {
  channel: string;
  data: any;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  angularLogo = angularLogo;
  @Input() inputData!: Data;
  @Output() outputData = new EventEmitter<Data>();

  stringify = JSON.stringify;

  _inputData?: Data;

  handleClick() {
    this.outputData.emit({
      channel: 'ANGULAR_WIDGET',
      data: 'Hello from Angular',
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['inputData'] && changes['inputData'].currentValue) {
      this._inputData = changes['inputData'].currentValue;
    }
  }
}
