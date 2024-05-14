import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, NgClass, NgForOf, NgIf } from '@angular/common';
import { RevenueOverviewComponent } from "./revenue-overview/revenue-overview.component";
import { ProjectSuccessRateComponent } from "./project-success-rate/project-success-rate.component";
import { CustomerDetailsCardComponent } from './customer-details-component/customer-details-component';
import { CustomerService } from "../shared/services/customer.service";
import { Customer } from "../shared/models/Customer";
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
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
  filteredCustomers: Customer[] = [];
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
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.filteredCustomers$ = this.customerInput$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => this.searchCustomers(term))
    );

    this.customerService.getAllCustomers().subscribe((data: Customer[]) => {
      this.customers = data;
      this.filteredCustomers = data;

      // Subscribe to changes in the shared service to update selectedCustomer
      this.sharedService.currentCustomer.subscribe(customer => {
        this.ngZone.run(() => {
          const foundCustomer = customer ? this.customers.find(c => c.uuid === customer) || null : null;
          this.selectedCustomer = foundCustomer;
          this.cdr.detectChanges();
        });
      });

      // Initial selection setup if needed
      const initialCustomer = this.sharedService.getCurrentCustomer(); // Assuming a method to get initial value
      this.ngZone.run(() => {
        this.selectedCustomer = initialCustomer ? this.customers.find(c => c.uuid === initialCustomer) || null : null;
        this.cdr.detectChanges();
      });
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

    // Listen for sector changes
    this.sharedService.selectedSectorsSource.subscribe(selectedSectors => {
      this.selectedSectors = selectedSectors;
      this.filterCustomersBySectors();
    });
  }

  onChangeCustomer() {
    this.sharedService.changeCustomer(this.selectedCustomer);
    // Manually trigger change detection
    this.cdr.detectChanges();
  }

  filterCustomersBySectors() {
    if (this.selectedSectors.length === 0) {
      this.filteredCustomers = this.customers;
    } else {
      const selectedSectorIds = new Set(this.selectedSectors.map(sector => sector.uuid));
      this.filteredCustomers = this.customers.filter(customer => 
        this.CustomerSectorRelationships.some(rel => 
          // @ts-ignore
          rel.customerId === customer.uuid && selectedSectorIds.has(rel.sectorId)
        )
      );
    }
    this.customerInput$.next(this.customerInput$.getValue()); // Trigger the searchCustomers function
  }

  searchCustomers(term: string): Observable<any[]> {
    if (term === '') {
      return of(this.filteredCustomers);
    }
    return of(this.filteredCustomers.filter(customer => customer.name.toLowerCase().includes(term.toLowerCase())));
  }

  compareCustomers(c1: Customer, c2: Customer): boolean {
    return c1 && c2 ? c1.uuid === c2.uuid : c1 === c2;
  }

  resetSelections() {
    this.selectedCustomer = null;
    this.selectedSectors = [];
    this.sharedService.changeCustomer(null);
    this.sharedService.selectedSectorsSource.next([]);
    this.cdr.detectChanges();
  }

  removeSector(sector: Sector) {
    this.selectedSectors = this.selectedSectors.filter(s => s.uuid !== sector.uuid);
    this.sharedService.selectedSectorsSource.next(this.selectedSectors);
    this.filterCustomersBySectors();
  }

  generateId(title: string): string {
    return title.replace(/\s+/g, '-').toLowerCase();
  }

  async generatePDF() {
    const doc = new jsPDF();
    let y = 10;
    const margin = 10;

    if (this.selectedCustomer) {
      doc.text(`Customer: ${this.selectedCustomer.name}`, margin, y);
      y += 10;
    }

    if (this.selectedSectors.length > 0) {
      doc.text('Sectors:', margin, y);
      y += 10;
      this.selectedSectors.forEach(sector => {
        doc.text(`- ${sector.name}`, margin, y);
        y += 10;
      });
    }

    // Add SVGs to PDF
    for (let card of this.cards) {
      const element = document.getElementById(this.generateId(card.title));
      if (element) {
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL('image/png');
        if (y + canvas.height / 3 > doc.internal.pageSize.height - margin) {
          doc.addPage();
          y = margin;
        }
        doc.addImage(imgData, 'PNG', margin, y, canvas.width / 3, canvas.height / 3);
        y += canvas.height / 3 + margin;
      }
    }

    const reportName = `Customer_Report_${this.selectedCustomer ? this.selectedCustomer.name : 'All_Customers'}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(reportName);
  }
}
