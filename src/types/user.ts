/* users ( 사용자 정보 ) */
export interface User {
  id: string
  company_idx: string
  user_id: string
  name: string
  role: "admin" | "user" | "super"
  permissions: string[]
  isApproved: boolean
  createdAt: string
  updatedAt?: string
}

/* super_users ( 슈퍼관리자 정보 )  */
export interface SuperUser {
  id: string
  user_id: string
  name: string
  permissions: string[]
  role: "super"
}

/* companies ( 회사 정보 ) */
export interface Company {
  id: string
  code: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  description: string
}

export interface Company_Admin {
  user_idx: string
  company_idx: string
  name: string
  user_id: string
  createdAt: string
  company_code: string
}

/* pending_users ( 회원가입 요청 사용자 ) */
export interface PendingUser {
  id: string
  company_code: string
  user_id: string
  password: string
  name: string
  createdAt: string
}
