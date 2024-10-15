import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  formLogin: FormGroup;
  passwordType: string = 'password';
  passwordIcon: string = 'eye-off-outline';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private authService: AuthService
  ) {
    this.formLogin = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('userPassword');

    if (email && password) {
      this.router.navigate(['/tabs/tab1']);
    }
  }

  onSubmit() {
    if (this.formLogin.valid) {
      const { email, password } = this.formLogin.value;
      this.authService.login({ email, password }).subscribe(
        (response) => {
          console.log('Respuesta del servidor:', response);
          if (response.status) {
            // Guardar email y password en localStorage
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userPassword', password);
            // Llamar al método para obtener los datos del usuario y pasar el email como parámetro
            this.authService.getUserData(email).subscribe(
              (userData) => {
                console.log('Datos del usuario:', userData);
                // Guardar datos adicionales del usuario en localStorage si es necesario
                localStorage.setItem('userData', JSON.stringify(userData)); // Almacenar todos los datos del usuario como un objeto JSON
              },
              (error) => {
                console.error('Error al obtener los datos del usuario:', error);
              }
            );

            // Navegar a la página principal después del inicio de sesión exitoso
            this.router.navigate(['/tabs/tab1']);
          } else {
            this.showAlert('Credenciales incorrectas');
          }
        },
        (error) => {
          this.showAlert('Error en el servidor'); // Muestra alerta si hay error en el servidor
          console.error('Error:', error);
        }
      );
    } else {
      this.showAlert('Por favor, completa todos los campos'); // Llama a showAlert si el formulario es inválido
    }
  }

  async showAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK'], // Botón para cerrar la alerta
    });

    await alert.present(); // Presenta la alerta
  }

  togglePasswordVisibility() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text';
      this.passwordIcon = 'eye-outline';
    } else {
      this.passwordType = 'password';
      this.passwordIcon = 'eye-off-outline';
    }
  }

  goToInscripcion() {
    this.router.navigate(['register']);
  }
}