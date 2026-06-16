export interface StockItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentQuantity: number;
  maxCapacity: number;
  minQuantity: number;
  minAlert: number;
  yieldRule?: any;
}
