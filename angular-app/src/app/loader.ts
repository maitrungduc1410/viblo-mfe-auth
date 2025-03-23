import { AppComponent } from './app.component';
import { AppViewModule } from './app-view/app-view.module';

const widget = {
  id: 'ANGULAR_WIDGET',
  framework: 'angular',
  component: AppComponent,
  title: 'My Angular Widget',
  emittingChannels: ['ANGULAR_WIDGET'],
  receivingChannels: ['ANGULAR_WIDGET', 'REACT_WIDGET'],
  width: 600,
  height: 400
};

const app = {
  id: 'ANGULAR_APP',
  framework: 'angular',
  module: AppViewModule,
  routeName: 'angular-app',
  appView: true,
  title: 'Angular App',
};

export { widget, app };
