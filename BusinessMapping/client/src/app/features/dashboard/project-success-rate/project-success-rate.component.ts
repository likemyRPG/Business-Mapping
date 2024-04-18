// @ts-nocheck

import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Project} from "../../shared/models/Project";
import {ProjectCustomerRelation} from "../../shared/models/ProjectCustomerRelation";
import {Customer} from "../../shared/models/Customer";
import {FormsModule} from "@angular/forms";
import {NgForOf} from "@angular/common";
import * as d3 from 'd3';
import {SharedService} from "../../shared/services/shared.service";

@Component({
  selector: 'app-project-success-rate',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf
  ],
  templateUrl: './project-success-rate.component.html',
  styleUrl: './project-success-rate.component.css'
})
export class ProjectSuccessRateComponent implements OnChanges, AfterViewInit, OnInit {
  @Input() customers!: Customer[];
  @Input() relationships!: ProjectCustomerRelation[];
  @Input() projects!: Project[];

  @ViewChild('projectSuccessRateContainer', { static: true }) projectSuccessRateContainer!: ElementRef;
  selectedCustomer: 'all' | Customer | null = null;

  constructor(private sharedService: SharedService) {

  }

  ngOnInit() {
    this.sharedService.currentCustomer.subscribe(customer => {
      this.selectedCustomer = customer;
      this.updateData(); // Method to update data based on selected customer
    });
  }

  updateData() {
    if (this.projects && this.customers && this.relationships && this.projectSuccessRateContainer) {
      this.createProjectSuccessRate();
    }
  }

  ngAfterViewInit(): void {
    // Wait for data to be available
    if (this.projects && this.customers && this.relationships && this.projectSuccessRateContainer) {
      this.createProjectSuccessRate();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Data changes detected:', changes);
    if (this.projects && this.customers && this.relationships && this.projectSuccessRateContainer) {
      this.createProjectSuccessRate();
    }
  }

  onChangeCustomer(customer: string) {
    this.sharedService.changeCustomer(customer);
  }

  protected createProjectSuccessRate(): void {
    const element = this.projectSuccessRateContainer.nativeElement;
    const width = element.offsetWidth || 400;
    const height = window.innerHeight * 0.5;
    const radius = Math.min(width, height) / 2;

    // Clear previous SVG to prevent duplication
    d3.select(this.projectSuccessRateContainer.nativeElement).select("svg").remove();

    const svg = d3.select(this.projectSuccessRateContainer.nativeElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      // .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal(["#4CAF50", "#F44336"]); // Green for success, Red for no success

    const arc = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(radius - 70);

    const pie = d3.pie()
      .sort(null)
      .value((d: any) => d.value);

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const successData = this.processData(this.selectedCustomer);

    console.log('Success data:', successData);

    // Handle no data scenario
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
      .data(pie(successData))
      .enter().append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .style("fill", d => color(d.data.type));

    // Add text labels
    arcs.append("text")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("dy", "0.35em")
      .style("text-anchor", "middle")
      .text(d => `${d.data.type}: ${d.data.value}%`);

    // Add a simple legend
    const legend = svg.selectAll(".legend")
      .data(successData)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", d => color(d.type));

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(d => d.type);

    svg.attr('width', width).attr('height', height);
  }

  private processData(selectedCustomer: string) {
    let filteredProjects = this.projects;

    if (selectedCustomer && selectedCustomer !== 'all') {
      const customerProjects = this.relationships.filter(r => r.customerId === selectedCustomer).map(r => r.projectId);
      filteredProjects = this.projects.filter(p => customerProjects.includes(p.uuid));
    }

    const successCount = filteredProjects.filter(p => p.success).length;
    const noSuccessCount = filteredProjects.length - successCount;

    if (filteredProjects.length === 0) {
      return [];
    }

    return [
      { type: 'Success', value: ((successCount / filteredProjects.length) * 100).toFixed(2) },
      { type: 'Failed', value: ((noSuccessCount / filteredProjects.length) * 100).toFixed(2) }
    ];
  }
}
