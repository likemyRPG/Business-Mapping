// @ts-ignore
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
import {SimulationNodeDatum} from 'd3';
import {DatePipe, DecimalPipe, NgClass, NgIf} from "@angular/common";
import {Project} from "../../shared/models/Project";
import {ProjectCustomerRelation} from "../../shared/models/ProjectCustomerRelation";
import {AccountManagerSectorRelation} from "../../shared/models/AccountManagerSectorRelation";
import {AccountManager} from "../../shared/models/AccountManager";

@Component({
  selector: 'app-customer-visualization-component',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    DecimalPipe,
    DatePipe
  ],
  templateUrl: './customer-visualization-component.component.html',
  styleUrl: './customer-visualization-component.component.css'
})
export class CustomerVisualizationComponent implements OnChanges, AfterViewInit {
  @ViewChild('chart') chartContainer: ElementRef | undefined;
  @Input() customers: Customer[] | undefined;
  @Input() customerSectorRelations: CustomerSectorRelation[] | undefined;
  @Input() projectCustomerRelations: ProjectCustomerRelation[] | undefined;
  @Input() accountManagerSectorRelations!: AccountManagerSectorRelation[];
  @Input() sectors: Sector[] | undefined;
  @Input() projects: Project[] | undefined;
  @Input() accountManagers: AccountManager[] | undefined;
  selectedCustomer: Customer | null = null;
  selectedNode: Customer | Sector | Project | null = null;
  selectedNodeType: string = ''; // Track the type of the selected node
  protected sidebarExpanded: boolean = true;
  private simulation: d3.Simulation<d3.SimulationNodeDatum, undefined> | undefined;
  private zoomBehavior: any;

