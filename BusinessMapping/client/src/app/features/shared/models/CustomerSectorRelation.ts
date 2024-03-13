// src/app/shared/models/CustomerSectorRelation.ts

import { Customer } from "./Customer"; // Assuming you already have a Customer model defined
import { Sector } from "./Sector";

export interface CustomerSectorRelation {
  id: string; // The identifier for the relationship, if applicable
  customer: Customer;
  sector: Sector;
}
