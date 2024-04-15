export interface Project {
  uuid: string;
  name: string;
  success: boolean;
  year: number;
  status: string;
  startDate: string;
  endDate: string;
  scope: string;
  budget: number;
  onTime: boolean;
  actualCost: number;
  impact: string;
  type: 'Project';
}
