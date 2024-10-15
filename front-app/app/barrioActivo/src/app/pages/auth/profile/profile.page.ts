import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { ContentService } from 'src/app/core/services/content.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  userData: any;
  neighborhoodBoardName: string | null = null; // Para almacenar el nombre de la junta de vecinos

  constructor(
    private authService: AuthService,
  ) { }

  ngOnInit() {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      this.userData = JSON.parse(storedUserData);
      console.log('User Data:', this.userData); // Verifica los datos del usuario
    }

    // Recuperar las juntas de vecinos
    this.authService.fetchNeighborhoodBoards().subscribe(() => {
      this.neighborhoodBoardName = this.authService.getNeighborhoodBoardName(this.userData.id_Neighborhood_Board);
      console.log('Neighborhood Board Name:', this.neighborhoodBoardName); // Verifica el nombre de la junta
    });
  }
}