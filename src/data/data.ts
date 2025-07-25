import {Company, Company_Admin, PendingUser, SuperUser, User} from "@/types/user"
import type {CompanyProgram, MenuCategory, MenuLinkProgram, Program} from "@/types/program";

/* users */
export const mockUsers: User[] = [
    {
        id: "user-1",
        company_idx: "comp-1",
        user_id: "admin",
        password: "admin",
        name: "관리자",
        role: "admin",
        permissions: ["all"],
        isApproved: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: "user-2",
        company_idx: "comp-1",
        user_id: "user1",
        password: "user123",
        name: "사용자1",
        role: "user",
        permissions: ["production", "quality"],
        isApproved: true,
        createdAt: new Date().toISOString(),
    },
]

/* pendings */
export const mockPendingUsers: PendingUser[] = []

/* super_users */
export const mockSuperUsers: SuperUser[] = [
    {
        id: "super-1",
        user_id: "1",
        password: "1",
        name: "슈퍼관리자",
        permissions: ["all"],
        role: "super",
    },
]

/* companies */
export const mockCompanies: Company[] = [
    {
        id: "comp-1",
        code: "COMP001",
        name: "테스트 회사",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: '테스트 회사 desc',
    },
]

export const mockCompanyAdmins: Company_Admin[] = []

/* programs */
export const mockPrograms: Program[] = [
    {
        id: '1',
        name: '1프로그램명',
        description: 'program.description || undefined',
        path: 'program.path',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '2',
        name: '프로그램명2',
        description: '222222',
        path: 'program.path',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '3',
        name: '프로그램명3',
        description: '222222',
        path: 'program.path',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
]


export const mockCompanyPrograms: CompanyProgram[] = []

/* menus */
export const mockMenuCategories: MenuCategory[] = [
    {
        id: "1",
        name: "1번 이름",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: "1 설명",
        sortOrder: 1,
        parentId: "1",
    },
    {
        id: "2",
        name: "2번 이름",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: "2 설명",
        sortOrder: 2,
        parentId: "2",
    },
    {
        id: "3",
        name: "3번 이름",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: "3 설명",
        sortOrder: 3,
        parentId: "3",
    },
    {
        id: "4",
        name: "4번 이름",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: "4 설명",
        sortOrder: 1,
        parentId: "1",
    }
]

export const mockMenuPrograms: MenuLinkProgram[] = []