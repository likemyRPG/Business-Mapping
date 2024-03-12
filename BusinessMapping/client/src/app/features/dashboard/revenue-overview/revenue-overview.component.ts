import {
  Component,
  ViewChild,
  ElementRef,
  Input,
  AfterViewInit,
  SimpleChanges,
  OnChanges
} from '@angular/core';
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
    const margin = { top: 20, right: 20, bottom: 30, left: 60 };
    const containerWidth = element.offsetWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const x = d3.scaleBand()
      .rangeRound([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .range([height, 0]);

    const svg = d3.select(element).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const data = this.customers.map(customer => ({
      name: customer.name,
      revenue: +customer.revenue
    }));

    x.domain(data.map(d => d.name));

    console.log("Data for chart:", data);
    const maxY = d3.max(data, d => +d.revenue);
    console.log("Max Y value:", maxY);
    y.domain([0, maxY ?? 0]);

    svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.name) as string | number)
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.revenue))
      .attr("height", d => height - y(d.revenue))
      .attr("fill", "steelblue");

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

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
      // @ts-ignore
        tooltip.html(`Revenue: ${d.revenue ?? 0}`)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
    })

      .on("mouseout", function() {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  }
}
