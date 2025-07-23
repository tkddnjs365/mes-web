export interface Program {
  id: string
  name: string
  description: string
  icon: string
  path: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Menu {
  id: string
  programId: string
  name: string
  path: string
  icon: string
  parentId?: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
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
  isActive: boolean
  createdAt: string
  updatedAt: string
}
