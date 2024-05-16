//@ts-nocheck

import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Customer } from "../../shared/models/Customer";
import { CustomerSectorRelation } from "../../shared/models/CustomerSectorRelation";
import { Sector } from "../../shared/models/Sector";
import * as d3 from 'd3';
import { SimulationNodeDatum } from 'd3';
import { CommonModule, DatePipe, DecimalPipe, NgClass, NgIf } from "@angular/common";
import { Project } from "../../shared/models/Project";
import { ProjectCustomerRelation } from "../../shared/models/ProjectCustomerRelation";
import { AccountManagerSectorRelation } from "../../shared/models/AccountManagerSectorRelation";
import { AccountManager } from "../../shared/models/AccountManager";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customer-visualization-component',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    DecimalPipe,
    DatePipe,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './customer-visualization-component.component.html',
  styleUrls: ['./customer-visualization-component.component.css']
})
export class CustomerVisualizationComponent implements OnChanges, AfterViewInit {
  @ViewChild('chart') chartContainer!: ElementRef;
  @Input() customers!: Customer[];
  @Input() customerSectorRelations!: CustomerSectorRelation[];
  @Input() projectCustomerRelations!: ProjectCustomerRelation[];
  @Input() accountManagerSectorRelations!: AccountManagerSectorRelation[];
  @Input() sectors!: Sector[];
  @Input() projects!: Project[];
  @Input() accountManagers!: AccountManager[];

  nodes: any[] = [];
  links: any[] = [];

  selectedCustomer: Customer | null = null;
  selectedNode: Customer | Sector | Project | AccountManager | null = null;
  selectedNodeType: string = '';
  selectedNodeId: string = '';

