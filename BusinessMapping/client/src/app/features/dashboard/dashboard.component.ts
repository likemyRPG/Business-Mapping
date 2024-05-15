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
import { GraphExportService } from '../shared/services/gaph-export.service';

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
    { title: 'Project Success Rate', isLarge: false },
    { title: 'Amount of Customers Per Sector', isLarge: true },
  ];
  selectedCustomer: Customer | null = null;
  selectedSectors: Sector[] = [];
  customerInput$ = new BehaviorSubject<string>('');
  sectorInput$ = new BehaviorSubject<string>('');
  filteredCustomers$: Observable<any[]> | undefined;
  filteredSectors$: Observable<any[]> | undefined;
  convertedSectorIdsToObjects: Sector[] = [];
  selectedColorScheme: string = 'schemeCategory10'; // Default color scheme

  colorSchemes = [
    { label: 'Category 10', scheme: 'schemeCategory10' },
    { label: 'Accent', scheme: 'schemeAccent' },
    { label: 'Dark 2', scheme: 'schemeDark2' },
    { label: 'Set 1', scheme: 'schemeSet1' },
    { label: 'Set 2', scheme: 'schemeSet2' },
    { label: 'Set 3', scheme: 'schemeSet3' },
    { label: 'Paired', scheme: 'schemePaired' },
    { label: 'Pastel 1', scheme: 'schemePastel1' },
    { label: 'Pastel 2', scheme: 'schemePastel2' },
    { label: 'Tableau 10', scheme: 'schemeTableau10' },
  ];

  constructor(
    private customerService: CustomerService,
    private sharedService: SharedService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private graphExportService: GraphExportService
  ) {}

  ngOnInit() {
    this.filteredCustomers$ = this.customerInput$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => this.searchCustomers(term))
    );

    this.filteredSectors$ = this.sectorInput$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => this.searchSectors(term))
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
      console.log('Selected sectors:', this.selectedSectors);
    });
  }

  onChangeCustomer() {
    this.sharedService.changeCustomer(this.selectedCustomer);
    this.cdr.detectChanges();
  }

  onChangeSector() {
    // @ts-ignore
    this.convertedSectorIdsToObjects = this.selectedSectors.map(sectorId => this.sectors.find(sector => sector.uuid === sectorId));
    this.sharedService.selectedSectorsSource.next(this.convertedSectorIdsToObjects);
    this.filterCustomersBySectors();
    this.cdr.detectChanges();
  }

  onColorSchemeChange() {
    // @ts-ignore
    this.sharedService.changeColorScheme(this.selectedColorScheme);
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
    this.customerInput$.next(this.customerInput$.getValue());
  }

  searchCustomers(term: string): Observable<any[]> {
    if (term === '') {
      return of(this.filteredCustomers);
    }
    return of(this.filteredCustomers.filter(customer => customer.name.toLowerCase().includes(term.toLowerCase())));
  }

  searchSectors(term: string): Observable<any[]> {
    if (term === '') {
      return of(this.sectors);
    }
    return of(this.sectors.filter(sector => sector.name.toLowerCase().includes(term.toLowerCase())));
  }

  compareCustomers(c1: Customer, c2: Customer): boolean {
    return c1 && c2 ? c1.uuid === c2.uuid : c1 === c2;
  }

  compareSectors(s1: Sector, s2: Sector): boolean {
    return s1 && s2 ? s1.uuid === s2.uuid : s1 === s2;
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
    // @ts-ignore
    this.convertedSectorIdsToObjects = this.selectedSectors.map(sectorId => this.sectors.find(sector => sector.uuid === sectorId));
    this.sharedService.selectedSectorsSource.next(this.convertedSectorIdsToObjects);
    this.filterCustomersBySectors();
  }

  generateId(title: string): string {
    return title.replace(/\s+/g, '-').toLowerCase();
  }

  async generatePDF() {
    const doc = new jsPDF();
    let y = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add title
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Report', pageWidth / 2, y, { align: 'center' });
    y += 20;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100);

    doc.text('Customer Details:', margin, y);
    y += 10;
    // Add summary text
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    if (this.selectedCustomer) {
      doc.text(`Customer: ${this.selectedCustomer.name}`, margin, y);
      y += 10;
      if (this.selectedCustomer.location) {
        doc.text(`Location: ${this.selectedCustomer.location}`, margin, y);
        y += 10;
      }
      if (this.selectedCustomer.industry) {
        doc.text(`Industry: ${this.selectedCustomer.industry}`, margin, y);
        y += 10;
      }
      if (this.selectedCustomer.numberOfEmployees) {
        doc.text(`Number of Employees: ${this.selectedCustomer.numberOfEmployees}`, margin, y);
        y += 10;
      }
      if (this.selectedCustomer.revenue) {
        doc.text(`Revenue: €${this.selectedCustomer.revenue}`, margin, y);
        y += 10;
      }
    }

    if (this.selectedSectors.length > 0) {
      doc.text('Sectors:', margin, y);
      y += 10;
      this.selectedSectors.forEach(sector => {
        doc.text(`- ${sector.name}`, margin + 10, y);
        y += 10;
      });
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100);
    // Add additional customer-related information
    y += 10;
    doc.text('Visual Representation:', margin, y);
    y += 10;

    // Add a line break between the summary and the graphs
    y += 10;

    // Add SVGs to PDF
    for (let card of this.cards) {
      // Skip "Project Success Rate" card if there are no projects
      if (card.title === 'Project Success Rate' && this.projects.length === 0) {
        continue;
      }

      const elementId = this.generateId(card.title);
      const element = document.getElementById(elementId);
      if (element) {
        const svgElement = element.querySelector('svg');
        if (svgElement) {
          const imgData = await this.graphExportService.exportGraphToImage(svgElement);
          const imgProps = doc.getImageProperties(imgData.src);

          // Reduce the size of the image by increasing the scaling factor
          let imgWidth = imgProps.width / 8;
          let imgHeight = imgProps.height / 8;

          if (imgWidth > pageWidth - 2 * margin) {
            imgWidth = pageWidth - 2 * margin;
            imgHeight = (imgProps.height * imgWidth) / imgProps.width;
          }

          if (y + imgHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }

          const x = (pageWidth - imgWidth) / 2; // Center the image horizontally
          doc.addImage(imgData.src, 'PNG', x, y, imgWidth, imgHeight);
          y += imgHeight + margin;
        }
      }
    }

    const reportName = `Customer_Report_${this.selectedCustomer ? this.selectedCustomer.name : 'All_Customers'}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(reportName);
  }
}
