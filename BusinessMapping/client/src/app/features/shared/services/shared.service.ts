import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Customer} from "../models/Customer";
import {Sector} from "../models/Sector";

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private customerSource = new BehaviorSubject<Customer | "all" | null>(null);
  selectedSectorsSource = new BehaviorSubject<Sector[]>([]);
  currentCustomer = this.customerSource.asObservable();

  private colorSchemeSource = new BehaviorSubject<string>('schemeSet2');
  colorScheme = this.colorSchemeSource.asObservable();

  constructor() { }

  changeCustomer(customer: "all" | Customer | null) {
    // @ts-ignore
    this.customerSource.next(customer);
  }

  emitSectorSelectionChange(selectedSectors: Sector[]) {
    this.selectedSectorsSource.next(selectedSectors);
    this.changeCustomer('all');
  }

  getCurrentCustomer() {
    return this.customerSource.getValue();
  }

  changeColorScheme(colorScheme: string) {
    this.colorSchemeSource.next(colorScheme);
  }
}
