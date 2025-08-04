import {isSupabaseConfigured, supabase} from "@/lib/supabase"
import type {PendingUser, User} from "@/types/user"
import type {ProgramWithDetails} from "@/types/program"
import {CompanyService} from "@/services/company-service";
import bcrypt from "bcryptjs";

// 비밀번호 해싱
const saltRounds = 10;

export class UserService {
    // 로그인 (O)
    static async login(companyCode: string, userId: string, password: string): Promise<User | null> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return null
            }

            const {data, error} = await supabase
                .from("v_user_company")
                .select("*")
                .eq("company_code", companyCode)
                .eq("user_id", userId)
                .maybeSingle();

            if (error || !data) {
                console.error("사용자 조회 실패:", error);
                return null
            } else {
                // 암호화된 비밀번호 비교
                const isMatch = await bcrypt.compare(password, data.password);

                if (isMatch) {
                    console.log("로그인 성공!");
                } else {
                    console.log("비밀번호 불일치");
                    return null
                }
            }

            return {
                id: data.user_idx,
                user_id: data.user_id,
                name: data.name,
                role: data.role,
                company_idx: data.company_idx,
                permissions: data.permissions || [],
                isApproved: data.is_approved,
                createdAt: data.user_created_at,
                updatedAt: data.user_updated_at,
            }
        } catch (error) {
            console.error("로그인 오류:", error)
            return null
        }
    }

    // 회원가입 요청 (O)
    static async requestSignup(signupData: {
        companyCode: string
        userId: string
        password: string
        name: string
    }): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return false
            }

            console.log(signupData)
            const {error} = await supabase.from("pending_users").insert({
                company_code: signupData.companyCode,
                user_id: signupData.userId,
                password: signupData.password,
                name: signupData.name,
                created_at: new Date().toISOString(),
            })

            return !error
        } catch (error) {
            console.error("회원가입 요청 오류:", error)
            return false
        }
    }

    // 대기 중인 사용자 목록 조회 (O)
    static async getPendingUsers(company_idx?: string): Promise<PendingUser[]> {
        try {
            if (!isSupabaseConfigured || !supabase || !company_idx) {
                return []
            }

            // 회사 정보 가져오기
            const comp_data = await CompanyService.getCompanies_idx(company_idx)
            if (!comp_data) {
                console.error("회사 조회 실패:", comp_data);
                return []
            }

            const {
                data,
                error
            } = await supabase.from("pending_users").select("*").eq("company_code", comp_data[0].code).order("created_at", {ascending: false})

            if (error || !data) return []

            return data.map((user) => ({
                id: user.id,
                company_code: user.company_code,
                user_id: user.user_id,
                password: user.password,
                name: user.name,
                createdAt: user.created_at,
            }))
        } catch (error) {
            console.error("대기 사용자 목록 조회 오류:", error)
            return []
        }
    }

    // 승인된 사용자 목록 조회 (O)
    static async getApprovedUsers(company_idx?: string): Promise<User[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return []
            }

            let query = supabase
                .from("users")
                .select("*");

            if (company_idx) {
                query = query.eq("company_idx", company_idx)
            }

            const {data, error} = await query.order("created_at", {ascending: false})

            if (error || !data) return []

            return data.map((user) => ({
                id: user?.id,
                company_idx: user?.company_idx,
                user_id: user?.user_id,
                password: user?.password,
                name: user?.name,
                role: user?.role,
                permissions: user?.permissions || [],
                isApproved: user?.is_approved,
                createdAt: user?.created_at,
                updatedAt: user?.updated_at,
            }));
        } catch (error) {
            console.error("승인 사용자 목록 조회 오류:", error)
            return []
        }
    }

    // 사용자 승인 (O)
    static async approveUser(pendingUserId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return false
            }

            // 대기 사용자 정보 조회
            const {data: pendingUser, error: fetchError} = await supabase
                .from("pending_users")
                .select("*")
                .eq("id", pendingUserId)
                .single()

            if (fetchError || !pendingUser) return false

            // 회사 정보 가져오기
            const comp_data = await CompanyService.getCompanies_code(pendingUser.company_code)
            if (!comp_data) {
                console.error("회사 조회 실패:", comp_data);
                return false;
            }

            const {data: userSelect} = await supabase
                .from("users")
                .select("*")
                .eq("company_idx", comp_data[0].id)
                .eq("user_id", pendingUser.user_id);
            if (Array.isArray(userSelect) && userSelect.length > 0) {
                alert("동일한 사용자가 이미 추가 되어있습니다.")
                return false;
            }

            const hashedPassword = await bcrypt.hash(pendingUser.password, saltRounds);

            // users 테이블에 추가
            const {error: userError} = await supabase.from("users").insert({
                user_id: pendingUser.user_id,
                password: hashedPassword,
                name: pendingUser.name,
                role: "user",
                permissions: [],
                is_approved: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                company_idx: comp_data[0].id,
            })

            if (userError) return false

            // pending_users 테이블에서 삭제
            const {error: deleteError} = await supabase.from("pending_users").delete().eq("id", pendingUserId)

            return !deleteError
        } catch (error) {
            console.error("사용자 승인 오류:", error)
            return false
        }
    }

    // 사용자 거부 (O)
    static async rejectUser(pendingUserId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return false
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
                return false
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
                return []
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
    static async getCompanyPrograms(company_idx: string): Promise<ProgramWithDetails[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return []
            }

            const {data, error} = await supabase
                .from("v_prog_company")
                .select("prog_idx, link_idx")
                .eq("company_idx", company_idx)

            if (error || !data) return []

            return data.map((item) => ({
                id: item.link_idx,
                programId: item.prog_idx
            }));
        } catch (error) {
            console.error("회사 프로그램 조회 오류:", error)
            return []
        }
    }
}