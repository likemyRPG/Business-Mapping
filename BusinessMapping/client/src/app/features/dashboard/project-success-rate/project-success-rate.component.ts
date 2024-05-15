import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Project } from "../../shared/models/Project";
import { ProjectCustomerRelation } from "../../shared/models/ProjectCustomerRelation";
import { Customer } from "../../shared/models/Customer";
import { FormsModule } from "@angular/forms";
import { NgForOf } from "@angular/common";
import * as d3 from 'd3';
import { SharedService } from "../../shared/services/shared.service";
import { GraphExportService } from "../../shared/services/gaph-export.service";
import { CustomerSectorRelation } from "../../shared/models/CustomerSectorRelation";
import { Sector } from "../../shared/models/Sector";

@Component({
  selector: 'app-project-success-rate',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf
  ],
  templateUrl: './project-success-rate.component.html',
  styleUrls: ['./project-success-rate.component.css']
})
export class ProjectSuccessRateComponent implements OnChanges, AfterViewInit, OnInit {
  @Input() customers!: Customer[];
  @Input() projectCustomerRelations!: ProjectCustomerRelation[];
  @Input() projects!: Project[];
  @Input() customerSectorRelations!: CustomerSectorRelation[];
  selectedCustomer: 'all' | Customer | null = null;

  @ViewChild('projectSuccessRateContainer', { static: true }) projectSuccessRateContainer!: ElementRef;
  private selectedSectors: Sector[] = [];

  constructor(private sharedService: SharedService, private exportService: GraphExportService) { }

  ngOnInit() {
    this.sharedService.currentCustomer.subscribe(customer => {
      this.selectedCustomer = customer;
      this.updateData();
    });

    this.sharedService.selectedSectorsSource.subscribe(selectedSectors => {
      this.selectedSectors = selectedSectors;
      this.updateData();
    });
  }

  updateData() {
    this.createProjectSuccessRate();
  }

  ngAfterViewInit(): void {
    if (this.projects && this.customers && this.projectCustomerRelations && this.projectSuccessRateContainer) {
      this.createProjectSuccessRate();
      this.addResizeListener();
    }
  }

  addResizeListener(): void {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        this.createProjectSuccessRate();
      }
    });
    if (this.projectSuccessRateContainer) {
      resizeObserver.observe(this.projectSuccessRateContainer.nativeElement);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.projects && this.customers && this.projectCustomerRelations && this.projectSuccessRateContainer) {
      this.createProjectSuccessRate();
    }
  }

  exportGraph(): void {
    const svgElement = this.projectSuccessRateContainer.nativeElement.querySelector('svg') as SVGElement;
    if (svgElement) {
      this.exportService.exportGraph(svgElement, 'project-success-rate.svg');
    }
  }

  protected createProjectSuccessRate(): void {
    if (!this.projectSuccessRateContainer) {
      return;
    }
    const element = this.projectSuccessRateContainer.nativeElement;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const containerWidth = element.offsetWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;

    d3.select(this.projectSuccessRateContainer.nativeElement).select("svg").remove();

    const svg = d3.select(this.projectSuccessRateContainer.nativeElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const color = d3.scaleOrdinal(["#4CAF50", "#F44336"]);

    const arc = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(radius - 70);

    const pie = d3.pie()
      .sort(null)
      .value((d: any) => d.value);

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const successData = this.processData(this.selectedCustomer);

    if (successData.length === 0) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("No projects to display");
      return;
    }

    const arcs = g.selectAll(".arc")
    // @ts-ignore
      .data(pie(successData))
      .enter().append("g")
      .attr("class", "arc");

    arcs.append("path")
    // @ts-ignore
      .attr("d", arc)
      .style("fill", d => color((d as any).data.type));

    arcs.append("text")
      .filter(d => (d as any).data.value > 0) // Hide text if the value is 0
      .attr("transform", d => `translate(${arc.centroid((d as any))})`)
      .attr("dy", "0.35em")
      .style("text-anchor", "middle")
      // Dsiplay the percentage of success/failure (When 0, don't display the percentage)
      .text(d => `${(d as any).data.value}%`);

    const legend = svg.selectAll(".legend")
      .data(successData)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
      .attr("x", 0)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", d => color(d.type));

    legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(d => d.type);

    svg.attr('width', width).attr('height', height);
  }

  private processData(selectedCustomer: "all" | Customer | null) {
    let filteredProjects = this.projects;

    if (this.selectedSectors.length > 0) {
      const selectedSectorIds = new Set(this.selectedSectors.map(sector => sector.uuid));
      const customerIdsFromSelectedSectors = new Set(
        this.customerSectorRelations
          // @ts-ignore
          .filter(csr => selectedSectorIds.has(csr.sectorId))
          .map(csr => csr.customerId)
      );

      const projectIdsForSelectedCustomers = new Set(
        this.projectCustomerRelations
          .filter(pcr => customerIdsFromSelectedSectors.has(pcr.customerId))
          .map(pcr => pcr.projectId)
      );
      // @ts-ignore
      filteredProjects = this.projects.filter(p => projectIdsForSelectedCustomers.has(p.uuid));
    }

    if (selectedCustomer && selectedCustomer !== 'all') {
      const customerProjects = new Set(
        this.projectCustomerRelations
          // @ts-ignore
          .filter(r => r.customerId === selectedCustomer)
          .map(r => r.projectId)
      );
      // @ts-ignore
      filteredProjects = filteredProjects.filter(p => customerProjects.has(p.uuid));
    }

    const successCount = filteredProjects.filter(p => p.success && p.onTime && p.actualCost <= p.budget).length;
    const noSuccessCount = filteredProjects.length - successCount;

    const successRate = ((successCount / filteredProjects.length) * 100).toFixed(2);
    const failureRate = ((noSuccessCount / filteredProjects.length) * 100).toFixed(2);

    if (filteredProjects.length === 0) {
      return [];
    }

    return [
      { type: 'Success', value: successRate },
      { type: 'Failed', value: failureRate }
    ];
  }
}