  constructor(private changeDetectorRef: ChangeDetectorRef) {
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
    if (!this.customers || !this.sectors || !this.chartContainer || !this.customerSectorRelations || !this.projects || !this.projectCustomerRelations || !this.accountManagers || !this.accountManagerSectorRelations) {
      return;
    }

    const element = this.chartContainer.nativeElement;
    const width = element.offsetWidth;
    const height = window.innerHeight;

    // Define two color scales for customers and sectors
    const customerColor = d3.scaleOrdinal().range(["#3182bd"]); // Example blue color for customers
    const sectorColor = d3.scaleOrdinal().range(["#31a354"]); // Example green color for sectors
    const accountManagerColor = d3.scaleOrdinal().range(["#756bb1"]); // Example purple color for account managers

    d3.select(element).selectAll('svg').remove(); // Clear the existing chart

    this.zoomBehavior = d3.zoom()
      .scaleExtent([0.1, 10]) // Optional: Restrict zoom scale for better control
      .on("zoom", (event) => {
        svg.attr("transform", event.transform); // Apply transformation
        svg.selectAll("text").style("display", function () {
          return event.transform.k > .3 ? "block" : "none";
        });
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

    // Calculate combined revenue for each sector
    const sectorRevenues = this.customerSectorRelations.reduce((acc, cur) => {
      // @ts-ignore
      const customer = this.customers.find(c => c.uuid === cur.customerId);
      if (customer) {
        // @ts-ignore
        acc[cur.sectorId] = (acc[cur.sectorId] || 0) + customer.revenue;
      }
      return acc;
    }, {});

    // Account manager revenues are based on the total revenue of the sectors they manage
    const accountManagerRevenues = this.accountManagerSectorRelations.reduce((acc, cur) => {
        // @ts-ignore
        const sectorRevenue = sectorRevenues[cur.sectorId];
        if (sectorRevenue) {
          // @ts-ignore
          acc[cur.accountManagerId] = (acc[cur.accountManagerId] || 0) + sectorRevenue;
        }
        return acc;
    }
      , {});

    // New code to update each sector's revenue property
    this.sectors.forEach(sector => {
      // @ts-ignore
      sector.revenue = sectorRevenues[sector.uuid] || 0;
    });

    // Adjust the radiusScale for customers
    const customerRadiusScale = d3.scaleSqrt()
      // @ts-ignore
      .domain([0, d3.max(this.customers, d => +d.revenue)])
      .range([10, 30]); // Adjust min and max radius as needed

// Create a scale for sector nodes based on combined revenue
    const sectorRadiusScale = d3.scaleSqrt()
      // @ts-ignore
      .domain([0, d3.max(Object.values(sectorRevenues))])
      .range([30, 50]); // Adjust min and max radius as needed

    const projectRadiusScale = d3.scaleSqrt()
      // @ts-ignore
      .domain([0, d3.max(this.projects, d => +d.budget)])
      .range([10, 30]); // Adjust min and max radius as needed

    // Radius of account managers is based on the total revenue of the sectors they manage
    const accountManagerRadiusScale = d3.scaleSqrt()
      // @ts-ignore
      .domain([0, d3.max(Object.values(accountManagerRevenues))])
      .range([10, 30]);

    // @ts-ignore
    const combinedNodes: Array<SimulationNodeDatum & (Customer | Sector)> = [
      ...this.customers.map(customer => ({...customer, type: 'customer', id: customer.uuid, visible: false})),
      // @ts-ignore
      ...this.sectors.map(sector => ({
        ...sector,
        type: 'sector',
        id: sector.uuid,
        // @ts-ignore
        revenue: sectorRevenues[sector.uuid],
        visible: true
      })),
      // @ts-ignore
      ...this.projects.map(project => ({...project, type: 'project', id: project.uuid, visible: false})),
      // @ts-ignore
      ...this.accountManagers.map(accountManager => ({
        ...accountManager,
        type: 'accountManager',
        id: accountManager.uuid,
        // @ts-ignore
        revenue: accountManagerRevenues[accountManager.uuid],
        visible: true
      }))
    ];

    // Transform the customerSectorRelations data to match D3's expected format
    const links = [
      ...this.customerSectorRelations.map(r => ({source: r.customerId, target: r.sectorId})),
      ...this.projectCustomerRelations.map(r => ({source: r.customerId, target: r.projectId})),
      ...this.accountManagerSectorRelations.map(r => ({source: r.accountManagerId, target: r.sectorId}))
    ];

    // Draw links (Arrows)
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", 1)
      .style("stroke", "#999");

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
          this.selectedNode = d;
          this.selectedNodeType = (d as any).type.toUpperCase();
          this.updateSidebar();
        }
      );

    node.style("display", d => (d as any).visible ? "block" : "none");

    // Append circles to each group
    node.append("circle")
      // @ts-ignore
      .attr("r", d => 'revenue' in d ? customerRadiusScale(d.revenue) : sectorRadiusScale(sectorRevenues[d.uuid]))
      // @ts-ignore
      // Use case-based fill color
      .attr("fill", d => {
        if ((d as any).type === 'customer') {
          // @ts-ignore
          return customerColor();
        } else if ((d as any).type === 'sector') {
          // @ts-ignore
          return sectorColor();
        } else if ((d as any).type === 'accountManager') {
          // @ts-ignore
          return accountManagerColor();
        }
        return 'black';
      }
      );

    node.append("circle")
      .attr("r", d => {
        if ((d as any).type === 'customer') {
          return customerRadiusScale((d as any).revenue);
        } else if ((d as any).type === 'sector') {
          return sectorRadiusScale((d as any).revenue);
        }
        return 10;
      })
      // @ts-ignore
      .attr("fill", d => (d as any).type === 'customer' ? customerColor() : sectorColor());

    // Append text to each group
    node.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("user-select", "none") // Prevent text selection
      .style("pointer-events", "none") // Ignore pointer events
      .style("font-size", "12px")
      .text(d => d.name);

    // @ts-ignore
    node.filter(d => d.type === 'sector')
      .on('click', (event, d) => {
        toggleCustomersVisibility(d.id);
        event.stopPropagation(); // Prevent the click from triggering zoom behavior
      });

    // @ts-ignore
    node.filter(d => d.type === 'customer')
      .on('click', (event, d) => {
        toggleProjectsVisibility(d.id);
        event.stopPropagation(); // Prevent the click from triggering zoom behavior
      });

    const toggleCustomersVisibility = (sectorId: string) => {
      // @ts-ignore
      const relatedCustomers = this.customerSectorRelations.filter(r => r.sectorId === sectorId).map(r => r.customerId);
      combinedNodes.forEach(node => {
        // @ts-ignore
        if (node.type === 'customer' && relatedCustomers.includes(node.id)) {
          // @ts-ignore
          node.visible = !node.visible; // Toggle visibility
        }
      });
      // Update the node display based on the new visibility states
      svg.selectAll(".node")
        .style("display", d => (d as any).visible ? "block" : "none");

      updateLinkVisibility();
    };

    const toggleProjectsVisibility = (customerId: string) => {
      // @ts-ignore
      const relatedProjects = this.projectCustomerRelations.filter(r => r.customerId === customerId).map(r => r.projectId);
      combinedNodes.forEach(node => {
        // @ts-ignore
        if (node.type === 'project' && relatedProjects.includes(node.id)) {
          // @ts-ignore
          node.visible = !node.visible; // Toggle visibility
        }
      });
      // Update the node display based on the new visibility states
      svg.selectAll(".node")
        .style("display", d => (d as any).visible ? "block" : "none");

      updateLinkVisibility();
    }

    // Create a simulation for positioning, if necessary
    // @ts-ignore
    this.simulation = d3.forceSimulation(combinedNodes)
      .force("link", d3.forceLink(links).id(d => (d as any).id).distance(100).strength(.1))
      .force("charge", d3.forceManyBody().strength(-50).distanceMax(150).distanceMin(20))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(d => {
        // @ts-ignore
        // return 'revenue' in d ? customerRadiusScale((d as any).revenue) + 5 : sectorRadiusScale(sectorRevenues[d.uuid]) + 5;
        if ('revenue' in d) {
          return customerRadiusScale((d as any).revenue) + 15;
        } else if ((d as any).type === 'sector') {
          // @ts-ignore
          return sectorRadiusScale(sectorRevenues[d.uuid]) + 15;
        } else if ((d as any).type === 'project') {
          return projectRadiusScale((d as any).budget) + 15;
        } else {
          return 20;
        }
      }));

