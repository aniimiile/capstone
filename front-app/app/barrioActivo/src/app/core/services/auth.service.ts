import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Importamos HttpHeaders
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private neighborhoodBoards: any[] = []; // Para almacenar las juntas de vecinos

  private urlApi = 'https://capstone-api-core.aniuskaojeda.dev';
  private apiKey = '6VWJulK5Hgth_ZKzsmDsRb-YS'; // Apikey

  constructor(private http: HttpClient) { }

  // Método para autenticar usuario
  public login(credentials: { email: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({
      'ApiKey': this.apiKey, // Aquí usamos la clave correcta
      'Content-Type': 'application/json' // Asegúrate de que el Content-Type sea JSON
    });
    return this.http.post<any>(`${this.urlApi}/app/login`, credentials, { headers });
  }

  // Método para la validación facial
  public faceValidation(image1: File, image2: File): Observable<any> {
    const formData = new FormData();
    formData.append('image1', image1); // Cédula de identidad
    formData.append('image2', image2); // Foto de la cara
    const headers = new HttpHeaders({
      'ApiKey': this.apiKey
    });

    return this.http.post<any>(`${this.urlApi}/faceValidation`, formData, { headers });
  }

  // Nuevo método para obtener las juntas de vecinos
  public getNeighborhoodBoards(): Observable<any> {
    const headers = new HttpHeaders({
      'ApiKey': this.apiKey,
      'Content-Type': 'application/json'
    });

    return this.http.get<any>(`${this.urlApi}/app/neighborhoodBoard`, { headers });
  }

  // Método para recuperar las juntas de vecinos y almacenarlas
  public fetchNeighborhoodBoards(): Observable<any[]> {
    return this.getNeighborhoodBoards().pipe(
      tap((data) => {
        this.neighborhoodBoards = data; // Almacena los datos de las juntas de vecinos
      })
    );
  }

  // Método para obtener el nombre de la junta de vecinos
  public getNeighborhoodBoardName(id: number): string | null {
    const board = this.neighborhoodBoards.find(nb => nb.id_neighborhood_board === id);
    return board ? board.name : null; // Devuelve el nombre de la junta o null si no existe
  }

  // Método para registrar usuarios
  public registerUser(userData: any, documentVerification: File): Observable<any> {
    const formData = new FormData();

    // Añadir los datos del formulario
    formData.append('Rut', userData.rut);
    formData.append('First_Name', userData.first_name);
    formData.append('Second_Name', userData.second_name);
    formData.append('First_Surname', userData.first_surname);
    formData.append('Second_Surname', userData.second_surname);
    formData.append('Birthdate', userData.birthdate);
    formData.append('Email', userData.email);
    formData.append('Password', userData.password);
    formData.append('Address', userData.address);
    formData.append('Cellphone', userData.cellphone);
    formData.append('Id_Neighborhood_Board', userData.id_neighborhood_board);

    // Añadir archivo de verificación de domicilio
    formData.append('document_verification', documentVerification);

    const headers = new HttpHeaders({
      'ApiKey': this.apiKey
    });

    return this.http.post<any>(`${this.urlApi}/app/user`, formData, { headers });
  }

  // Método para obtener los datos del usuario autenticado
  public getUserData(email: string): Observable<any> {
    const headers = new HttpHeaders({
      'ApiKey': this.apiKey,
      'Content-Type': 'application/json'
    });

    // Incluimos el email como un parámetro en la URL
    return this.http.get<any>(`${this.urlApi}/app/user?email=${email}`, { headers });
  }

}