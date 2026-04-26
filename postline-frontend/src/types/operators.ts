export interface Operator {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  department_id: number | null;
  role: string;
  created_at: string;
  deleted_at: string | null;
}

export interface Department {
  id: number;
  city: string;
  address: string;
}

export type StaffRole = 'operator' | 'courier';
