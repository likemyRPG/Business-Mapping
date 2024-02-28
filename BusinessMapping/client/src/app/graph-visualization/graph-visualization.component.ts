import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import {GraphDataService} from "../services/graph-data.service";

@Component({
  selector: 'app-graph-visualization',
  template: `
    <div #graphContainer class="graph-container"></div>
  `,
  standalone: true,
  styleUrls: ['./graph-visualization.component.css']
})
export class GraphVisualizationComponent implements OnInit {
  @ViewChild('graphContainer', { static: true }) graphContainer: ElementRef | undefined;

  constructor(private graphDataService: GraphDataService) { }

  ngOnInit(): void {
    this.graphDataService.getGraphData().subscribe(data => {
      this.createGraph(data);
    });
  }

  createGraph(graphData: any): void {
    // @ts-ignore
    const element = this.graphContainer.nativeElement;
    const svg = d3.select(element).append('svg')
      .attr('width', '100%')
      .attr('height', 500); // Set to your preferred height

    // Add your D3 code here

    // Example code to add a circle
    svg.append('circle')
      .attr('cx', 100)
      .attr('cy', 100)
      .attr('r', 50)
      .attr('fill', 'red');

    // Example code to add text

    svg.append('text')
      .attr('x', 200)
      .attr('y', 200)
      .text('Hello, D3!')
      .attr('fill', 'blue');
  }
}
