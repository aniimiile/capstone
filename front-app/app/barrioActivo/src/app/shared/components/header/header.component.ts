import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() pageTitle: string = 'BarrioActivo';  // Valor por defecto si no se pasa uno
  @Input() showBackButton: boolean = false;     // Controla si se muestra el botón de retroceso

  constructor(
    private router: Router,
    private navCtrl: NavController,
  ) { }

  ngOnInit() {
    // Detecta si la ruta actual es una de las que necesita mostrar el botón de retroceso
    const currentUrl = this.router.url;
    if (currentUrl.includes('/sos') || currentUrl.includes('/reporte') || currentUrl.includes('/historial-tab3') || currentUrl.includes('/profile')) {
      this.showBackButton = true;
    } else {
      this.showBackButton = false;
    }
  }

  goProfile() {
    this.router.navigate(['profile'])
  }
  // Función para retroceder a la página anterior en la pila de navegación
  goBack() {
    this.navCtrl.back();
  }
}
