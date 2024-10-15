import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { ContentService } from 'src/app/core/services/content.service';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.page.html',
  styleUrls: ['./reporte.page.scss'],
})
export class ReportePage implements OnInit {
  formReporte: FormGroup;
  idNeighborhoodBoard: number | null = null;
  userRUT: string | null = null;
  image: File | null = null; // <-- Añade esta línea
  imagePreview: string | null = null; // Añadir propiedad para la vista previa


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private authService: AuthService,
    private content: ContentService
  ) {
    this.formReporte = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      image: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData() {
    // Verificamos si los datos ya están disponibles antes de realizar la solicitud
    if (!this.idNeighborhoodBoard || !this.userRUT) {
      this.getUserDataFromLocalStorage();
    }
  }

  private getUserDataFromLocalStorage() {
    const userEmail = localStorage.getItem('userEmail');

    if (userEmail) {
      this.authService.getUserData(userEmail).subscribe(
        (data: any) => {
          console.log('Datos del usuario:', data);
          this.idNeighborhoodBoard = data.id_Neighborhood_Board;
          this.userRUT = data.rut;
        },
        (error) => {
          console.error('Error al obtener los datos del usuario:', error);
        }
      );
    } else {
      console.error('No se encontró el email del usuario en localStorage.');
    }
  }

  async showAlertConfirm(message: string, onConfirm: () => void) {
    const alert = await this.alertController.create({
      header: 'Confirmar reporte',
      message: message,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Reporte cancelado.');
          }
        },
        {
          text: 'Sí',
          handler: () => {
            onConfirm();
          }
        }
      ]
    });
    await alert.present();
  }


  onSubmit() {
    console.log('Estado del formulario:', this.formReporte.value);
    if (this.formReporte.valid && this.idNeighborhoodBoard && this.userRUT) {
      const reporteData = {
        id_neighborhood_board: this.idNeighborhoodBoard,
        rut: this.userRUT,
        title: this.formReporte.value.title,
        description: this.formReporte.value.description,
        image: this.formReporte.value.image,
      };

      console.log('Datos de reporte a enviar:', reporteData); // Para depurar

      // Mostrar el alert de confirmación
      this.showAlertConfirm('¿Confirmar reporte?', async () => {
        // Muestra el loading mientras se registra el reporte
        const loading = await this.loadingController.create({
          message: 'Registrando reporte...',
        });
        await loading.present();

        // Envía los datos a la API
        this.content.sendReporteData(reporteData).subscribe(
          async (response) => {
            console.log('Respuesta del servidor:', response);
            await loading.dismiss(); // Oculta el loading
            if (response.status) {
              // Muestra el alert de éxito
              const successAlert = await this.alertController.create({
                header: 'Éxito',
                message: 'Reporte registrado',
                buttons: ['OK']
              });
              await successAlert.present();
            } else {
              this.showAlert('Error al enviar el reporte. Por favor, inténtalo de nuevo.');
            }
          },
          async (error) => {
            await loading.dismiss(); // Oculta el loading en caso de error
            this.showAlert('Error en el servidor. Por favor, inténtalo más tarde.');
            console.error('Error al enviar el reporte:', error);
          }
        );
      });
    } else {
      // Mostrar alerta si faltan datos
      this.showAlert('Por favor, completa todos los campos obligatorios.');
    }
  }

  async showAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Atención',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }
  onFileSelected(event: any, field: string) {
    const file = event.target.files[0];
    this.formReporte.patchValue({ [field]: file });
    this.formReporte.get(field)?.updateValueAndValidity();

    // Muestra una vista previa de la imagen (opcional)
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }


}
