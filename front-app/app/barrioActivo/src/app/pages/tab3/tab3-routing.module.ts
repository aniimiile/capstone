import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab3Page } from './tab3.page';

const routes: Routes = [
  {
    path: '',
    component: Tab3Page,
  },
  {
    path: 'sos',
    loadChildren: () => import('./sos/sos.module').then(m => m.SosPageModule)
  },
  {
    path: 'reporte',
    loadChildren: () => import('./reporte/reporte.module').then(m => m.ReportePageModule)
  },
  {
    path: 'historial-tab3',
    loadChildren: () => import('./historial-tab3/historial-tab3.module').then(m => m.HistorialTab3PageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab3PageRoutingModule { }
