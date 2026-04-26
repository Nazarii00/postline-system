
export interface Department {
  id: number;
  city: string;
  address: string;
  type: string;
  phone: string | null;
  opening_time: string | null;
  closing_time: string | null;
  deleted_at?: string | null;
}
