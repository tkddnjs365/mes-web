import {isSupabaseConfigured, supabase} from "@/lib/supabase"
import type {PendingUser, User} from "@/types/user"
import type {ProgramWithDetails} from "@/types/program"
import {CompanyService} from "@/services/company-service";
import bcrypt from "bcryptjs";
import {ProgramService} from "@/services/program-service";

// 비밀번호 해싱
const saltRounds = 10;

interface LoginResponse {
    success: boolean;
    message: string;
    accessToken: string;
    refreshToken: string;
    user: User;
}

export class UserService {

    /* 로그인 */
    static login = async (companyCode: string, userId: string, password: string): Promise<User | null> => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({userId, password}),
                }
            );

            if (!res.ok) {
                console.error("로그인 실패:", res.statusText);
                return null;
            }

            const data: LoginResponse = await res.json();

            return data.user;
        } catch (err) {
            console.error("API 호출 오류:", err);
            return null;
        }
    };

    /* 회사별 연결된 프로그램 전체 목록 */
    static async getCompanyPrograms(companyIdx: string): Promise<ProgramWithDetails[]> {
        try {
            const resPrograms = await ProgramService.getCompanyPrograms(companyIdx);

            const compProg: ProgramWithDetails[] = resPrograms.map((prog) => ({
                id: prog.id,
                programId: prog.programId,
            }))

            return compProg
        } catch (error) {
            console.error("회사 프로그램 조회 오류:", error)
            return []
        }
    }







    static async getUserPrograms(userId: string, companyCode: string): Promise<ProgramWithDetails[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return []
            }

            const {data, error} = await supabase
                .from("user_programs")
                .select("program_id")
                .eq("userId", userId)
                .eq("is_active", true)

            if (error || !data) return []

            return data.map((item) => item.program_id)
        } catch (error) {
            console.error("사용자 프로그램 조회 오류:", error)
            return []
        }
    }


    ///// supabase 연동 //////
    // 로그인 (O)
    /*
    static async login(companyCode: string, userId: string, password: string): Promise<User | null> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return null
            }

            const {data, error} = await supabase
                .from("v_user_company")
                .select("*")
                .eq("company_code", companyCode)
                .eq("userId", userId)
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
                id: data.userIdx,
                userId: data.userId,
                name: data.name,
                role: data.role,
                companyIdx: data.companyIdx,
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
    */

    // 사용자별 프로그램 조회
    /*
    static async getUserPrograms(userId: string, companyCode: string): Promise<ProgramWithDetails[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return []
            }

            const {data, error} = await supabase
                .from("user_programs")
                .select("program_id")
                .eq("userId", userId)
                .eq("is_active", true)

            if (error || !data) return []

            return data.map((item) => item.program_id)
        } catch (error) {
            console.error("사용자 프로그램 조회 오류:", error)
            return []
        }
    }
     */


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
                userId: signupData.userId,
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
    static async getPendingUsers(companyIdx?: string): Promise<PendingUser[]> {
        try {
            if (!isSupabaseConfigured || !supabase || !companyIdx) {
                return []
            }

            // 회사 정보 가져오기
            const comp_data = await CompanyService.getCompanies_idx(companyIdx)
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
                userId: user.userId,
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
    static async getApprovedUsers(companyIdx?: string): Promise<User[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return []
            }

            let query = supabase
                .from("users")
                .select("*");

            if (companyIdx) {
                query = query.eq("companyIdx", companyIdx)
            }

            const {data, error} = await query.order("created_at", {ascending: false})

            if (error || !data) return []

            return data.map((user) => ({
                id: user?.id,
                companyIdx: user?.companyIdx,
                userId: user?.userId,
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
                .eq("companyIdx", comp_data[0].id)
                .eq("userId", pendingUser.userId);
            if (Array.isArray(userSelect) && userSelect.length > 0) {
                alert("동일한 사용자가 이미 추가 되어있습니다.")
                return false;
            }

            const hashedPassword = await bcrypt.hash(pendingUser.password, saltRounds);

            // users 테이블에 추가
            const {error: userError} = await supabase.from("users").insert({
                userId: pendingUser.userId,
                password: hashedPassword,
                name: pendingUser.name,
                role: "user",
                permissions: [],
                is_approved: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                companyIdx: comp_data[0].id,
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

    // 회사별 프로그램 조회
    static async getCompanyPrograms_bak(companyIdx: string): Promise<ProgramWithDetails[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return []
            }

            const {data, error} = await supabase
                .from("v_prog_company")
                .select("prog_idx, link_idx")
                .eq("companyIdx", companyIdx)

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