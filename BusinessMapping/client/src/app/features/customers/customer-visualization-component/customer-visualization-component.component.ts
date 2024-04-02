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
import {NgClass, NgIf} from "@angular/common";
import {SimulationNodeDatum} from "d3";

@Component({
  selector: 'app-customer-visualization-component',
  standalone: true,
  imports: [
    NgIf,
    NgClass
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
  protected sidebarExpanded: boolean = true;
  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  private simulation: d3.Simulation<d3.SimulationNodeDatum, undefined> | undefined;

  private zoomBehavior: any;

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

  private dragStarted(event: d3.D3DragEvent<any, any, any>, d: any) {
    if (!event.active)
      // @ts-ignore
      this.simulation.alphaTarget(0.3).restart();

    event.sourceEvent.stopPropagation(); // Prevent zoom behavior when dragging

    d.fx = d.x;
    d.fy = d.y;
  }


  private dragged(event: d3.D3DragEvent<any, any, any>, d: any) {
    d.fx = event.x;
    d.fy = event.y;
  }

  private dragEnded(event: d3.D3DragEvent<any, any, any>, d: any) {
    if (!event.active) {
      // @ts-ignore
      this.simulation.alphaTarget(0);
      }

    d.fx = null;
    d.fy = null;
  }


  createChart(): void {
    if (!this.customers || !this.sectors || !this.chartContainer || !this.relationships) return;

    const element = this.chartContainer.nativeElement;
    const width = element.offsetWidth;
    const height = window.innerHeight;

    d3.select(element).selectAll('svg').remove(); // Clear the existing chart

    this.zoomBehavior = d3.zoom()
      .scaleExtent([0.1, 10]) // Optional: Restrict zoom scale for better control
      .on("zoom", (event) => {
        svg.attr("transform", event.transform); // Apply transformation
      });

    const svg = d3.select(element).append('svg')
      .attr('width', width) // Fixed width
      .attr('height', height) // Fixed height
      .attr('viewBox', `0 0 ${width} ${height}`) // Responsive SVG
      .attr('preserveAspectRatio', 'xMidYMid meet') // Preserve aspect ratio
      .call(this.zoomBehavior)
      .append('g');

    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all");

    // Scale for node colors based on revenue
    const color = d3.scaleSequential(d3.interpolateViridis)
      .domain([0, d3.max(this.customers, d => +d.revenue) as number]);

    // Scale for node sizes
    const radiusScale = d3.scaleSqrt()
      .domain([0, d3.max(this.customers, d => +d.revenue) as number])
      .range([30, 50]); // Minimum and maximum radius

    const combinedNodes: Array<SimulationNodeDatum & (Customer | Sector)> = [
      ...this.customers.map(customer => ({ ...customer, type: 'customer', id: customer.uuid})),
      ...this.sectors.map(sector => ({ ...sector, type: 'sector', id: sector.uuid}))
    ];

    const node = svg.selectAll(".node")
      .data(combinedNodes)
      .enter().append("g")
      .attr("class", "node")
      .style("cursor", "grab")
      // @ts-ignore
      .call(d3.drag() // Initialize drag behavior
        .on("start", (event, d) => this.dragStarted(event, d))
        .on("drag", (event, d) => this.dragged(event, d))
        .on("end", (event, d) => this.dragEnded(event, d)))
      .on('mouseover', (event, d) => {
        this.selectedCustomer = d as Customer;
        this.updateSidebar();
      }
    );

    // Append circles to each group
    node.append("circle")
      .attr("r", d => 'revenue' in d ? radiusScale(d.revenue) : 10)
      .attr("fill", d => 'revenue' in d ? color(d.revenue) : 'lightgray');

    // Append text to each group
    node.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("user-select", "none") // Prevent text selection
      .style("pointer-events", "none") // Ignore pointer events
      .text(d => d.name);

    // Transform the relationships data to match D3's expected format
    const links = this.relationships.map(r => ({
      source: r.customerId,
      target: r.sectorId
    }));

    // Create a simulation for positioning, if necessary
    // @ts-ignore
    this.simulation = d3.forceSimulation(combinedNodes)
      .force("link", d3.forceLink(links).id(d => (d as any).id).distance(100).strength(1))
      .force("charge", d3.forceManyBody().strength(-50).distanceMax(150).distanceMin(20))
      .force("center", d3.forceCenter(width / 2, height / 2))

      .force("collide", d3.forceCollide(d => radiusScale((d as Customer).revenue) + 2))

    // Draw links (Arrows)
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", 1)
      .style("stroke", "#999");

    // @ts-ignore
    this.simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => (d.source as SimulationNodeDatum).x ?? 0)
        .attr("y1", (d: any) => (d.source as SimulationNodeDatum).y ?? 0)
        .attr("x2", (d: any) => (d.target as SimulationNodeDatum).x ?? 0)
        .attr("y2", (d: any) => (d.target as SimulationNodeDatum).y ?? 0);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    const drag = d3.drag<SVGCircleElement, any>()
      .on("start", (event, d) => {
        event.sourceEvent.stopPropagation(); // Prevent zoom behavior when dragging
        this.dragStarted(event, d)
      })
      .on("drag", (event, d) => this.dragged(event, d))
      .on("end", (event, d) => this.dragEnded(event, d));

    // @ts-ignore
    node.call(drag);
  }

  private updateSidebar() {
    this.changeDetectorRef.detectChanges();
  }

  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  zoomIn() {
    // @ts-ignore
    this.zoomBy(1.2)
  }

  zoomOut() {
    // @ts-ignore
    this.zoomBy(0.8)
  }

  resetZoom() {
    // @ts-ignore
    d3.select('svg').transition().duration(750).call(this.zoomBehavior.transform, d3.zoomIdentity);
  }

  private zoomBy(factor: number): void {
    d3.select('svg').transition().duration(750).call(this.zoomBehavior.scaleBy, factor);
  }
}
