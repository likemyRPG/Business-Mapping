import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Customer} from "../models/Customer";
import {Sector} from "../models/Sector";
import {CustomerSectorRelation} from "../models/CustomerSectorRelation";

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'http://localhost:8080/api'; // URL to web API

  constructor(private http: HttpClient) {
  }

  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl + '/customers');
  }

  getAllSectors(): Observable<Sector[]> {
    return this.http.get<Sector[]>(this.apiUrl + '/sectors');
  }

  getAllCustomerSectorRelations(): Observable<CustomerSectorRelation[]> {
    return this.http.get<CustomerSectorRelation[]>(this.apiUrl + '/graphs/customers-sectors');
  }

}
