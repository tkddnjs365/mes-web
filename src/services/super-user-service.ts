import {isSupabaseConfigured, supabase} from "@/lib/supabase"
import type {Company, CompanyAdmin, SuperUser} from "@/types/user"

// Mock 데이터 (Supabase가 설정되지 않은 경우 사용)
const mockSuperUsers: SuperUser[] = [
    {
        id: "super-1",
        userId: "1",
        password: "1",
        name: "슈퍼관리자",
        permissions: ["all"],
        role: "super",
    },
]

const mockCompanies: Company[] = [
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

const mockCompanyAdmins: CompanyAdmin[] = [
    {
        id: "admin-1",
        companyCode: "COMP001",
        userId: "admin",
        password: "admin123",
        name: "관리자",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
]

export class SuperUserService {
    // 슈퍼유저 로그인
    static async loginSuperUser(userId: string, password: string): Promise<SuperUser | null> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                // Mock 데이터 사용
                const superUser = mockSuperUsers.find((u) => u.userId === userId && u.password === password)
                return superUser || null
            }

            const {data, error} = await supabase
                .from("super_users")
                .select("*")
                .eq("user_id", userId)
                .eq("password", password)
                .single()

            if (error || !data) return null

            return {
                id: data.id,
                userId: data.user_id,
                password: data.password,
                name: data.name,
                permissions: data.permissions || [],
                role: data.role,
            }
        } catch (error) {
            console.error("슈퍼유저 로그인 오류:", error)
            return null
        }
    }

    // 회사 관리자 목록 조회
    static async getCompanyAdmins(companyCode: string): Promise<CompanyAdmin[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return mockCompanyAdmins.filter((cp) => cp.companyCode === companyCode)
            }

            const {data, error} = await supabase
                .from("company_admins")
                .select("*")
                .order("created_at", {ascending: false})

            if (error || !data) return []

            return data.map((admin) => ({
                id: admin.id,
                companyCode: admin.company_code,
                userId: admin.user_id,
                password: admin.password,
                name: admin.name,
                isActive: admin.is_active,
                createdAt: admin.created_at,
                updatedAt: admin.updated_at,
            }))
        } catch (error) {
            console.error("회사 관리자 목록 조회 오류:", error)
            return []
        }
    }

    // 회사 목록 조회
    static async getCompanies(): Promise<Company[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return mockCompanies
            }

            const {data, error} = await supabase.from("companies").select("*").order("created_at", {ascending: false})

            if (error || !data) return []

            return data.map((company) => ({
                id: company.id,
                code: company.code,
                name: company.name,
                isActive: company.is_active,
                createdAt: company.created_at,
                updatedAt: company.updated_at,
                description: company.description,
            }))
        } catch (error) {
            console.error("회사 목록 조회 오류:", error)
            return []
        }
    }

    // 회사 추가
    static async createCompany(companyData: { code: string; name: string; description: string }): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                // Mock 데이터 사용
                const existingCompany = mockCompanies.find((c) => c.code === companyData.code)
                if (existingCompany) return false

                mockCompanies.push({
                    id: Date.now().toString(),
                    code: companyData.code,
                    name: companyData.name,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    description: companyData.description,
                })
                return true
            }

            const {error} = await supabase.from("companies").insert({
                code: companyData.code,
                name: companyData.name,
            })

            return !error
        } catch (error) {
            console.error("회사 추가 오류:", error)
            return false
        }
    }

    // 회사 관리자 추가
    static async createCompanyAdmin(adminData: {
        companyCode: string;
        userId: string;
        password: string;
        name: string
    }): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                // Mock 데이터 사용
                const existingAdmin = mockCompanyAdmins.find(
                    (a) => a.companyCode === adminData.companyCode && a.userId === adminData.userId,
                )
                if (existingAdmin) return false

                mockCompanyAdmins.push({
                    id: Date.now().toString(),
                    companyCode: adminData.companyCode,
                    userId: adminData.userId,
                    password: adminData.password,
                    name: adminData.name,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                })
                return true
            }

            // company_admins 테이블에 추가
            const {error: adminError} = await supabase.from("company_admins").insert({
                company_code: adminData.companyCode,
                user_id: adminData.userId,
                password: adminData.password,
                name: adminData.name,
            })

            if (adminError) return false

            // users 테이블에도 추가 (로그인을 위해)
            const {error: userError} = await supabase.from("users").insert({
                company_code: adminData.companyCode,
                user_id: adminData.userId,
                password: adminData.password,
                name: adminData.name,
                role: "admin",
                permissions: ["all"],
                is_approved: true,
            })

            return !userError
        } catch (error) {
            console.error("회사 관리자 추가 오류:", error)
            return false
        }
    }

    // 회사 관리자 삭제
    static async deleteCompanyAdmin(adminId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                // Mock 데이터 사용
                const adminIndex = mockCompanyAdmins.findIndex((a) => a.id === adminId)
                if (adminIndex === -1) return false

                mockCompanyAdmins.splice(adminIndex, 1)
                return true
            }

            // 먼저 관리자 정보 조회
            const {data: admin, error: fetchError} = await supabase
                .from("company_admins")
                .select("*")
                .eq("id", adminId)
                .single()

            if (fetchError || !admin) return false

            // company_admins 테이블에서 삭제
            const {error: adminError} = await supabase.from("company_admins").delete().eq("id", adminId)

            if (adminError) return false

            // users 테이블에서도 삭제
            const {error: userError} = await supabase
                .from("users")
                .delete()
                .eq("company_code", admin.company_code)
                .eq("user_id", admin.user_id)
                .eq("role", "admin")

            return !userError
        } catch (error) {
            console.error("회사 관리자 삭제 오류:", error)
            return false
        }
    }
}