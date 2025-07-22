import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { User, PendingUser } from "@/types/user"

// Mock 데이터 (Supabase가 설정되지 않은 경우 사용)
const mockUsers: User[] = [
    {
        id: "user-1",
        companyCode: "1",
        userId: "admin",
        password: "admin123",
        name: "관리자",
        role: "admin",
        permissions: ["all"],
        isApproved: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: "user-2",
        companyCode: "1",
        userId: "user1",
        password: "user123",
        name: "사용자1",
        role: "user",
        permissions: ["production", "quality"],
        isApproved: true,
        createdAt: new Date().toISOString(),
    },
]

//const mockPendingUsers: PendingUser[] = []

export class UserService {
    // 로그인
    static async login(companyCode: string, userId: string, password: string): Promise<User | null> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                // Mock 데이터 사용
                const user = mockUsers.find(
                    (u) => u.companyCode === companyCode && u.userId === userId && u.password === password && u.isApproved,
                )
                return user || null
            }

            const {data, error} = await supabase
                .from("users")
                .select("*")
                .eq("company_code", companyCode)
                .eq("user_id", userId)
                .eq("password", password)
                .eq("is_approved", true)
                .single()

            if (error || !data) return null

            return {
                id: data.id,
                companyCode: data.company_code,
                userId: data.user_id,
                password: data.password,
                name: data.name,
                role: data.role,
                permissions: data.permissions || [],
                isApproved: data.is_approved,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            }
        } catch (error) {
            console.error("로그인 오류:", error)
            return null
        }
    }
}