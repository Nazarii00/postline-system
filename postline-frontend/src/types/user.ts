export type Role = 'client' | 'operator' | 'courier' | 'admin';

export interface User {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  role: Role;
  departmentId: number | null;
  createdAt: string;
}

export interface UpdateProfilePayload {
  fullName: string;
  phone: string;
  email: string;
}

export interface ApiErrorResponse {
  message: string;
}