import { Component } from '@angular/core';
import angularLogo from '../../assets/angular.png';

@Component({
  selector: 'angular-app-view',
  templateUrl: './app-view.component.html',
  styleUrls: ['./app-view.component.scss'],
})
export class AppViewComponent {
  angularLogo = angularLogo;

  ngOnInit() {}
}
