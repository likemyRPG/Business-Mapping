import {Component} from '@angular/core';
import {CustomerService} from "../shared/services/customer.service";
import {Customer} from "../shared/models/Customer";
import {LoadingComponent} from "../shared/components/loading/loading.component";
import {CommonModule, NgForOf, NgIf} from "@angular/common";
import {
  CustomerVisualizationComponent
} from "./customer-visualization-component/customer-visualization-component.component";
import {Sector} from "../shared/models/Sector";
import {Project} from "../shared/models/Project";
import {CustomerSectorRelation} from "../shared/models/CustomerSectorRelation";
import {ProjectCustomerRelation} from "../shared/models/ProjectCustomerRelation";

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [NgIf, NgForOf, CommonModule, LoadingComponent, CustomerVisualizationComponent],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent {
  customers: Customer[] = [];
  sectors: Sector[] = [];
  projects: Project[] = [];
  customerSectorRelations: CustomerSectorRelation[] = [];
  projectCustomerRelations: ProjectCustomerRelation[] = [];


  constructor(private customerService: CustomerService) {
  }

  ngOnInit() {
    this.customerService.getAllCustomers().subscribe((data: Customer[]) => {
      this.customers = data;
    });

    this.customerService.getAllSectors().subscribe((data: Sector[]) => {
      this.sectors = data;
    });

    this.customerService.getAllProjects().subscribe((data: Object) => {
      this.projects = data as Project[];
    });

    this.customerService.getAllCustomerSectorRelations().subscribe((data: CustomerSectorRelation[]) => {
      this.customerSectorRelations = data;
    });

    this.customerService.getAllProjectCustomerRelations().subscribe((data: Object) => {
      this.projectCustomerRelations = data as ProjectCustomerRelation[];
    });
  }
}
