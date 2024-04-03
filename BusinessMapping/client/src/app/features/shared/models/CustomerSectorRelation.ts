// src/app/shared/models/CustomerSectorRelation.ts

import { Customer } from "./Customer"; // Assuming you already have a Customer model defined
import { Sector } from "./Sector";

export interface CustomerSectorRelation {
  customerId: number;
  customer: Customer;
  sectorId: number;
  sector: Sector;
  revenue: number;
  type: 'customerSectorRelation';
}
