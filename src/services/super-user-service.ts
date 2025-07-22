import {isSupabaseConfigured, supabase} from "@/lib/supabase"
import type {SuperUser} from "@/types/user"

// Mock 데이터 (Supabase가 설정되지 않은 경우 사용)
const mockSuperUsers: SuperUser[] = [
    {
        id: "super-1",
        userId: "super0000",
        password: "0000super",
        name: "슈퍼관리자",
        permissions: ["all"],
    },
]

/*
const mockCompanies: Company[] = [
  {
    id: "comp-1",
    code: "COMP001",
    name: "테스트 회사",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
*/

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
            }
        } catch (error) {
            console.error("슈퍼유저 로그인 오류:", error)
            return null
        }
    }
}