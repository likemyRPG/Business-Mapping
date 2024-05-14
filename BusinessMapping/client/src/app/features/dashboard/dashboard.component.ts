import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RevenueOverviewComponent } from "./revenue-overview/revenue-overview.component";
import { ProjectSuccessRateComponent } from "./project-success-rate/project-success-rate.component";
import { CustomerDetailsCardComponent } from './customer-details-component/customer-details-component';
import { CustomerService } from "../shared/services/customer.service";
import { Customer } from "../shared/models/Customer";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { CustomerVisualizationComponent } from "../customers/customer-visualization-component/customer-visualization-component.component";
import { SectorRatioComponent } from "./sector-ratio/sector-ratio.component";
import { Sector } from "../shared/models/Sector";
import { CustomerSectorRelation } from "../shared/models/CustomerSectorRelation";
import { Project } from "../shared/models/Project";
import { ProjectCustomerRelation } from "../shared/models/ProjectCustomerRelation";
import { FormsModule } from "@angular/forms";
import { SharedService } from "../shared/services/shared.service";
import { NgSelectModule } from "@ng-select/ng-select";
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
    NgSelectModule,
    CustomerDetailsCardComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  customers: Customer[] = [];
  sectors: Sector[] = [];
  projects: Project[] = [];
  CustomerSectorRelationships: CustomerSectorRelation[] = [];
  ProjectCustomerRelations: ProjectCustomerRelation[] = [];
  cards = [
    { title: 'Customer Revenue Overview', isLarge: true },
    { title: 'Customer Info Overview', isLarge: false },
    { title: 'Amount of Customers Per Sector', isLarge: false },
    { title: 'Project Success Rate', isLarge: false },
  ];
  selectedCustomer: Customer | null = null;
  selectedSectors: Sector[] = [];
  customerInput$ = new BehaviorSubject<string>('');
  filteredCustomers$: Observable<any[]> | undefined;

  constructor(
    private customerService: CustomerService,
    private sharedService: SharedService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.filteredCustomers$ = this.customerInput$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => this.searchCustomers(term))
    );

    this.customerService.getAllCustomers().subscribe((data: Customer[]) => {
      this.customers = data;

      // Subscribe to changes in the shared service to update selectedCustomer
      this.sharedService.currentCustomer.subscribe(customer => {
        const foundCustomer = customer ? this.customers.find(c => c.uuid === customer) || null : null;
        this.selectedCustomer = foundCustomer;
        console.log('Selected customer dashboard: ', foundCustomer);
        
        // Manually trigger change detection
        this.cdr.detectChanges();
      });

      // Initial selection setup if needed
      const initialCustomer = this.sharedService.getCurrentCustomer(); // Assuming a method to get initial value
      this.selectedCustomer = initialCustomer ? this.customers.find(c => c.uuid === initialCustomer) || null : null;
      this.cdr.detectChanges();
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
      return of(this.customers);
    }
    return of(this.customers.filter(customer => customer.name.toLowerCase().includes(term.toLowerCase())));
  }

  compareCustomers(c1: Customer, c2: Customer): boolean {
    return c1 && c2 ? c1.uuid === c2.uuid : c1 === c2;
  }
}
