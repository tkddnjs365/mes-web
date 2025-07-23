import {isSupabaseConfigured, supabase} from "@/lib/supabase"
import type {CompanyProgram, MenuCategory, MenuLinkProgram, Program} from "@/types/program"

// Mock 데이터
const mockPrograms: Program[] = [
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
const mockCompanyPrograms: CompanyProgram[] = []
const mockMenuCategories: MenuCategory[] = [
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
const mockMenuPrograms: MenuLinkProgram[] = []

export class ProgramService {
    // 프로그램 목록 조회
    static async getPrograms(): Promise<Program[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return mockPrograms
            }

            const {data, error} = await supabase.from("programs").select("*").order("created_at", {ascending: false})

            if (error || !data) return []

            return data.map((program) => ({
                id: program.id,
                name: program.name,
                icon: '',
                description: program.description || undefined,
                path: program.path,
                isActive: program.is_active,
                createdAt: program.created_at,
                updatedAt: program.updated_at,
            }))
        } catch {
            return []
        }
    }

    // 프로그램 생성
    static async createProgram(programData: { name: string; path: string; description: string; }): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                const newProgram: Program = {
                    id: Date.now().toString(),
                    name: programData.name,
                    description: programData.description,
                    path: programData.path,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }
                mockPrograms.push(newProgram)
                return true
            }

            const {error} = await supabase.from("programs").insert({
                name: programData.name,
                path: programData.path,
                description: programData.description,
            })

            return !error
        } catch {
            return false
        }
    }

    // 프로그램 수정`
    static async updateProgram(
        programId: string,
        programData: {
            name: string
            path: string
            description?: string
        },
    ): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                const programIndex = mockPrograms.findIndex((p) => p.id === programId)
                if (programIndex === -1) return false

                mockPrograms[programIndex] = {
                    ...mockPrograms[programIndex],
                    ...programData,
                    updatedAt: new Date().toISOString(),
                }
                return true
            }

            const {error} = await supabase
                .from("programs")
                .update({
                    name: programData.name,
                    path: programData.path,
                    description: programData.description,
                })
                .eq("id", programId)

            return !error
        } catch {
            return false
        }
    }

    // 프로그램 삭제
    static async deleteProgram(programId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                const programIndex = mockPrograms.findIndex((p) => p.id === programId)
                if (programIndex === -1) return false

                mockPrograms.splice(programIndex, 1)
                return true
            }

            const {error} = await supabase.from("programs").delete().eq("id", programId)

            return !error
        } catch {
            return false
        }
    }

    // 메뉴 카테고리 목록 조회
    static async getMenuCategories(): Promise<MenuCategory[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return mockMenuCategories
            }

            const {data, error} = await supabase
                .from("menu_categories")
                .select("*")
                .order("sort_order", {ascending: true})

            if (error || !data) return []

            return data.map((category) => ({
                id: category.id,
                name: category.name,
                description: category.description || undefined,
                sortOrder: category.sort_order,
                createdAt: category.created_at,
                updatedAt: category.updated_at,
                parentId: category.parentId,
            }))
        } catch {
            return []
        }
    }

    // 메뉴 카테고리 생성
    static async createMenuCategory(categoryData: {
        name: string
        description: string
        sortOrder: number
        parentId: string
        saveType: string
    }): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                const parentId = categoryData.saveType === "main"
                    ? Date.now().toString()
                    : categoryData.parentId;

                const newCategory: MenuCategory = {
                    id: Date.now().toString(),
                    name: categoryData.name,
                    description: categoryData.description,
                    sortOrder: categoryData.sortOrder,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    parentId: parentId,
                }
                mockMenuCategories.push(newCategory)
                return true
            }

            const {error} = await supabase.from("menu_categories").insert({
                name: categoryData.name,
                description: categoryData.description,
                sort_order: categoryData.sortOrder,
            })

            return !error
        } catch {
            return false
        }
    }

    // 중메뉴 프로그램 연결 조회
    static async getMenuLihkPrograms(menuId: string): Promise<MenuLinkProgram[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return mockMenuPrograms.filter((cp) => cp.menuId === menuId)
            }

            const {data, error} = await supabase
                .from("company_programs")
                .select("*")
                .eq("menuId", menuId)
                .order("created_at", {ascending: false})

            if (error || !data) return []

            return data.map((cp) => ({
                id: cp.id,
                menuId: cp.menuId,
                programId: cp.program_id,
                isActive: cp.is_active,
                createdAt: cp.created_at,
                updatedAt: cp.updated_at,
            }))
        } catch {
            return []
        }
    }

    // 중메뉴-프로그램 연결
    static async connectMenuProgram(menuId: string, programId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                const existing = mockMenuPrograms.find((cp) => cp.menuId === menuId && cp.programId === programId)
                if (existing) return false

                mockMenuPrograms.push({
                    id: Date.now().toString(),
                    menuId,
                    programId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                })

                console.log((mockMenuPrograms))
                return true
            }

            const {error} = await supabase.from("company_programs").insert({
                menuId: menuId,
                program_id: programId,
            })

            return !error
        } catch {
            return false
        }
    }

    // 중메뉴-프로그램 연결 해제
    static async disconnectMenuProgram(menuId: string, programId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                const index = mockMenuPrograms.findIndex(
                    (cp) => cp.menuId === menuId && cp.programId === programId,
                )
                if (index === -1) return false

                mockMenuPrograms.splice(index, 1)
                return true
            }

            const {error} = await supabase
                .from("company_programs")
                .delete()
                .eq("company_code", menuId)
                .eq("program_id", programId)

            return !error
        } catch {
            return false
        }
    }

    // 회사별 프로그램 연결 조회
    static async getCompanyPrograms(companyCode: string): Promise<CompanyProgram[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return mockCompanyPrograms.filter((cp) => cp.companyCode === companyCode)
            }

            const {data, error} = await supabase
                .from("company_programs")
                .select("*")
                .eq("company_code", companyCode)
                .order("created_at", {ascending: false})

            if (error || !data) return []

            return data.map((cp) => ({
                id: cp.id,
                companyCode: cp.company_code,
                programId: cp.program_id,
                isActive: cp.is_active,
                createdAt: cp.created_at,
                updatedAt: cp.updated_at,
            }))
        } catch {
            return []
        }
    }

    // 회사-프로그램 연결
    static async connectCompanyProgram(companyCode: string, programId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                const existing = mockCompanyPrograms.find((cp) => cp.companyCode === companyCode && cp.programId === programId)
                if (existing) return false

                mockCompanyPrograms.push({
                    id: Date.now().toString(),
                    companyCode,
                    programId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                })
                return true
            }

            const {error} = await supabase.from("company_programs").insert({
                company_code: companyCode,
                program_id: programId,
            })

            return !error
        } catch {
            return false
        }
    }

    // 회사-프로그램 연결 해제
    static async disconnectCompanyProgram(companyCode: string, programId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                const index = mockCompanyPrograms.findIndex(
                    (cp) => cp.companyCode === companyCode && cp.programId === programId,
                )
                if (index === -1) return false

                mockCompanyPrograms.splice(index, 1)
                return true
            }

            const {error} = await supabase
                .from("company_programs")
                .delete()
                .eq("company_code", companyCode)
                .eq("program_id", programId)

            return !error
        } catch {
            return false
        }
    }
}
