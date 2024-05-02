import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Customer} from "../models/Customer";
import {Sector} from "../models/Sector";

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private customerSource = new BehaviorSubject<string>('all');
  selectedSectorsSource = new BehaviorSubject<Sector[]>([]);
  currentCustomer = this.customerSource.asObservable();


  constructor() {
  }

  changeCustomer(customer: "all" | Customer | null) {
    // @ts-ignore
    this.customerSource.next(customer);
  }

  emitSectorSelectionChange(selectedSectors: Sector[]) {
    this.selectedSectorsSource.next(selectedSectors);
  }
}
