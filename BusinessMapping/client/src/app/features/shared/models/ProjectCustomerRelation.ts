// src/app/shared/models/CustomerSectorRelation.ts

import {Customer} from "./Customer";
import {Project} from "./Project";

export interface ProjectCustomerRelation {
  projectId: number;
  project: Project;
  customerId: number;
  customer: Customer;
  type: 'projectCustomerRelation';
}
