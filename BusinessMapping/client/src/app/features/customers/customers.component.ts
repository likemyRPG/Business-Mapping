import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { CustomerService } from "../shared/services/customer.service";
import { Customer } from "../shared/models/Customer";
import {LoadingComponent} from "../shared/components/loading/loading.component";
import {CommonModule, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [NgIf, NgForOf, CommonModule, LoadingComponent],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit, AfterViewInit {
  @ViewChild('chart')
  chartContainer: ElementRef | undefined;
  customers: Customer[] = [];
  loading = false;

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.loadCustomers();
  }

  ngAfterViewInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loading = true;
    this.customerService.getAllCustomers().subscribe((data: Customer[]) => {
      this.customers = data;
      this.loading = false;
      this.createChart();
    });
  }

  createChart(): void {
    // @ts-ignore
    const element = this.chartContainer.nativeElement;
    const data = this.customers.map(customer => customer.revenue);
    const svg = d3.select(element).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', 500);

    svg.selectAll('rect')
      .data(data)
      .enter().append('rect')
      .attr('x', (d, i) => i * 60)
      .attr('y', d => 500 - d / 1000) // Scale the bar height
      .attr('width', 50)
      .attr('height', d => d / 1000)
      .attr('fill', 'blue');

    svg.selectAll('text')
      .data(data)
      .enter().append('text')
      .text(d => d)
      .attr('x', (d, i) => i * 60)
      .attr('y', d => 500 - d / 1000 - 3);
  }
}
