import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports: [
    HeaderComponent  // Exporta el componente para que esté disponible fuera de este módulo
  ]
})
export class ComponentsModule { }
