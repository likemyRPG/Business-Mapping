import { Component } from '@angular/core';
import { CustomerService } from "../shared/services/customer.service";
import { Customer } from "../shared/models/Customer";
import {LoadingComponent} from "../shared/components/loading/loading.component";
import {CommonModule, NgForOf, NgIf} from "@angular/common";
import {
  CustomerVisualizationComponent
} from "./customer-visualization-component/customer-visualization-component.component";

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [NgIf, NgForOf, CommonModule, LoadingComponent, CustomerVisualizationComponent],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent {
  customers: Customer[] = [];

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.customerService.getAllCustomers().subscribe((data: Customer[]) => {
      console.log(data);
      this.customers = data;
    });
  }
}
