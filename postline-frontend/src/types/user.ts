export type Role = 'client' | 'operator' | 'admin'

export interface User {
  id: string
  fullName: string
  phone: string
  email: string
  role: Role
  branchId?: string
  isActive: boolean
}