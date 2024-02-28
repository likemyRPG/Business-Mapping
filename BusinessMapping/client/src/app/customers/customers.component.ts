// customers.component.ts
import { Component } from '@angular/core';
import { NgIf, NgForOf, CommonModule } from '@angular/common';
import { CustomerService } from '../services/customer.service'; // Import your service
import { Customer } from '../models/Customer'; // Import your model

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [NgIf, NgForOf, CommonModule],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent {
  customers: Customer[] = [];

  constructor(private customerService: CustomerService) {
    this.fetchCustomers();
  }

  fetchCustomers() {
    // Replace with the actual call to the service
    this.customerService.getAllCustomers().subscribe((data: Customer[]) => {
      console.log(data);
      this.customers = data;
    });
  }
}
