import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  private baseUrl = 'http://localhost:8080/api'; // Replace with your actual backend URL

  constructor(private http: HttpClient) { }

  // Example methods for CRUD operations
  getAllCustomers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/customers`);
  }

  // Add methods for getting sectors, projects, creating, updating, deleting, etc.
}
