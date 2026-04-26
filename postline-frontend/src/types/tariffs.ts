import { type JSX } from 'react';

export type TariffPlan = {
  title: string;
  icon: JSX.Element;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
};

export interface Tariff {
  id: string | number;
  from: string;
  to: string;
  type: string;
  size: string;
  basePrice: string | number;
  perKg: string | number;
}

export interface BackendTariff {
  id: string | number;
  cityFrom?: string;
  city_from?: string;
  cityTo?: string;
  city_to?: string;
  shipmentType?: string;
  shipment_type?: string;
  sizeCategory?: string;
  size_category?: string;
  basePrice?: string | number;
  base_price?: string | number;
  pricePerKg?: string | number;
  price_per_kg?: string | number;
}

export interface ApiResponse {
  data?: BackendTariff[];
  message?: string;
}

export interface BackendTariffRecord {
  id: number;
  city_from: string;
  city_to: string;
  shipment_type: string;
  size_category: string;
  base_price: string;
  price_per_kg: string;
}