    this.simulation!.on("tick", () => {
      link
        .attr("x1", (d: any) => (d.source as SimulationNodeDatum).x ?? 0)
        .attr("y1", (d: any) => (d.source as SimulationNodeDatum).y ?? 0)
        .attr("x2", (d: any) => (d.target as SimulationNodeDatum).x ?? 0)
        .attr("y2", (d: any) => (d.target as SimulationNodeDatum).y ?? 0);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });


    const updateLinkVisibility = () => {
      link.style("display", d => {
        // @ts-ignore
        const sourceNode = combinedNodes.find(node => node.id === d.source.id);
        // @ts-ignore
        const targetNode = combinedNodes.find(node => node.id === d.target.id);
        // Hide the link if either the source or target node is invisible
        // @ts-ignore
        return sourceNode.visible && targetNode.visible ? null : "none";
      });
    };

    updateLinkVisibility();

    const drag = d3.drag<SVGCircleElement, any>()
      .on("start", (event, d) => {
        event.sourceEvent.stopPropagation(); // Prevent zoom behavior when dragging
        this.dragStarted(event, d)
      })
      .on("drag", (event, d) => this.dragged(event, d))
      .on("end", (event, d) => this.dragEnded(event, d));

    // @ts-ignore
    node.call(drag);

    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(20,20)"); // Adjust position as needed

    legend.append("circle")
      .attr("r", 6)
      // @ts-ignore
      .attr("fill", customerColor)
      .attr("cy", 0);

    legend.append("text")
      .attr("x", 12)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .text("Customer");

    legend.append("circle")
      .attr("r", 6)
      // @ts-ignore
      .attr("fill", sectorColor)
      .attr("cy", 20);

    legend.append("text")
      .attr("x", 12)
      .attr("y", 20)
      .attr("dy", "0.35em")
      .text("Sector");

  }

  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  resetView(): void {
    console.log('resetView')
    // Check if chartContainer is defined and make sure the SVG element exists
    if (this.chartContainer && this.chartContainer.nativeElement) {
      const svgElement = d3.select(this.chartContainer.nativeElement).select('svg');
      // Reset the zoom transformation using D3's zoomIdentity
      svgElement.transition().duration(750).call(this.zoomBehavior.transform, d3.zoomIdentity);
    }
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
    const svgElement = d3.select(this.chartContainer.nativeElement).select('svg');
    svgElement.transition().duration(750)
      .call(this.zoomBehavior.transform, d3.zoomIdentity);
  }

  isCustomer(node: any): node is Customer {
    return node?.type === 'customer';
  }

  isSector(node: any): node is Sector {
    return node?.type === 'sector';
  }

  isAccountManager(node: any): node is AccountManager {
    return node && node.type === 'accountManager';
  }

  isProject(node: any): node is Project {
    return node && node.type === 'project';
  }

  private dragStarted(event: d3.D3DragEvent<any, any, any>, d: any) {
    if (!event.active)
      // @ts-ignore
      this.simulation.alphaTarget(0.1).restart();

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

  private updateSidebar() {
    this.changeDetectorRef.detectChanges();
  }

  private zoomBy(factor: number): void {
    // @ts-ignore
    const svgElement = d3.select(this.chartContainer.nativeElement).select('svg');
    // @ts-ignore
    const transform = d3.zoomTransform(svgElement.node());

    // Apply the zoom factor based on the current transform
    const newTransform = transform.scale(factor);

    svgElement.transition().duration(750)
      .call(this.zoomBehavior.transform, newTransform);
  }
}

