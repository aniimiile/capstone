///<reference path="../../../../../node_modules/@types/googlemaps/index.d.ts"/>
import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular'; // Asegúrate de importar AlertController
import { AuthService } from 'src/app/core/services/auth.service';
import { ContentService } from 'src/app/core/services/content.service';

@Component({
  selector: 'app-sos',
  templateUrl: './sos.page.html',
  styleUrls: ['./sos.page.scss'],
})
export class SosPage implements OnInit {
  @ViewChild('divMap') divMap!: ElementRef;
  @ViewChild('inputPlaces') inputPlaces!: ElementRef;

  mapa!: google.maps.Map;
  marker!: google.maps.Marker | null; // Para asegurar que solo se tenga un marcador
  formSOS: FormGroup;
  categorias: any[] = []; // Para recibir datos de la API
  idNeighborhoodBoard: number | null = null;
  userRUT: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private renderer: Renderer2,
    private alertController: AlertController, // Asegúrate de inyectar el servicio AlertController
    private authService: AuthService,
    private content: ContentService
  ) {
    this.marker = null;

    this.formSOS = this.formBuilder.group({
      id_category: ['', Validators.required],
      address: ['', Validators.required],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
      description: [''],
    });
  }

  // Este método se ejecutará cuando la página se cargue
  ngOnInit() {
    this.getUserData();
  }

  private getUserData() {
    const userEmail = localStorage.getItem('userEmail');

    if (userEmail) {
      this.authService.getUserData(userEmail).subscribe(
        (data: any) => {
          console.log('Datos del usuario:', data);
          // Cambia esto a id_Neighborhood_Board para obtener el ID correcto
          this.idNeighborhoodBoard = data.id_Neighborhood_Board; // Cambiado aquí
          this.userRUT = data.rut;

          if (this.idNeighborhoodBoard) {
            console.log('ID de la Junta de Vecinos obtenido:', this.idNeighborhoodBoard);
            this.loadEmergencyCategories(); // Cargar categorías después de obtener el ID de la junta
          } else {
            console.error('ID de la Junta de Vecinos no encontrado en los datos del usuario.');
          }
        },
        (error) => {
          console.error('Error al obtener los datos del usuario:', error);
        }
      );
    } else {
      console.error('No se encontró el email del usuario en localStorage.');
    }
  }

  // Método para cargar las categorías desde la API
  private loadEmergencyCategories() {
    if (this.idNeighborhoodBoard) {
      console.log('Cargando categorías de emergencia para ID de Junta de Vecinos:', this.idNeighborhoodBoard); // Añadido para depurar
      this.content.getEmergencyCategory(this.idNeighborhoodBoard).subscribe(
        (data: any) => {
          console.log('Categorías de emergencia recibidas:', data); // Comprobamos qué datos se reciben
          this.categorias = data; // Aquí asignamos las categorías
        },
        (error) => {
          console.error('Error al obtener las categorías:', error);
        }
      );
    } else {
      console.error('No se encontró el ID de la junta de vecinos.');
    }
  }

  ngAfterViewInit(): void {
    const opciones = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log(
            'Ubicación obtenida: Latitud:',
            position.coords.latitude,
            'Longitud:',
            position.coords.longitude
          );
          await this.cargarMapa(position);
          this.cargarAutocomplete();
        },
        (error) => {
          console.error('Error al obtener la ubicación:', error);
        },
        opciones
      );
    } else {
      console.log('Navegador no compatible');
    }
  }

  onSubmit() {
    console.log('Estado del formulario:', this.formSOS.value);
    if (this.formSOS.valid && this.idNeighborhoodBoard && this.userRUT) {
      const emergencyData = {
        id_neighborhood: this.idNeighborhoodBoard,
        id_category: this.formSOS.value.id_category,
        rut: this.userRUT,
        address: this.formSOS.value.address,
        description: this.formSOS.value.description,
        latitude: String(this.formSOS.value.latitude),
        longitude: String(this.formSOS.value.longitude),
      };

      console.log('Datos de emergencia a enviar:', emergencyData);

      this.content.sendEmergencyData(emergencyData).subscribe(
        (response) => {
          console.log('Respuesta del servidor:', response);
          if (response.status) {
            this.router.navigate(['/tabs/tab1']);
          } else {
            this.showAlert('Error al enviar la emergencia. Por favor, inténtalo de nuevo.');
          }
        },
        (error) => {
          this.showAlert('Error en el servidor. Por favor, inténtalo más tarde.');
          console.error('Error al enviar la emergencia:', error);
        }
      );
    } else {
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

  cargarMapa(position: any): any {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const opciones = {
      center: new google.maps.LatLng(lat, lng),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    this.mapa = new google.maps.Map(
      this.renderer.selectRootElement(this.divMap.nativeElement),
      opciones
    );

    this.marker = new google.maps.Marker({
      position: { lat, lng },
      map: this.mapa,
      draggable: true,
    });

    // Actualizar el formulario con la dirección obtenida por las coordenadas
    const latLng = new google.maps.LatLng(lat, lng);
    this.actualizarFormularioConLatLng(latLng);

    // Actualizar las coordenadas en el formulario
    this.formSOS.controls['latitude'].setValue(lat.toString());
    this.formSOS.controls['longitude'].setValue(lng.toString());

    // Añadir un listener para cuando el marcador se mueva
    google.maps.event.addListener(this.marker, 'dragend', () => {
      const newLatLng = this.marker!.getPosition();
      if (newLatLng) {
        // Actualizar el formulario con la nueva dirección tras mover el marcador
        this.actualizarFormularioConLatLng(newLatLng);

        // Actualizar también las coordenadas en el formulario
        this.formSOS.controls['latitude'].setValue(newLatLng.lat().toString());
        this.formSOS.controls['longitude'].setValue(newLatLng.lng().toString());
      }
    });
  }

  private cargarAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(
      this.renderer.selectRootElement(this.inputPlaces.nativeElement),
      {
        componentRestrictions: { country: ['CL'] },
        fields: ['address_components', 'geometry', 'place_id'],
        types: ['address'],
      }
    );

    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      const place: any = autocomplete.getPlace();
      if (this.marker) {
        this.marker.setMap(null);
      }

      this.mapa.setCenter(place.geometry.location);
      this.marker = new google.maps.Marker({
        position: place.geometry.location,
        map: this.mapa,
        draggable: true,
      });

      this.llenarFormulario(place); // Asegúrate de que esta llamada es correcta.

      // Asegúrate de que se están llenando las coordenadas correctamente
      this.formSOS.controls['latitude'].setValue(place.geometry.location.lat());
      this.formSOS.controls['longitude'].setValue(place.geometry.location.lng());
    });
  }

  private llenarFormulario(place: any) {
    const addressComponents = place.address_components;
    const address = this.buildAddress(addressComponents);

    console.log('Dirección construida:', address); // Añadir para depuración
    this.formSOS.controls['address'].setValue(address);
  }

  private buildAddress(addressComponents: any): string {
    // Aquí debes crear una lógica para construir la dirección a partir de los componentes.
    // Esto es solo un ejemplo y debe adaptarse a tu estructura de datos.
    let address = '';
    addressComponents.forEach((component: any) => {
      address += `${component.long_name}, `;
    });
    return address.slice(0, -2); // Eliminar la última coma y espacio
  }


  // Este método convierte las coordenadas en una dirección usando el Geocoder de Google Maps
  actualizarFormularioConLatLng(latLng: google.maps.LatLng) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const formattedAddress = results[0].formatted_address;
        console.log('Dirección obtenida por latitud y longitud:', formattedAddress);
        this.formSOS.controls['address'].setValue(formattedAddress);
      } else {
        console.error('Error al obtener la dirección por latitud y longitud:', status);
      }
    });
  }
}
