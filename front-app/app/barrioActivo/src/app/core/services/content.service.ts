import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Importamos HttpHeaders
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  private urlApi = 'https://capstone-api-core.aniuskaojeda.dev';
  private apiKey = '6VWJulK5Hgth_ZKzsmDsRb-YS';

  constructor(private http: HttpClient) { }

  // Método para enviar datos de emergencia a la API
  public sendEmergencyData(emergencyData: any): Observable<any> {
    const headers = new HttpHeaders({
      'ApiKey': this.apiKey,
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(`${this.urlApi}/app/emergency`, emergencyData, { headers });
  }

  public getEmergencyCategory(idNeighborhoodBoard: number): Observable<any> {
    const headers = new HttpHeaders({
      'ApiKey': this.apiKey,
      'Content-Type': 'application/json'
    });
    return this.http.get<any>(`${this.urlApi}/app/emergency/category?id_neighborhood_board=${idNeighborhoodBoard}`, { headers });
  }

  // Método para enviar datos de emergencia a la API
  // public sendReporteData(reporteData: any): Observable<any> {
  //   const headers = new HttpHeaders({
  //     'ApiKey': this.apiKey,
  //     'Content-Type': 'application/json'
  //   });
  //   return this.http.post<any>(`${this.urlApi}/app/report`, reporteData, { headers });
  // }

  public sendReporteData(reporteData: any): Observable<any> {
    const formData = new FormData();
    formData.append('id_neighborhood_board', reporteData.id_neighborhood_board);
    formData.append('rut', reporteData.rut);
    formData.append('title', reporteData.title);
    formData.append('description', reporteData.description);
    formData.append('image', reporteData.image); // Aquí envías la imagen como archivo

    const headers = new HttpHeaders({
      'ApiKey': this.apiKey,
      // Nota: No establezcas 'Content-Type' manualmente, ya que el navegador lo manejará automáticamente para `FormData`
    });

    return this.http.post<any>(`${this.urlApi}/app/report`, formData, { headers });
  }

}
