// customers.component.ts
import {Component} from '@angular/core';
import {CommonModule, NgForOf, NgIf} from '@angular/common';
import {CustomerService} from '../services/customer.service'; // Import your service
import {Customer} from '../models/Customer';
import {LoadingComponent} from "../loading/loading.component"; // Import your model

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [NgIf, NgForOf, CommonModule, LoadingComponent],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent {
  customers: Customer[] = [];
  loading = false;

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loading = true;
    this.customerService.getAllCustomers().subscribe((data: Customer[]) => {
      this.customers = data;
      this.loading = false;
    });
  }
}
