import {Routes} from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
import {CustomersComponent} from './customers/customers.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'customers', component: CustomersComponent },
];
