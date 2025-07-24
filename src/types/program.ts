export interface Program {
  id: string
  name: string
  description: string
  path: string
  createdAt: string
  updatedAt: string
}

export interface MenuCategory {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  description: string
  sortOrder: number
  parentId: string
}

export interface UserProgram {
  id: string
  userId: string
  programId: string
  companyCode: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CompanyProgram {
  id: string
  companyCode: string
  programId: string
  createdAt: string
  updatedAt: string
}

export interface MenuLinkProgram {
  id: string
  menuId: string
  programId: string
  createdAt: string
  updatedAt: string
}

export interface ProgramWithDetails {
  id: string
  programId: number
}