  protected sidebarExpanded: boolean = true;
  private simulation!: d3.Simulation<d3.SimulationNodeDatum, undefined>;
  private zoomBehavior: any;
  private svg!: d3.Selection<SVGGElement, unknown, null, undefined>;

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
    if (this.chartContainer) {
      d3.select(this.chartContainer.nativeElement).selectAll('*').remove();
      this.createChart();
    }
  }

  onNodeSelected(event: any): void {
    const selectedId = event.target.value;
    this.filterNodes(selectedId);
  }

  filterNodes(selectedId: string): void {
    if (!this.nodes || !this.links) {
      console.error("Nodes or links array is undefined or not initialized.");
      return;
    }

    // Track nodes that need to be highlighted and visible
    const highlightedNodeIds = new Set<string>();
    const visibleNodeIds = new Set<string>();

    // Add the already visible nodes to the visible set
    this.nodes.filter(node => node.visible).forEach(node => visibleNodeIds.add(node.id));

    this.nodes.forEach(node => {
      if (node.id === selectedId) {
        node.highlighted = true;
        highlightedNodeIds.add(node.id);

        // Ensure related nodes are visible
        if (node.type === 'project') {
          const relatedCustomerIds = this.projectCustomerRelations
            .filter(rel => String(rel.projectId) === node.id)
            .map(rel => String(rel.customerId));

          relatedCustomerIds.forEach(customerId => {
            visibleNodeIds.add(customerId);
            const relatedSectorIds = this.customerSectorRelations
              .filter(rel => String(rel.customerId) === customerId)
              .map(rel => String(rel.sectorId));

            relatedSectorIds.forEach(sectorId => {
              visibleNodeIds.add(sectorId);

              const relatedAccountManagerIds = this.accountManagerSectorRelations
                .filter(rel => String(rel.sectorId) === sectorId)
                .map(rel => String(rel.accountManagerId));

              relatedAccountManagerIds.forEach(accountManagerId => {
                visibleNodeIds.add(accountManagerId);
              });
            });
          });
        } else if (node.type === 'customer') {
          const relatedProjectIds = this.projectCustomerRelations
            .filter(rel => String(rel.customerId) === node.id)
            .map(rel => String(rel.projectId));

          relatedProjectIds.forEach(projectId => {
            visibleNodeIds.add(projectId);
          });

          const relatedSectorIds = this.customerSectorRelations
            .filter(rel => String(rel.customerId) === node.id)
            .map(rel => String(rel.sectorId));

          relatedSectorIds.forEach(sectorId => {
            visibleNodeIds.add(sectorId);

            const relatedAccountManagerIds = this.accountManagerSectorRelations
              .filter(rel => String(rel.sectorId) === sectorId)
              .map(rel => String(rel.accountManagerId));

            relatedAccountManagerIds.forEach(accountManagerId => {
              visibleNodeIds.add(accountManagerId);
            });
          });
        } else if (node.type === 'sector') {
          const relatedCustomerIds = this.customerSectorRelations
            .filter(rel => String(rel.sectorId) === node.id)
            .map(rel => String(rel.customerId));

          relatedCustomerIds.forEach(customerId => {
            visibleNodeIds.add(customerId);

            const relatedProjectIds = this.projectCustomerRelations
              .filter(rel => String(rel.customerId) === customerId)
              .map(rel => String(rel.projectId));

            relatedProjectIds.forEach(projectId => {
              visibleNodeIds.add(projectId);
            });
          });

          const relatedAccountManagerIds = this.accountManagerSectorRelations
            .filter(rel => String(rel.sectorId) === node.id)
            .map(rel => String(rel.accountManagerId));

          relatedAccountManagerIds.forEach(accountManagerId => {
            visibleNodeIds.add(accountManagerId);
          });
        } else if (node.type === 'accountManager') {
          const relatedSectorIds = this.accountManagerSectorRelations
            .filter(rel => String(rel.accountManagerId) === node.id)
            .map(rel => String(rel.sectorId));

          relatedSectorIds.forEach(sectorId => {
            visibleNodeIds.add(sectorId);

            const relatedCustomerIds = this.customerSectorRelations
              .filter(rel => String(rel.sectorId) === sectorId)
              .map(rel => String(rel.customerId));

            relatedCustomerIds.forEach(customerId => {
              visibleNodeIds.add(customerId);

              const relatedProjectIds = this.projectCustomerRelations
                .filter(rel => String(rel.customerId) === customerId)
                .map(rel => String(rel.projectId));

              relatedProjectIds.forEach(projectId => {
                visibleNodeIds.add(projectId);
              });
            });
          });
        }
      } else {
        node.highlighted = false;
      }
    });

    // Update highlighting based on the tracked node IDs
    this.nodes.forEach(node => {
      node.visible = highlightedNodeIds.has(node.id) || visibleNodeIds.has(node.id);
    });

    this.updateNodeStyles();
    this.updateLinkVisibility();
  }

  updateNodeStyles(): void {
    this.svg.selectAll<SVGGElement, any>(".node")
      .style("display", d => d.visible ? "block" : "none")
      .select("circle")
      .attr("stroke", d => d.highlighted ? "yellow" : "none") // Apply highlighting
      .attr("stroke-width", d => d.highlighted ? 6 : 0);
  }

  updateLinkVisibility(): void {
    this.svg.selectAll<SVGLineElement, any>(".links line")
      .style("display", d => {
        const sourceNode = this.nodes.find(node => node.id === String(d.source.id));
        const targetNode = this.nodes.find(node => node.id === String(d.target.id));

        if (sourceNode && targetNode) {
          return sourceNode.visible && targetNode.visible ? "block" : "none";
        }

        return "none";
      });
  }

  createChart(): void {
    if (!this.customers || !this.sectors || !this.chartContainer || !this.customerSectorRelations || !this.projects || !this.projectCustomerRelations || !this.accountManagers || !this.accountManagerSectorRelations) {
      return;
    }

    const element = this.chartContainer.nativeElement;
    const width = element.offsetWidth;
    const height = window.innerHeight;

    // Define color scales
    const customerColor = d3.scaleOrdinal<string>().domain(['customer']).range(["#3182bd"]);
    const sectorColor = d3.scaleOrdinal<string>().domain(['sector']).range(["#31a354"]);
    const projectColor = d3.scaleOrdinal<string>().domain(['project']).range(["#fd8d3c"]);
    const accountManagerColor = d3.scaleOrdinal<string>().domain(['accountManager']).range(["#e6550d"]);

    let accountManagerRevenues: Record<string, number> = {};

    d3.select(element).selectAll('svg').remove();

    this.zoomBehavior = d3.zoom().scaleExtent([0.1, 10]).on("zoom", (event) => {
      this.svg.attr("transform", event.transform)
      this.svg.selectAll("text").style("display", function () {
        return event.transform.k > .3 ? "block" : "none";
      });
    });

    this.svg = d3.select(element).append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .call(this.zoomBehavior)
      .append('g');

    this.svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all");

    let sectorRevenues: Record<string, number> = {};

    if (this.customers && this.customerSectorRelations) {
      sectorRevenues = this.customerSectorRelations.reduce((acc, cur) => {
        const customer = this.customers.find(c => String(c.uuid) === String(cur.customerId));
        if (customer) {
          const sectorKey = String(cur.sectorId);
          acc[sectorKey] = (acc[sectorKey] || 0) + customer.revenue;
        }
        return acc;
      }, {} as Record<string, number>);
    } else {
      console.warn("Customers or CustomerSectorRelations data is missing.");
    }

    if (this.accountManagerSectorRelations) {
      accountManagerRevenues = this.accountManagerSectorRelations.reduce((acc, cur) => {
        const sectorKey = String(cur.sectorId);
        const sectorRevenue = sectorRevenues[sectorKey] || 0;
        const accountKey = String(cur.accountManagerId);

        acc[accountKey] = (acc[accountKey] || 0) + sectorRevenue;
        return acc;
      }, {} as Record<string, number>);

      if (this.sectors) {
        this.sectors.forEach(sector => {
          const sectorKey = String(sector.uuid);
          sector.revenue = sectorRevenues[sectorKey] || 0;
        });
      }
    }

    const combinedRevenues = [
      ...this.customers.map(customer => +customer.revenue),
      ...this.sectors.map(sector => +sector.revenue),
      ...this.projects.map(project => +project.budget),
      ...this.accountManagers.map(manager => this.accountManagerSectorRelations
        .filter(rel => rel.accountManagerId === Number(manager.uuid))
        .reduce((sum, rel) => {
          const sector = this.sectors.find(s => Number(s.uuid) === rel.sectorId);
          return sum + (sector ? sector.revenue : 0);
        }, 0))
    ];

    const radiusScale = d3.scaleSqrt()
      .domain([0, d3.max(combinedRevenues)!])
      .range([10, 50]);

    interface VisualizationNode extends SimulationNodeDatum {
      id: string;
      uuid: string;
      name: string;
      type: 'customer' | 'sector' | 'project' | 'accountManager';
      revenue: number;
      visible: boolean;
      location?: string;
      industry?: string;
      success?: boolean;
      year?: number;
      status?: string;
      startDate?: string;
      endDate?: string;
      scope?: string;
      budget?: number;
      actualCost?: number;
      impact?: string;
      highlighted: boolean;
    }

    const combinedNodes: VisualizationNode[] = [
      ...this.customers.map(customer => ({
        id: customer.uuid,
        uuid: customer.uuid,
        name: customer.name,
        type: 'customer',
        revenue: customer.revenue,
        location: customer.location,
        industry: customer.industry,
        visible: false,
        highlighted: false,
      } as VisualizationNode)),

      ...this.sectors.map(sector => ({
        id: sector.uuid,
        name: sector.name,
        type: 'sector',
        revenue: sectorRevenues[String(sector.uuid)] || 0,
        visible: true,
        highlighted: false,
      } as VisualizationNode)),

      ...this.projects.map(project => ({
        id: project.uuid,
        uuid: project.uuid,
        name: project.name,
        type: 'project',
        revenue: project.budget,
        visible: false,
        success: project.success,
        year: project.year,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        scope: project.scope,
        budget: project.budget,
        actualCost: project.actualCost,
        impact: project.impact,
        highlighted: false,
      } as VisualizationNode)),

      ...this.accountManagers.map(accountManager => ({
        id: accountManager.uuid,
        name: accountManager.name,
        type: 'accountManager',
        revenue: accountManagerRevenues[String(accountManager.uuid)] || 0,
        visible: true,
        highlighted: false,
      } as VisualizationNode))
    ];

    this.nodes = combinedNodes;

    const links = [
      ...this.customerSectorRelations.map(r => ({ source: r.customerId, target: r.sectorId })),
      ...this.projectCustomerRelations.map(r => ({ source: r.customerId, target: r.projectId })),
      ...this.accountManagerSectorRelations.map(r => ({ source: r.accountManagerId, target: r.sectorId }))
    ];

    this.links = links;

    const link = this.svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", 1)
      .style("stroke", "#999")
      .style("display", "none"); // Initially hide all links

    const node = this.svg.selectAll<SVGGElement, VisualizationNode>(".node")
      .data(combinedNodes)
      .enter().append("g")
      .attr("class", "node")
      .style("cursor", "grab")
      .call(d3.drag<SVGGElement, VisualizationNode>()
        .on("start", (event, d) => this.dragStarted(event, d))
        .on("drag", (event, d) => this.dragged(event, d))
        .on("end", (event, d) => this.dragEnded(event, d)))
      .on('click', (event, d) => {
        if (d.type === 'sector') {
          this.toggleCustomersVisibility(d.id);
        } else if (d.type === 'customer') {
          this.toggleProjectsVisibility(d.id);
        }
        event.stopPropagation();
      })
      .on('mouseover', (event, d) => {
        if (d.type === 'customer') {
          this.selectedCustomer = d as unknown as Customer;
        }
        this.selectedNode = d as Customer | Sector | Project | AccountManager | null;
        this.selectedNodeType = d.type.toUpperCase();
        this.updateSidebar();
      });

    node.style("display", d => (d as any).visible ? "block" : "none");

    node.append("circle")
      .attr("r", (d: VisualizationNode) => {
        return radiusScale(d.revenue);
      })
      .attr("fill", (d: VisualizationNode): string => {
        switch (d.type) {
          case 'customer':
            return customerColor('customer')!;
          case 'sector':
            return sectorColor('sector')!;
          case 'project':
            return projectColor('project')!;
          case 'accountManager':
            return accountManagerColor('accountManager')!;
          default:
            return 'black';
        }
      });

    node.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .style("pointer-events", "none")
      .style("font-size", "12px")
      .text(d => d.name);

    if (this.selectedNodeId) {
      this.filterNodes(this.selectedNodeId);
    }

    this.simulation = d3.forceSimulation<VisualizationNode>(combinedNodes)
      .force("link", d3.forceLink<VisualizationNode, any>(links).id(d => d.id).distance(100).strength(0.1))
      .force("charge", d3.forceManyBody<VisualizationNode>().strength(-50).distanceMax(150).distanceMin(20))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<VisualizationNode>().radius(d => radiusScale(d.revenue) + 15))
      .on("tick", () => {
        link
          .attr("x1", (d: any) => (d.source as VisualizationNode).x ?? 0)
          .attr("y1", (d: any) => (d.source as VisualizationNode).y ?? 0)
          .attr("x2", (d: any) => (d.target as VisualizationNode).x ?? 0)
          .attr("y2", (d: any) => (d.target as VisualizationNode).y ?? 0);

        node.attr("transform", (d: VisualizationNode) => `translate(${d.x ?? 0}, ${d.y ?? 0})`);
      });

    this.updateLinkVisibility();

    const drag = d3.drag<SVGCircleElement, any>()
      .on("start", (event, d) => {
        event.sourceEvent.stopPropagation();
        this.dragStarted(event, d)
      })
      .on("drag", (event, d) => this.dragged(event, d))
      .on("end", (event, d) => this.dragEnded(event, d));

    node.call(drag as any);

    const legend = this.svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(20,20)")
      .style("pointer-events", "none");

    legend.append("circle")
      .attr("r", 6)
      .attr("fill", customerColor as any)
      .attr("cy", 0);

    legend.append("text")
      .attr("x", 12)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .text("Customer");

    legend.append("circle")
      .attr("r", 6)
      .attr("fill", sectorColor as any)
      .attr("cy", 20);

    legend.append("text")
      .attr("x", 12)
      .attr("y", 20)
      .attr("dy", "0.35em")
      .text("Sector");

    legend.append("circle")
      .attr("r", 6)
      .attr("fill", accountManagerColor as any)
      .attr("cy", 40);

    legend.append("text")
      .attr("x", 12)
      .attr("y", 40)
      .attr("dy", "0.35em")
      .text("Account Manager");

    legend.append("circle")
      .attr("r", 6)
      .attr("fill", projectColor as any)
      .attr("cy", 60);

    legend.append("text")
      .attr("x", 12)
      .attr("y", 60)
      .attr("dy", "0.35em")
      .text("Project");
  }

  toggleCustomersVisibility(sectorId: string): void {
    const relatedCustomers = this.customerSectorRelations.filter(r => String(r.sectorId) === sectorId).map(r => String(r.customerId));
    this.nodes.forEach(node => {
      if (node.type === 'customer' && relatedCustomers.includes(String(node.id))) {
        node.visible = !node.visible;
      }
    });
    // Hide all projects related to the customers
    const relatedProjects = this.projectCustomerRelations.filter(r => relatedCustomers.includes(String(r.customerId))).map(r => String(r.projectId));
    this.nodes.forEach(node => {
      if (node.type === 'project' && relatedProjects.includes(String(node.id))) {
        node.visible = false;
      }
    });
    this.updateNodeStyles();
    this.updateLinkVisibility();
  }

  toggleProjectsVisibility(customerId: string): void {
    const relatedProjects = this.projectCustomerRelations.filter(r => String(r.customerId) === customerId).map(r => String(r.projectId));
    this.nodes.forEach(node => {
      if (node.type === 'project' && relatedProjects.includes(String(node.id))) {
        node.visible = !node.visible;
      }
    });
    this.updateNodeStyles();
    this.updateLinkVisibility();
  }

  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  zoomIn() {
    this.zoomBy(1.2)
  }

  zoomOut() {
    this.zoomBy(0.8)
  }

  resetZoom() {
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
      this.simulation.alphaTarget(0.1).restart();

    event.sourceEvent.stopPropagation();

    d.fx = d.x;
    d.fy = d.y;
  }

  private dragged(event: d3.D3DragEvent<any, any, any>, d: any) {
    d.fx = event.x;
    d.fy = event.y;
  }

  private dragEnded(event: d3.D3DragEvent<any, any, any>, d: any) {
    if (!event.active)
      this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  private updateSidebar() {
    this.changeDetectorRef.detectChanges();
  }

  private zoomBy(factor: number): void {
    const svgElement = d3.select(this.chartContainer.nativeElement).select('svg');
    const transform = d3.zoomTransform(svgElement.node() as any);
    const newTransform = transform.scale(factor);
    svgElement.transition().duration(750)
      .call(this.zoomBehavior.transform, newTransform);
  }
}
