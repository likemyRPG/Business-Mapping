import {Component, ViewChild, ElementRef, Input, AfterViewInit, SimpleChanges, OnChanges} from '@angular/core';
import * as d3 from 'd3';
import {Customer} from "../../shared/models/Customer";

@Component({
  selector: 'app-revenue-overview',
  standalone: true,
  styleUrls: ['./revenue-overview.component.css'],
  templateUrl: './revenue-overview.component.html'
})
export class RevenueOverviewComponent implements OnChanges, AfterViewInit {

  @ViewChild('chart') chartContainer: ElementRef | undefined;
  @Input() customers: Customer[] | undefined;

  constructor() {
    console.log('RevenueOverviewComponent');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customers'] && this.chartContainer) {
      this.createChart();
    }
  }

  ngAfterViewInit(): void {
    // Initial chart creation might be needed here as well, but it depends on when the data is available.
    // If customers data is set after view initialization, this initial call might not be necessary.
    // this.createChart();
  }

  createChart(): void {
    if (!this.customers || !this.chartContainer) return;

    const element = this.chartContainer?.nativeElement;
    const data = this.customers.map(customer => ({
      name: customer.name,
      revenue: customer.revenue
    }));

    const svg = d3.select(element).append('svg')
      .attr('width', 400)
      .attr('height', 300);

    svg.selectAll("bar")
      .data(data)
      .enter().append("rect")
      .style("fill", "steelblue")
      .attr("x", (d, i) => i * 40)
      .attr("width", 35)
      .attr("y", d => 300 - d.revenue / 1000) // Scale revenue for display
      .attr("height", d => d.revenue / 1000);

    svg.selectAll("text")
      .data(data)
      .enter().append("text")
      .attr("x", (d, i) => i * 40)
      .attr("y", d => 300 - d.revenue / 1000 - 3) // Scale revenue for display
      .text(d => d.revenue);

    svg.selectAll("text.name")
      .data(data)
      .enter().append("text")
      .attr("x", (d, i) => i * 40)
      .attr("y", 300)
      .text(d => d.name);
  }
}
