import {Component} from '@angular/core';
import {RevenueOverviewComponent} from "./revenue-overview/revenue-overview.component";
import {SectorDistributionComponent} from "./sector-distribution/sector-distribution.component";
import {ProjectSuccessRateComponent} from "./project-success-rate/project-success-rate.component";
import {CustomerService} from "../shared/services/customer.service";
import {Customer} from "../shared/models/Customer";
import {NgClass, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RevenueOverviewComponent,
    SectorDistributionComponent,
    ProjectSuccessRateComponent,
    NgForOf,
    NgClass,
    NgIf
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  customers: Customer[] = [];
  cards = [
    { title: 'Revenue Overview', isLarge: true },
    { title: 'Another Chart', isLarge: true },
    { title: 'More Data', isLarge: false },
  ];

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.customerService.getAllCustomers().subscribe((data: Customer[]) => {
      console.log(data);
      this.customers = data;
    });
  }
}
