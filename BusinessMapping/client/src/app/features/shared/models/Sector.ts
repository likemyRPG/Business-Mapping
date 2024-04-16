export interface Sector {
  uuid: string;
  id: string;
  name: string;
  revenue: number; // Assume sectors also have a revenue property for total sector revenue
  type: 'sector';
}
