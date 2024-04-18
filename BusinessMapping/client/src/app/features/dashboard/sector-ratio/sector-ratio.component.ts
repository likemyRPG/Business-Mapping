import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Customer} from "../../shared/models/Customer";
import {Sector} from '../../shared/models/Sector';
import {CustomerSectorRelation} from "../../shared/models/CustomerSectorRelation";
import * as d3 from 'd3';
import {SharedService} from "../../shared/services/shared.service";

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

  @ViewChild('pieChartContainer') pieChartContainer!: ElementRef;

  selectedCustomer: 'all' | Customer | null = null;

  constructor(private sharedService: SharedService) {
  }

  ngOnInit() {
    this.sharedService.currentCustomer.subscribe(customer => {
      // @ts-ignore
      this.selectedCustomer = customer;
      this.updateData(); // Method to update data based on selected customer
    });
  }

  updateData() {
    if (this.customers && this.pieChartContainer) {
      this.createPieChart();
    }
  }

  ngAfterViewInit(): void {
    this.createPieChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.pieChartContainer) {
      this.createPieChart();
    }
  }

  private createPieChart(): void {
    // First, map sectors to customer count
    const sectorCounts = this.relationships.reduce((acc, relation) => {
      acc[relation.sectorId] = (acc[relation.sectorId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // @ts-ignore
    const isAllCustomers = this.selectedCustomer === 'all';

    // Highlight the sector of the selected customer
    const data = this.sectors.map(sector => {
      const isHighlighted = !isAllCustomers && this.relationships.some(relation =>
        // @ts-ignore
        relation.sectorId === sector.uuid && relation.customerId === this.selectedCustomer
      );
      return {
        name: sector.name,
        count: sectorCounts[sector.uuid] || 0,
        isHighlighted: isHighlighted
      };
    }).filter(sector => sector.count > 0);


    // Setup dimensions and radius of the pie chart
    const element = this.pieChartContainer.nativeElement;
    const width = element.offsetWidth;
    const height = window.innerHeight * 0.5;
    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Clear previous SVG to prevent duplication
    d3.select(this.pieChartContainer.nativeElement).select("svg").remove();

    const svg = d3.select(this.pieChartContainer.nativeElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<Sector>().sort(null).value((d: any) => d.count);
    const path = d3.arc().outerRadius(radius).innerRadius(0);
    const label = d3.arc().outerRadius(radius).innerRadius(radius - 80);

    const arc = svg.selectAll(".arc")
      // @ts-ignore
      .data(pie(data))
      .enter().append("g")
      .attr("class", "arc");

    arc.append("path")
      .attr("d", path as any)
      // ccff02 is a color that is used to highlight the sector of the selected customer
      .attr("fill", (d: any) => (d.data as any).isHighlighted ? '#ccff02' : color(d.data.name));

    arc.append("text")
      .attr("transform", (d: any) => `translate(${label.centroid(d)})`)
      .attr("text-anchor", "middle") // Center the text
      .each(function (d) {
        const node = d3.select(this);
        // @ts-ignore
        const lines = [d.data.name, `(${d.data.count})`]; // Split name and count into two lines
        lines.forEach((line, index) => {
          node.append("tspan")
            .attr("x", 0) // Keep the tspan aligned
            .attr("dy", index === 0 ? "-0.6em" : "1.2em") // Move the first line up and the second line down
            .text(line);
        });
      });
  }
}
