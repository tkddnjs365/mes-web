export interface User {
  id: string
  companyCode: string
  userId: string
  password: string
  name: string
  role: "admin" | "user" | "super"
  permissions: string[]
  isApproved: boolean
  createdAt: string
  updatedAt?: string
}

export interface SuperUser {
  id: string
  userId: string
  password: string
  name: string
  permissions: string[]
}

export interface Company {
  id: string
  code: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CompanyAdmin {
  id: string
  companyCode: string
  userId: string
  password: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PendingUser {
  id: string
  companyCode: string
  userId: string
  password: string
  name: string
  createdAt: string
}
