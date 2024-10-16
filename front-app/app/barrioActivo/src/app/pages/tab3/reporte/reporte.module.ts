import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportePageRoutingModule } from './reporte-routing.module';

import { ReportePage } from './reporte.page';
import { ComponentsModule } from 'src/app/shared/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    ReactiveFormsModule,
    ReportePageRoutingModule
  ],
  declarations: [ReportePage]
})
export class ReportePageModule { }
