import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Customer} from "../models/Customer";

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private customerSource = new BehaviorSubject<string>('all');
  currentCustomer = this.customerSource.asObservable();

  constructor() {
  }

  changeCustomer(customer: "all" | Customer | null) {
    // @ts-ignore
    this.customerSource.next(customer);
  }
}
