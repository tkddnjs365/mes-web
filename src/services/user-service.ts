import {isSupabaseConfigured, supabase} from "@/lib/supabase"
import type {PendingUser, User} from "@/types/user"
import type {ProgramWithDetails} from "@/types/program"

// Mock 데이터 (Supabase가 설정되지 않은 경우 사용)
const mockUsers: User[] = [
    {
        id: "user-1",
        companyCode: "1000",
        userId: "admin",
        password: "admin",
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
const mockProgrmas: ProgramWithDetails[] = [
    {
        id: "production",
        programId: 10,
    },
    {
        id: "production",
        programId: 11,
    },
    {
        id: "production",
        programId: 12,
    },
    {
        id: "quality",
        programId: 15,
    },
    {
        id: "quality",
        programId: 16,
    },
    {
        id: "equipment",
        programId: 20,
    },
    {
        id: "order",
        programId: 6,
    },
    {
        id: "order",
        programId: 7,
    },
    {
        id: "order",
        programId: 8,
    },
    {
        id: "order",
        programId: 9,
    },
]
const mockProgrmas2: ProgramWithDetails[] = [
    {
        id: "order",
        programId: 6,
    },
    {
        id: "order",
        programId: 7,
    },
]
const mockPendingUsers: PendingUser[] = []

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

    // 회원가입 요청
    static async requestSignup(signupData: {
        companyCode: string
        userId: string
        password: string
        name: string
    }): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                // Mock 데이터 사용
                const existingUser = mockUsers.find(
                    (u) => u.companyCode === signupData.companyCode && u.userId === signupData.userId,
                )
                const existingPending = mockPendingUsers.find(
                    (u) => u.companyCode === signupData.companyCode && u.userId === signupData.userId,
                )

                if (existingUser || existingPending) return false

                mockPendingUsers.push({
                    id: Date.now().toString(),
                    companyCode: signupData.companyCode,
                    userId: signupData.userId,
                    password: signupData.password,
                    name: signupData.name,
                    createdAt: new Date().toISOString(),
                })
                return true
            }

            const {error} = await supabase.from("pending_users").insert({
                company_code: signupData.companyCode,
                user_id: signupData.userId,
                password: signupData.password,
                name: signupData.name,
            })

            return !error
        } catch (error) {
            console.error("회원가입 요청 오류:", error)
            return false
        }
    }

    // 대기 중인 사용자 목록 조회
    static async getPendingUsers(): Promise<PendingUser[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return mockPendingUsers
            }

            const {
                data,
                error
            } = await supabase.from("pending_users").select("*").order("created_at", {ascending: false})

            if (error || !data) return []

            return data.map((user) => ({
                id: user.id,
                companyCode: user.company_code,
                userId: user.user_id,
                password: user.password,
                name: user.name,
                createdAt: user.created_at,
            }))
        } catch (error) {
            console.error("대기 사용자 목록 조회 오류:", error)
            return []
        }
    }

    // 승인된 사용자 목록 조회
    static async getApprovedUsers(companyCode?: string): Promise<User[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return companyCode ? mockUsers.filter((u) => u.companyCode === companyCode) : mockUsers
            }

            let query = supabase.from("users").select("*").eq("is_approved", true)

            if (companyCode) {
                query = query.eq("company_code", companyCode)
            }

            const {data, error} = await query.order("created_at", {ascending: false})

            if (error || !data) return []

            return data.map((user) => ({
                id: user.id,
                companyCode: user.company_code,
                userId: user.user_id,
                password: user.password,
                name: user.name,
                role: user.role,
                permissions: user.permissions || [],
                isApproved: user.is_approved,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
            }))
        } catch (error) {
            console.error("승인 사용자 목록 조회 오류:", error)
            return []
        }
    }

    // 사용자 승인
    static async approveUser(pendingUserId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                // Mock 데이터 사용
                const pendingUserIndex = mockPendingUsers.findIndex((u) => u.id === pendingUserId)
                if (pendingUserIndex === -1) return false

                const pendingUser = mockPendingUsers[pendingUserIndex]
                mockUsers.push({
                    id: Date.now().toString(),
                    companyCode: pendingUser.companyCode,
                    userId: pendingUser.userId,
                    password: pendingUser.password,
                    name: pendingUser.name,
                    role: "user",
                    permissions: [],
                    isApproved: true,
                    createdAt: new Date().toISOString(),
                })

                mockPendingUsers.splice(pendingUserIndex, 1)
                return true
            }

            // 대기 사용자 정보 조회
            const {data: pendingUser, error: fetchError} = await supabase
                .from("pending_users")
                .select("*")
                .eq("id", pendingUserId)
                .single()

            if (fetchError || !pendingUser) return false

            // users 테이블에 추가
            const {error: insertError} = await supabase.from("users").insert({
                company_code: pendingUser.company_code,
                user_id: pendingUser.user_id,
                password: pendingUser.password,
                name: pendingUser.name,
                role: "user",
                permissions: [],
                is_approved: true,
            })

            if (insertError) return false

            // pending_users 테이블에서 삭제
            const {error: deleteError} = await supabase.from("pending_users").delete().eq("id", pendingUserId)

            return !deleteError
        } catch (error) {
            console.error("사용자 승인 오류:", error)
            return false
        }
    }

    // 사용자 거부
    static async rejectUser(pendingUserId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                // Mock 데이터 사용
                const pendingUserIndex = mockPendingUsers.findIndex((u) => u.id === pendingUserId)
                if (pendingUserIndex === -1) return false

                mockPendingUsers.splice(pendingUserIndex, 1)
                return true
            }

            const {error} = await supabase.from("pending_users").delete().eq("id", pendingUserId)

            return !error
        } catch (error) {
            console.error("사용자 거부 오류:", error)
            return false
        }
    }

    // 사용자 권한 업데이트
    static async updateUserPermissions(userId: string, permissions: string[]): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                // Mock 데이터 사용
                const userIndex = mockUsers.findIndex((u) => u.id === userId)
                if (userIndex === -1) return false

                mockUsers[userIndex].permissions = permissions
                return true
            }

            const {error} = await supabase.from("users").update({permissions}).eq("id", userId)

            return !error
        } catch (error) {
            console.error("권한 업데이트 오류:", error)
            return false
        }
    }

    // 사용자별 프로그램 조회
    static async getUserPrograms(userId: string, companyCode: string): Promise<ProgramWithDetails[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                // Mock 데이터 반환
                return mockProgrmas2
            }

            const {data, error} = await supabase
                .from("user_programs")
                .select("program_id")
                .eq("user_id", userId)
                .eq("is_active", true)

            if (error || !data) return []

            return data.map((item) => item.program_id)
        } catch (error) {
            console.error("사용자 프로그램 조회 오류:", error)
            return []
        }
    }

    // 회사별 프로그램 조회
    static async getCompanyPrograms(companyCode: string): Promise<ProgramWithDetails[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                // Mock 데이터 반환
                return mockProgrmas
            }

            const {data, error} = await supabase
                .from("company_programs")
                .select("program_id")
                .eq("company_code", companyCode)
                .eq("is_active", true)

            if (error || !data) return []

            return data.map((item) => item.program_id)
        } catch (error) {
            console.error("회사 프로그램 조회 오류:", error)
            return []
        }
    }
}