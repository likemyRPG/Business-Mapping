import {Component} from '@angular/core';
import {RevenueOverviewComponent} from "./revenue-overview/revenue-overview.component";
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
import {FormsModule} from "@angular/forms";
import {SharedService} from "../shared/services/shared.service";
import {NgSelectModule} from "@ng-select/ng-select";
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RevenueOverviewComponent,
    ProjectSuccessRateComponent,
    NgForOf,
    NgClass,
    NgIf,
    CustomerVisualizationComponent,
    SectorRatioComponent,
    FormsModule,
    NgSelectModule
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
    {title: 'Customer Revenue Overview', isLarge: true},
    {title: 'Amount of Customers Per Sector', isLarge: false},
    {title: 'Project Success Rate', isLarge: false},
  ];
  selectedCustomer: 'all' | Customer | null = null;
  customerInput$ = new BehaviorSubject<string>('');
  filteredCustomers$: Observable<any[]> | undefined;

  constructor(private customerService: CustomerService, private sharedService: SharedService) {
  }

  ngOnInit() {
    this.filteredCustomers$ = this.customerInput$.pipe(
      debounceTime(200),  // Wait for 200ms pause in events
      distinctUntilChanged(),  // Ignore if next search term is same as previous
      switchMap(term => this.searchCustomers(term))  // Switch to new search observable each time the term changes
    );


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
      this.ProjectCustomerRelations = data as ProjectCustomerRelation[];
    });
  }

  onChangeCustomer() {
    this.sharedService.changeCustomer(this.selectedCustomer);
  }

  searchCustomers(term: string): Observable<any[]> {
    if (term === '') {
      return of(this.customers);  // Use 'of' to return an Observable
    }
    return of(this.customers.filter(customer => customer.name.toLowerCase().includes(term.toLowerCase())));
  }

}
