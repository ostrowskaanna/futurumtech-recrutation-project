import { Campaign } from "./campaign";

export interface Product {
    id: number;
    name: string;
    campaigns: Campaign[];
  }