import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'; // Asegúrate de importar CameraSource
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  formRegister: FormGroup;
  juntas: { id_neighborhood_board: number; name: string }[] = []; // Cambiamos el tipo de dato
  currentStep: number = 1; // Variable para controlar el paso del formulario
  image1: File | null = null; // Para almacenar la imagen de la cédula
  image2: File | null = null; // Para almacenar la imagen de la cara
  isSubmitting: boolean = false; //Control del estado del botón

  isIdCardScanned: boolean = false;
  isFaceScanned: boolean = false;
  validationMessage: string = '';
  isValidationSuccessful: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private authService: AuthService
  ) {
    this.formRegister = this.formBuilder.group({
      id_neighborhood_board: ['', Validators.required], // Changed from 'junta' to 'id_neighborhood_board'
      image1: [null],
      image2: [null],
      rut: ['', Validators.required],
      first_name: ['', Validators.required],
      second_name: [''],
      first_surname: ['', Validators.required],
      second_surname: [''],
      address: ['', Validators.required],
      cellphone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      birthdate: ['', Validators.required],
      address_verification_url: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.loadNeighborhoodBoards();
  }

  // Método para cargar las juntas de vecinos desde la API
  private loadNeighborhoodBoards() {
    this.authService.getNeighborhoodBoards().subscribe(
      (response) => {
        this.juntas = response; // Asigna la respuesta de la API al arreglo de juntas
      },
      (error) => {
        console.error('Error al cargar las juntas de vecinos:', error);
        this.showAlert('Error al cargar las juntas de vecinos. Por favor, intenta nuevamente.', 'Error');
      }
    );
  }

  // Método para obtener el nombre de la junta basada en el ID seleccionado
  getSelectedJuntaName(): string {
    const selectedId = this.formRegister.get('id_neighborhood_board')?.value; // Change 'junta' to 'id_neighborhood_board'
    const selectedJunta = this.juntas.find(junta => junta.id_neighborhood_board === selectedId);
    return selectedJunta ? selectedJunta.name : 'No seleccionado';
  }

  // Método para avanzar al siguiente paso del formulario
  continuarRegistro() {
    if (this.currentStep === 1) {
      if (this.formRegister.controls['id_neighborhood_board'].valid) {
        this.currentStep++;
      } else {
        alert('Por favor, selecciona una Junta de Vecinos.');
      }
    } else if (this.currentStep === 2) {
      if (
        this.formRegister.controls['image1']?.value && // Asegúrate de que image1 e image2 existan
        this.formRegister.controls['image2']?.value
      ) {
        this.currentStep++;
      } else {
        alert('Por favor, sube las imágenes requeridas.');
      }
    } else if (this.currentStep === 3) {
      if (this.formRegister.valid) {
        this.currentStep++;
      } else {
        alert('Por favor, completa todos los campos obligatorios.');
      }
    }
  }


  // Método para retroceder en el formulario
  retrocederRegistro() {
    if (this.currentStep > 1) {
      this.currentStep--;
    } else {
      // Si estás en la página 1, redirige al login
      this.router.navigate(['/login']); // Cambia la ruta si es necesario
    }
  }

  onFileSelected(event: any, fileType: string) {
    const input = event.target;
    const files: FileList = input.files;

    if (files.length > 1) {
      alert('Solo puedes subir un archivo a la vez.');
      input.value = '';
      return;
    }

    const file: File = files[0];

    if (file) {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
      ];
      if (allowedTypes.includes(file.type)) {
        if (fileType === 'image1') {
          this.image1 = file;
          this.formRegister.patchValue({ image1: file });
          this.formRegister.get('image1')?.updateValueAndValidity(); // Actualiza la validez del campo
        } else if (fileType === 'image2') {
          this.image2 = file;
          this.formRegister.patchValue({ image2: file });
          this.formRegister.get('image2')?.updateValueAndValidity(); // Actualiza la validez del campo
        } else {
          this.formRegister.patchValue({ address_verification_url: file });
          this.formRegister
            .get('address_verification_url')
            ?.updateValueAndValidity(); // Actualiza la validez del campo
        }
      } else {
        alert('Solo se permiten imágenes (JPEG, PNG, GIF) y archivos PDF.');
        input.value = '';
      }
    }
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Registro completado. \n Redigiendo a Login',
      duration: 3000, // Muestra el loading por 3 segundos
      backdropDismiss: false, // No permitir cerrar el loading al tocar el fondo
    });

    await loading.present(); // Muestra el loading

    // Redirige después de que el loading termine
    loading.onDidDismiss().then(() => {
      this.router.navigate(['/login']); // Redirige a la página de login
    });
  }

  submitForm() {
    if (this.formRegister.valid) {
      const selectedJunta = this.formRegister.get('id_neighborhood_board')?.value;
      if (!selectedJunta) {
        alert('Por favor, selecciona una Junta de Vecinos.');
        return;
      }

      this.isSubmitting = true;
      const documentVerification = this.formRegister.get('address_verification_url')?.value;

      // Llama al servicio para registrar al usuario
      this.authService.registerUser(this.formRegister.value, documentVerification).subscribe(
        async (response) => {
          console.log('Usuario registrado exitosamente', response);

          // Mostrar el ion-loading
          const loading = await this.loadingController.create({
            message: 'Cargando...',
            duration: 3000, // Duración en milisegundos
          });
          await loading.present();

          // Mostrar el alert después de que el loading termine
          setTimeout(async () => {
            await loading.dismiss(); // Dismiss the loading
            const alert = await this.alertController.create({
              header: 'Éxito',
              message: 'Redireccionando al login...',
              buttons: ['OK']
            });
            await alert.present();

            // Redirigir al login después de 2 segundos
            setTimeout(() => {
              this.router.navigate(['/login']); // Cambia la ruta si es necesario
            }, 2000);
          }, 3000); // Tiempo igual al duration del loading

          this.isSubmitting = false;
        },
        (error) => {
          console.error('Error al registrar usuario', error);
          this.isSubmitting = false;
        }
      );
    } else {
      alert('Por favor, completa todos los campos requeridos.');
    }
  }


  //SCANEO DE LA CAMARA PASO 2 DEL FORMULARIO
  // Método para escanear la cédula de identidad
  async scanIdCard() {
    try {
      const image = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90,
      });

      const response = await fetch(image.webPath!);
      const blob = await response.blob();
      this.image1 = new File([blob], 'id_card.jpg', { type: 'image/jpeg' });
      this.isIdCardScanned = true;

      // Actualizar el formulario reactivo con la imagen escaneada
      this.formRegister.patchValue({ image1: this.image1 });
      this.formRegister.get('image1')?.updateValueAndValidity();
    } catch (error) {
      console.error('Error al escanear la cédula:', error);
    }
  }

  // Método para escanear la cara
  async scanFace() {
    try {
      const image = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90,
      });

      const response = await fetch(image.webPath!);
      const blob = await response.blob();
      this.image2 = new File([blob], 'face.jpg', { type: 'image/jpeg' });
      this.isFaceScanned = true;

      // Actualizar el formulario reactivo con la imagen escaneada
      this.formRegister.patchValue({ image2: this.image2 });
      this.formRegister.get('image2')?.updateValueAndValidity();
    } catch (error) {
      console.error('Error al escanear la cara:', error);
    }
  }

  // Método para validar la imagen
  async validateFace() {
    if (this.image1 && this.image2) {
      const loading = await this.presentLoading2(); // Mostrar el loader al iniciar la validación

      try {
        const response = await this.authService
          .faceValidation(this.image1, this.image2)
          .toPromise();
        if (loading) {
          await loading.dismiss(); // Ocultar el loader una vez que se complete la validación
        }

        if (response.status === true) {
          this.validationMessage = '¡Validación Correcta!';
          this.isValidationSuccessful = true;
          this.showAlert(
            'Las imágenes coinciden. Validación exitosa.',
            'Éxito'
          );
          this.continuarRegistro(); // Continúa con el registro
        } else if (response.status === false) {
          this.validationMessage =
            'La validación facial falló. Persona no coincide.';
          this.isValidationSuccessful = false;
          this.showAlert(
            'La validación facial falló. Persona no coincide.',
            'Error'
          );
        } else {
          this.validationMessage =
            'Ocurrió un error inesperado en la respuesta.';
          this.isValidationSuccessful = false;
          this.showAlert(
            'Ocurrió un error inesperado en la respuesta.',
            'Error'
          );
        }
      } catch (error) {
        if (loading) {
          await loading.dismiss(); // Ocultar el loader en caso de error
        }
        console.error('Error en la validación facial:', error);
        this.validationMessage =
          'Ocurrió un error al ejecutar la validación facial.';
        this.isValidationSuccessful = false;
        this.showAlert(
          'Ocurrió un error al ejecutar la validación facial.',
          'Error'
        );
      }
    } else {
      this.showAlert(
        'Por favor, escanea ambas imágenes antes de validar.',
        'Advertencia'
      );
    }
  }

  // Método para mostrar una alerta con título y mensaje personalizados
  async showAlert(message: string, title: string = 'Información') {
    const alert = await this.alertController.create({
      header: title, // Título del alert
      message: message, // Mensaje del alert
      buttons: ['OK'],
    });

    await alert.present();
  }

  async presentLoading2() {
    const loading = await this.loadingController.create({
      message: 'Validando imágenes...',
      spinner: 'circles',
    });
    await loading.present();
    return loading; // Devuelve el objeto 'loading' para que pueda ser utilizado.
  }
}
