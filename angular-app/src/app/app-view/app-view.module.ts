import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { FooComponent } from './foo/foo.component';
import { BarComponent } from './bar/bar.component';
import { AppViewComponent } from './app-view.component';

const routes: Route[] = [
  {
    path: '',
    component: AppViewComponent,
    children: [
      {
        path: 'foo',
        component: FooComponent,
      },
      {
        path: 'bar',
        component: BarComponent,
      },
      {
        path: '**',
        redirectTo: 'foo',
      },
    ],
  },
];

@NgModule({
  declarations: [AppViewComponent],
  imports: [RouterModule.forChild(routes)],
  providers: [],
  exports: [],
})
export class AppViewModule {}
