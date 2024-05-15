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
  @Input() colorScheme: string = 'schemeSet2';

  private tooltipVisible: boolean = true;

  constructor(private sharedService: SharedService, private exportService: GraphExportService) {}

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

    this.sharedService.colorScheme.subscribe(scheme => {
      this.colorScheme = scheme;
      this.updateData(); // Update the chart with the new color scheme
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
      id: customer.uuid,
      uuid: customer.uuid
    }));


    x.domain(data.map(d => d.name));

    const maxY = d3.max(data, d => +d.revenue);

    y.domain([0, maxY ?? 0]);

    // @ts-ignore
    const color = d3.scaleOrdinal(d3[this.colorScheme]);

    // Remove previous tooltip to prevent duplication
    d3.select(element).selectAll('.tooltip').remove();

    const tooltip = d3.select(element).append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', '#f9f9f9')
    .style('border', '1px solid #d3d3d3')
    .style('padding', '10px')
    .style('border-radius', '5px')
    .style('text-align', 'center')
    .style('font-size', '12px')
    .style('pointer-events', 'none'); // Prevents the tooltip from blocking mouse events

    svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.name) as string | number)
    .attr("width", x.bandwidth())
    .attr("y", d => y(d.revenue))
    .attr("height", d => height - y(d.revenue))
    // @ts-ignore
    .attr("fill", d => d.id === this.selectedCustomer ? '#ccff02' : color(d.name))
    .attr("stroke", d => d.id === this.selectedCustomer ? 'black' : 'none')  // Add black border to highlighted bars
    .attr("stroke-width", d => d.id === this.selectedCustomer ? 2 : 0)  // Increase stroke width for visibility
    .style("cursor", "pointer")
    .on('mouseover', (event, d) => {
      if (this.tooltipVisible) {
        tooltip.html(`<strong>${d.name}</strong><br>Revenue: €${d.revenue}<br><em>Click to view more</em>`)
          .style('visibility', 'visible');
      }
    })
    .on('mousemove', (event) => {
      if (this.tooltipVisible) {
        tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px');
      }
    })
    .on('mouseout', () => {
      tooltip.style('visibility', 'hidden');
    })
    .on('click', (event, d) => {
      this.onCustomerClick(d as Customer);
      this.tooltipVisible = false;
      tooltip.style('visibility', 'hidden'); // Hide tooltip on click

      // Re-enable tooltip visibility after a short delay to avoid immediate re-trigger
      setTimeout(() => {
        this.tooltipVisible = true;
      }, 300);
    });
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

  onCustomerClick(customer: Customer): void {
    // @ts-ignore
    if (this.selectedCustomer === customer.uuid) {
      this.sharedService.changeCustomer('all');
    }
    else {
      // @ts-ignore
      this.sharedService.changeCustomer(customer.uuid);
    }
  }
}
