import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Customer } from '../../shared/models/Customer';
import { SharedService } from '../../shared/services/shared.service';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-customer-details-card',
  templateUrl: './customer-details-component.html',
  imports: [NgIf],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerDetailsCardComponent implements OnInit, OnDestroy {
  selectedCustomer: 'all' | Customer | null = 'all';
  @Input() customers!: Customer[];
  private subscription: Subscription = new Subscription();

  constructor(private sharedService: SharedService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subscription.add(
      this.sharedService.currentCustomer.subscribe(customer => {
        this.selectedCustomer = customer ? this.customers.find(c => c.uuid === customer) || null : 'all';
        this.cdr.markForCheck();  // Manually mark for change detection
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  isCustomer(customer: 'all' | Customer | null): customer is Customer {
    return customer !== 'all' && customer !== null;
  }
}
