import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {Customer} from "../../shared/models/Customer";
import {CustomerSectorRelation} from "../../shared/models/CustomerSectorRelation";
import {Sector} from "../../shared/models/Sector";
import * as d3 from 'd3';
import {NgIf} from "@angular/common";
import {SimulationNodeDatum} from "d3";

@Component({
  selector: 'app-customer-visualization-component',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './customer-visualization-component.component.html',
  styleUrl: './customer-visualization-component.component.css'
})
export class CustomerVisualizationComponent implements OnChanges, AfterViewInit {
  @ViewChild('chart') chartContainer: ElementRef | undefined;
  @Input() customers: Customer[] | undefined;
  @Input() relationships: CustomerSectorRelation[] | undefined;
  @Input() sectors: Sector[] | undefined;
  selectedCustomer: Customer | null = null;
  constructor(private changeDetectorRef: ChangeDetectorRef) {}

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

  private dragStarted(event: d3.D3DragEvent<SVGCircleElement, any, any>, d: any) {
    d3.select(event.sourceEvent.target).raise().classed("active", true);
  }

  private dragged(event: d3.D3DragEvent<SVGCircleElement, any, any>, d: any) {
    d3.select(event.sourceEvent.target)
      .attr("cx", d.x = event.x)
      .attr("cy", d.y = event.y);
  }

  private dragEnded(event: d3.D3DragEvent<SVGCircleElement, any, any>, d: any) {
    d3.select(event.sourceEvent.target).classed("active", false);
  }

  createChart(): void {
    if (!this.customers || !this.sectors || !this.chartContainer || !this.relationships) return;

    const element = this.chartContainer.nativeElement;
    const width = element.offsetWidth;
    const height = 500; // Adjust as necessary

    d3.select(element).selectAll('svg').remove(); // Clear the existing chart

    const svg = d3.select(element).append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g');

    // Scale for node colors based on revenue
    const color = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(this.customers, d => +d.revenue) as number]);

    // Scale for node sizes
    const radiusScale = d3.scaleSqrt()
      .domain([0, d3.max(this.customers, d => +d.revenue) as number])
      .range([5, 20]); // Minimum and maximum radius

    // Tooltip for displaying customer details
    const tooltip = d3.select(element).append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', 'solid')
      .style('border-width', '1px')
      .style('border-radius', '5px')
      .style('padding', '10px');

    const combinedNodes: Array<SimulationNodeDatum & (Customer | Sector)> = [
      ...this.customers.map(customer => ({ ...customer, type: 'customer', id: customer.uuid})),
      ...this.sectors.map(sector => ({ ...sector, type: 'sector', id: sector.uuid}))
    ];

    const nodes = svg.selectAll(".node")
      .data(combinedNodes)
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", d => 'revenue' in d ? radiusScale(d.revenue) : 10)
      .attr("cx", (d, i) => (i + 1) * (width / (this.customers!.length + 1)))
      .attr("cy", height / 2)
      .attr("fill", d => 'revenue' in d ? color(d.revenue) : 'lightgray')
      .on("mouseover", function(event, d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`Name: ${d.name}<br/>${'revenue' in d ? `Revenue: $${d.revenue}` : ''}`)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      })
      .on("click", (event, d) => {
        this.selectedCustomer = d as Customer;
        this.updateSidebar(); // A method to handle sidebar
      });

    // Transform the relationships data to match D3's expected format
    const links = this.relationships.map(r => ({
      source: r.customerId,
      target: r.sectorId
    }));

    // Create a simulation for positioning, if necessary
    const simulation = d3.forceSimulation(combinedNodes)
      .force("link", d3.forceLink(links).id(d => (d as any).id))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Draw links
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", 2)
      .style("stroke", "#999");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => (d.source as SimulationNodeDatum).x ?? 0)
        .attr("y1", (d: any) => (d.source as SimulationNodeDatum).y ?? 0)
        .attr("x2", (d: any) => (d.target as SimulationNodeDatum).x ?? 0)
        .attr("y2", (d: any) => (d.target as SimulationNodeDatum).y ?? 0);

      nodes
        // @ts-ignore
        .attr("cx", (d: SimulationNodeDatum) => d.x ?? 0)
        // @ts-ignore
        .attr("cy", (d: SimulationNodeDatum) => d.y ?? 0);
    });

    const drag = d3.drag<SVGCircleElement, any>()
      .on("start", (event, d) => this.dragStarted(event, d))
      .on("drag", (event, d) => this.dragged(event, d))
      .on("end", (event, d) => this.dragEnded(event, d));

    // Apply the drag behavior to the nodes
    nodes.call(drag);
  }

  private updateSidebar() {
    this.changeDetectorRef.detectChanges();
  }
}
