import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  constructor(
    private router: Router
  ) { }

  goToSOS() {
    this.router.navigate(['tabs/tab3/sos'])
  }
  goToReporte() {
    this.router.navigate(['tabs/tab3/reporte'])
  }
  goToHistorial() {
    this.router.navigate(['tabs/tab3/historial-tab3'])
  }
}
