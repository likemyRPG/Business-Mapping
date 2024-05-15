// @ts-nocheck

import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Customer } from "../../shared/models/Customer";
import { Sector } from '../../shared/models/Sector';
import { CustomerSectorRelation } from "../../shared/models/CustomerSectorRelation";
import * as d3 from 'd3';
import { SharedService } from "../../shared/services/shared.service";
import { GraphExportService } from "../../shared/services/gaph-export.service";

@Component({
  selector: 'app-sector-ratio',
  standalone: true,
  imports: [],
  templateUrl: './sector-ratio.component.html',
  styleUrls: ['./sector-ratio.component.css']
})
export class SectorRatioComponent implements OnChanges, AfterViewInit, OnInit {
  @Input() customers!: Customer[];
  @Input() sectors!: Sector[];
  @Input() relationships!: CustomerSectorRelation[];
  @Input() colorScheme: string = 'schemeSet2';

  @ViewChild('pieChartContainer') pieChartContainer!: ElementRef;

  selectedCustomer: 'all' | Customer | null = null;
  selectedSectors: Sector[] = [];

  constructor(private sharedService: SharedService, private exportService: GraphExportService) {}

  ngOnInit() {
    this.sharedService.currentCustomer.subscribe(customer => {
      this.selectedCustomer = customer;
      this.updateData(); // Method to update data based on selected customer
    });

    this.sharedService.colorScheme.subscribe(scheme => {
      this.colorScheme = scheme;
      this.updateData(); // Update the chart with the new color scheme
    });

    this.sharedService.selectedSectorsSource.subscribe(sectors => {
      this.selectedSectors = sectors;
      this.updateData();
    });
  }

  ngAfterViewInit(): void {
    this.createPieChart();
    this.addResizeListener();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.pieChartContainer) {
      this.updateData();
    }
  }

  addResizeListener(): void {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        this.createPieChart();
      }
    });
    if (this.pieChartContainer) {
      resizeObserver.observe(this.pieChartContainer.nativeElement);
    }
  }

  updateData() {
    if (this.customers && this.pieChartContainer) {
      this.createPieChart();
    }
  }

  exportGraph(): void {
    const svgElement = this.pieChartContainer?.nativeElement.querySelector('svg') as SVGElement;
    if (svgElement) {
      this.exportService.exportGraph(svgElement, 'revenue-overview.svg');
    }
  }

  private createPieChart(): void {
    const sectorCounts = this.relationships.reduce((acc, relation) => {
      acc[relation.sectorId] = (acc[relation.sectorId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const isAllCustomers = this.selectedCustomer === 'all';

    const data = this.sectors.map(sector => {
      const isHighlighted = (!isAllCustomers && this.relationships.some(relation =>
        relation.sectorId === sector.uuid && relation.customerId === (this.selectedCustomer as Customer)?.uuid
      )) || this.selectedSectors.some(selectedSector => selectedSector.uuid === sector.uuid);
      return {
        name: sector.name,
        count: sectorCounts[sector.uuid] || 0,
        isHighlighted: isHighlighted,
      };
    }).filter(sector => sector.count > 0);

    const element = this.pieChartContainer.nativeElement;
    const width = element.offsetWidth;
    const height = window.innerHeight * 0.5;
    const radius = Math.min(width, height) / 2;

    const baseColor = d3.scaleOrdinal(d3[this.colorScheme]);

    d3.select(this.pieChartContainer.nativeElement).select("svg").remove();

    const svg = d3.select(this.pieChartContainer.nativeElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<Sector>().sort(null).value((d: any) => d.count);
    const path = d3.arc().outerRadius(radius).innerRadius(0);
    const label = d3.arc().outerRadius(radius * 0.7).innerRadius(radius * 0.7);

    const arc = svg.selectAll(".arc")
      .data(pie(data))
      .enter().append("g")
      .attr("class", "arc");

    arc.append("path")
      .attr("d", path as any)
      .attr("fill", (d: any) => {
        const baseFill = baseColor(d.data.name);
        const opacity = d.data.isHighlighted ? 1 : 0.5;
        return d3.color(baseFill).brighter(1 - opacity).toString();
      })
      .attr("stroke", d => d.data.isHighlighted ? 'black' : 'none')
      .attr("stroke-width", d => d.data.isHighlighted ? 2 : 0)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        const sector = this.sectors.find(sector => sector.name === d.data.name);
        const index = this.selectedSectors.findIndex(selectedSector => selectedSector.uuid === sector?.uuid);
        if (index === -1) {
          this.selectedSectors.push(sector as Sector);
        } else {
          this.selectedSectors.splice(index, 1);
        }
        this.sharedService.emitSectorSelectionChange(this.selectedSectors);
        this.createPieChart();
      });

    arc.append("text")
      .attr("transform", (d: any) => `translate(${label.centroid(d)})`)
      .attr("text-anchor", "middle")
      .each(function (d) {
        const node = d3.select(this);
        const lines = [d.data.name, `(${d.data.count})`];
        lines.forEach((line, index) => {
          node.append("tspan")
            .attr("x", 0)
            .attr("dy", index === 0 ? "-0.6em" : "1.2em")
            .text(line);
        });
      });
  }
}
