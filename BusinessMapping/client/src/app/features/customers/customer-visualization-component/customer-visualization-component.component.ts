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
  sidebarHidden: boolean = false;
  sidebarExpanded: boolean = false;
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

    const combinedNodes = [...this.customers.map(customer => ({
      ...customer,
      type: 'customer'
    })), ...this.sectors.map(sector => ({
      ...sector,
      type: 'sector'
    }))];

    // Create a simulation for positioning, if necessary
    const simulation = d3.forceSimulation(combinedNodes as SimulationNodeDatum[])
      .force("link", d3.forceLink(this.relationships as any).id(d => (d as any).id))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Draw links
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(this.relationships)
      .enter().append("line")
      .attr("stroke-width", 2)
      .style("stroke", "#999");

    const nodes = svg.selectAll(".node")
      .data(combinedNodes)
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", d => d.type === 'customer' ? radiusScale(+d.revenue) : 10)
      .attr("cx", (d, i) => (i + 1) * (width / (this.customers!.length + 1)))
      .attr("cy", height / 2)
      .attr("fill", d => d.type === 'customer' ? color(+d.revenue) : 'lightgray')
      .on("mouseover", function(event, d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`Name: ${d.name}<br/>Revenue: $${d.revenue}`)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      })
      .on("click", (event, d) => {
        this.selectedCustomer = d; // Set the clicked node's data as the selectedCustomer
        this.updateSidebar(); // A method to handle sidebar
        console.log(d);
      });

    simulation.on("tick", () => {
      // Update positions of links and nodes based on simulation
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      nodes
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
      // Update labels positions if you have them
    });

    const drag = d3.drag<SVGCircleElement, any>()
      .on("start", (event, d) => this.dragStarted(event, d))
      .on("drag", (event, d) => this.dragged(event, d))
      .on("end", (event, d) => this.dragEnded(event, d));

    // Apply the drag behavior to the nodes
    nodes.call(drag);

    // Add labels to each node
    svg.selectAll(".label")
      .data(combinedNodes)
      .enter().append("text")
      .attr("x", (d, i) => (i + 1) * (width / (this.customers!.length + 1)))
      .attr("y", height / 2 + 30)
      .attr("text-anchor", "middle")
      .text(d => d.name)
      .style("font-size", "12px");
  }

  private updateSidebar() {
    this.changeDetectorRef.detectChanges();
  }

  toggleSidebar(): void {
    this.sidebarHidden = !this.sidebarHidden;
    this.sidebarExpanded = !this.sidebarExpanded;
    this.updateChart(); // You may need to adjust the chart size based on the sidebar state
  }
}
