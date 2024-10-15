import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistorialTab3PageRoutingModule } from './historial-tab3-routing.module';

import { HistorialTab3Page } from './historial-tab3.page';
import { ComponentsModule } from 'src/app/shared/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    HistorialTab3PageRoutingModule
  ],
  declarations: [HistorialTab3Page]
})
export class HistorialTab3PageModule { }
