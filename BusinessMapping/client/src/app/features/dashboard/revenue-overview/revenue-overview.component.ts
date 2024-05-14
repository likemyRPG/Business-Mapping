import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {Customer} from "../../shared/models/Customer";
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import {SharedService} from "../../shared/services/shared.service";
import {GraphExportService} from "../../shared/services/gaph-export.service";
import {Sector} from "../../shared/models/Sector";
import {CustomerSectorRelation} from "../../shared/models/CustomerSectorRelation";

@Component({
  selector: 'app-revenue-overview',
  standalone: true,
  styleUrls: ['./revenue-overview.component.css'],
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './revenue-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RevenueOverviewComponent implements OnChanges, AfterViewInit, OnInit {

  @ViewChild('chart') chartContainer: ElementRef | undefined;
  @Input() customers: Customer[] | undefined;

  selectedCustomer: 'all' | Customer | null = null;
  selectedSectors: Sector[] = [];
  @Input() relationships!: CustomerSectorRelation[];


  constructor(private sharedService: SharedService, private exportService: GraphExportService) {
  }

  ngOnInit() {
    this.sharedService.currentCustomer.subscribe(customer => {
      // @ts-ignore
      this.selectedCustomer = customer;
      this.updateData(); // Method to update data based on selected customer
    });

    this.sharedService.selectedSectorsSource.subscribe(selectedSectors => {
      this.selectedSectors = selectedSectors;
      this.updateData(); // Method to update data based on selected sectors
    });
  }

  updateData() {
    if (this.customers && this.chartContainer) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customers'] && this.chartContainer) {
      this.createChart();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createChart();
      this.addResizeListener();
    }, 1000);
  }

  addResizeListener(): void {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        this.updateChart(); // Update chart dimensions
      }
    });
    if (this.chartContainer) {
      resizeObserver.observe(this.chartContainer.nativeElement);
    }
  }

  updateChart(): void {
    const currentWidth = this.chartContainer?.nativeElement.offsetWidth;
    // @ts-ignore
    if (this.lastWidth !== currentWidth) {
      // @ts-ignore
      this.lastWidth = currentWidth;
      // @ts-ignore
      d3.select(this.chartContainer.nativeElement).selectAll('*').remove();
      this.createChart();
    }
  }
  

  exportGraph(): void {
    const svgElement = this.chartContainer?.nativeElement.querySelector('svg') as SVGElement;
    if (svgElement) {
      // @ts-ignore
      this.exportService.exportGraph(svgElement, 'revenue-overview.svg');
    }
  }

  createChart(): void {
    if (!this.customers || !this.chartContainer) return;

    const element = this.chartContainer.nativeElement;
    const margin = {top: 20, right: 20, bottom: 100, left: 60};
    const containerWidth = element.offsetWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const x = d3.scaleBand()
      .rangeRound([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .range([height, 0]);

    d3.select(element).selectAll('svg').remove();

    const svg = d3.select(element).append('svg')
      .attr('width', containerWidth)
      .attr('height', 400)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const selectedSectorIds = new Set(this.selectedSectors.map(sector => sector.uuid));

    // Filter customers based on the relationships and selected sectors
    const filteredCustomers = this.selectedSectors.length > 0
      ? this.customers.filter(customer =>
        this.relationships.some(rel =>
          // @ts-ignore
          rel.customerId === customer.uuid && selectedSectorIds.has(rel.sectorId)))
      : this.customers; // Show all customers if no sector is selected

    const data = filteredCustomers.map(customer => ({
      name: customer.name,
      revenue: +customer.revenue,
      id: customer.uuid
    }));


    x.domain(data.map(d => d.name));

    const maxY = d3.max(data, d => +d.revenue);

    y.domain([0, maxY ?? 0]);

    svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.name) as string | number)
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.revenue))
      .attr("height", d => height - y(d.revenue))
      .attr("fill", d => (d as Customer).id === this.selectedCustomer ? '#ccff02' : 'steelblue');  // Highlight selected customer

    const labelFrequency = Math.ceil(data.length / 20);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)")
      // @ts-ignore
      .text((d, i) => i % labelFrequency === 0 ? d : '');

    svg.append("g")
      .call(d3.axisLeft(y));
  }
}
