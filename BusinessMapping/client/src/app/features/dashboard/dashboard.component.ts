import {Component} from '@angular/core';
import {RevenueOverviewComponent} from "./revenue-overview/revenue-overview.component";
import {SectorDistributionComponent} from "./sector-distribution/sector-distribution.component";
import {ProjectSuccessRateComponent} from "./project-success-rate/project-success-rate.component";
import {CustomerService} from "../shared/services/customer.service";
import {Customer} from "../shared/models/Customer";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {
  CustomerVisualizationComponent
} from "../customers/customer-visualization-component/customer-visualization-component.component";
import {SectorRatioComponent} from "./sector-ratio/sector-ratio.component";
import {Sector} from "../shared/models/Sector";
import {CustomerSectorRelation} from "../shared/models/CustomerSectorRelation";
import {Project} from "../shared/models/Project";
import {ProjectCustomerRelation} from "../shared/models/ProjectCustomerRelation";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RevenueOverviewComponent,
    SectorDistributionComponent,
    ProjectSuccessRateComponent,
    NgForOf,
    NgClass,
    NgIf,
    CustomerVisualizationComponent,
    SectorRatioComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  customers: Customer[] = [];
  sectors: Sector[] = [];
  projects: Project[] = [];
  CustomerSectorRelationships: CustomerSectorRelation[] = [];
  ProjectCustomerRelations: ProjectCustomerRelation[] = [];
  cards = [
    // {title: 'Customer Revenue Overview', isLarge: true},
    // {title: 'Amount of Customers Per Sector', isLarge: false},
    {title: 'Project Success Rate', isLarge: true},
  ];

  constructor(private customerService: CustomerService) {
  }

  ngOnInit() {
    this.customerService.getAllCustomers().subscribe((data: Customer[]) => {
      this.customers = data;
    });

    this.customerService.getAllSectors().subscribe((data: Sector[]) => {
      this.sectors = data;
    });

    this.customerService.getAllCustomerSectorRelations().subscribe((data: CustomerSectorRelation[]) => {
      this.CustomerSectorRelationships = data;
    });

    this.customerService.getAllProjects().subscribe((data: Object) => {
      this.projects = data as Project[];
    });

    this.customerService.getAllProjectCustomerRelations().subscribe((data: Object) => {
      console.log(data);
      this.ProjectCustomerRelations = data as ProjectCustomerRelation[];
    });
  }
}
