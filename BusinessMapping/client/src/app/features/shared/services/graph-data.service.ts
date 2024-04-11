import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GraphDataService {
  private baseUrl = 'http://localhost:8080/api'; // Replace with your actual backend URL

  constructor(private http: HttpClient) {
  }

  // Example method to get graph data
  getGraphData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/graph-data`);
  }
}
