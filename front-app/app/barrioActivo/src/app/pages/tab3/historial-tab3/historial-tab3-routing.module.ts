import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HistorialTab3Page } from './historial-tab3.page';

const routes: Routes = [
  {
    path: '',
    component: HistorialTab3Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistorialTab3PageRoutingModule {}
