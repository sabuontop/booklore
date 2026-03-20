import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AIAssistantService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.API_CONFIG.BASE_URL}/api/ai`;

  chat(message: String): Observable<{ response: string }> {
    return this.http.post<{ response: string }>(`${this.apiUrl}/chat`, { message });
  }
}
