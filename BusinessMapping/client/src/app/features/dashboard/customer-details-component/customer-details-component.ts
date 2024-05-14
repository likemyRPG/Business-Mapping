import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Customer } from '../../shared/models/Customer';
import { SharedService } from '../../shared/services/shared.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-customer-details-card',
  templateUrl: './customer-details-component.html',
  imports: [NgIf],
  standalone: true,
})
export class CustomerDetailsCardComponent implements OnInit, OnDestroy {
  selectedCustomer: Customer | null = null;
  @Input() customers: Customer[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private sharedService: SharedService) {}

  ngOnInit(): void {
    this.subscription.add(this.sharedService.currentCustomer.subscribe(customer => {
        this.selectedCustomer = customer ? this.customers.find(c => c.uuid === customer) || null : null;
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
