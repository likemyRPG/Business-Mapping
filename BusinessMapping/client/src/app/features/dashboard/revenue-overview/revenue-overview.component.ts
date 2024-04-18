import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {Customer} from "../../shared/models/Customer";
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import {SharedService} from "../../shared/services/shared.service";

@Component({
  selector: 'app-revenue-overview',
  standalone: true,
  styleUrls: ['./revenue-overview.component.css'],
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './revenue-overview.component.html'
})
export class RevenueOverviewComponent implements OnChanges, AfterViewInit, OnInit {

  @ViewChild('chart') chartContainer: ElementRef | undefined;
  @Input() customers: Customer[] | undefined;

  selectedCustomer: 'all' | Customer | null = null;

  showDropdown = false;

  constructor(private sharedService: SharedService) { }

  ngOnInit() {
    this.sharedService.currentCustomer.subscribe(customer => {
      // @ts-ignore
      this.selectedCustomer = customer;
      this.updateData(); // Method to update data based on selected customer
    });
  }

  updateData() {
    if (this.customers && this.chartContainer) {
      this.createChart();
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
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
    // Clear the existing chart
    if (this.chartContainer) {
      d3.select(this.chartContainer.nativeElement).selectAll('*').remove();
      // Recreate the chart with new dimensions
      this.createChart();
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
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const data = this.customers.map(customer => ({
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

    const tooltip = d3.select(element).append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    svg.selectAll(".bar")
      .on("mouseover", (event, d) => {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`Customer: ${(d as Customer).name} <br> Revenue: €${(d as Customer).revenue.toLocaleString() || 0}`)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })

      .on("mouseout", function () {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  }


  exportGraph(): void {
    // Serialize the SVG element
    const svgElement = this.chartContainer?.nativeElement.querySelector('svg');
    if (svgElement) {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svgElement);

      // Add name spaces.
      const svgBlob = new Blob([source], {type: 'image/svg+xml;charset=utf-8'});
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = 'graph.svg';  // Name of the file to be downloaded
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  }
}
