import {isSupabaseConfigured, supabase} from "@/lib/supabase"
import {Company_Admin, SuperUser, type User} from "@/types/user"
import {CompaniesService} from "@/services/companies-service";
import bcrypt from "bcryptjs";
import utilsUrl from "@/utils/utilsUrl";

// 비밀번호 해싱
const saltRounds = 10;

interface LoginResponse {
    success: boolean;
    message: string;
    accessToken: string;
    refreshToken: string;
    data: User;
}

export class SuperUserService {
    /* 로그인 */
    static loginSuperUser = async (userId: string, password: string): Promise<User | null> => {
        try {
            const res = await fetch(
                `${utilsUrl.REST_API_URL}/superUser/login`,
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
            console.log("로그인 성공:", data);
            console.log("data.data:", data.data);

            return data.data;
        } catch (err) {
            console.error("API 호출 오류:", err);
            return null;
        }
    };

    /* 회사 추가 */
    static async createCompany(companyData: { code: string; name: string; description: string }): Promise<boolean> {
        try {
            const res = await fetch(`${utilsUrl.REST_API_URL}/superUser/createCompany`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(companyData),
            });

            if (!res.ok) {
                console.error("createCompany 실패:", res.statusText);
                return false;
            }

            return true;
        } catch (error) {
            console.error("회사 추가 오류:", error)
            return false
        }
    }

    /* 회사별 관리자 조회 */
    static async getCompanyAdmins(companyCode: string): Promise<Company_Admin[]> {
        try {
            const res = await fetch(
                `${utilsUrl.REST_API_URL}/superUser/getCompanyAdmin/${companyCode}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!res.ok) {
                console.error("API 통신 실패:", res.statusText);
                return [];
            }

            const data = await res.json();
            return data.data || [];
        } catch (error) {
            console.error("조회 오류:", error)
            return []
        }
    }

    /* 회사별 관리자 추가 */
    static async createCompanyAdmin(adminData: {
        companyCode: string;
        userId: string;
        password: string;
        name: string
    }): Promise<boolean> {
        try {
            const res = await fetch(`${utilsUrl.REST_API_URL}/superUser/createCompanyAdmin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(adminData),
            });

            if (!res.ok) {
                console.error("createCompanyAdmin 실패:", res.statusText);
                return false;
            }

            return true;
        } catch (error) {
            console.error("회사 관리자 추가 오류:", error)
            return false
        }
    }

    /* 회사별 관리자 삭제 */
    static async deleteCompanyAdmin(adminId: string): Promise<boolean> {
        try {
            const res = await fetch(`${utilsUrl.REST_API_URL}/superUser/deleteCompanyAdmin/${adminId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!isSupabaseConfigured || !supabase) {
                return false
            }

            if (!res.ok) {
                console.error("deleteCompanyAdmin 실패:", res.statusText);
                return false;
            }

            return true;
        } catch (error) {
            console.error("회사 관리자 삭제 오류:", error)
            return false
        }
    }


    ///// supabase 연동 //////
    // 슈퍼유저 로그인 (O)
    static async loginSuperUser_bak(userId: string, password: string): Promise<SuperUser | null> {
        try {
            return null
            /*
            if (!isSupabaseConfigured || !supabase) {
                return null
            }

            const {data, error} = await supabase
                .from("super_users")
                .select("*")
                .eq("userId", userId)
                .eq("password", password)
                .single()

            if (error || !data) return null

            return {
                id: data.id,
                userId: data.userId,
                name: data.name,
                permissions: data.permissions || [],
                role: data.role,
            }
             */
        } catch (error) {
            console.error("슈퍼유저 로그인 오류:", error)
            return null
        }
    }

    // 회사 추가 (O)
    static async createCompany_bak(companyData: { code: string; name: string; description: string }): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return false
            }

            const {error} = await supabase.from("companies").insert({
                code: companyData.code,
                name: companyData.name,
                description: companyData.description,
            })

            return !error
        } catch (error) {
            console.error("회사 추가 오류:", error)
            return false
        }
    }

    // 회사 관리자 추가 (O)
    static async createCompanyAdmin_bak(adminData: {
        companyCode: string;
        userId: string;
        password: string;
        name: string
    }): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return false
            }

            // 회사 정보 가져오기
            const comp_data = await CompaniesService.getCompanies_code(adminData.companyCode)
            if (!comp_data) {
                console.error("회사 조회 실패:", comp_data);
                return false;
            }

            const companyIdx = comp_data[0].id;
            const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

            // users 테이블에도 추가 (로그인을 위해)
            const {error: userError} = await supabase.from("users").insert({
                userId: adminData.userId,
                password: hashedPassword,
                name: adminData.name,
                role: "admin",
                permissions: JSON.stringify(["all"]),
                is_approved: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                companyIdx: companyIdx
            })

            return !userError
        } catch (error) {
            console.error("회사 관리자 추가 오류:", error)
            return false
        }
    }

    // 회사 관리자 목록 조회 (O)
    static async getCompanyAdmins_bak(companyCode: string): Promise<Company_Admin[]> {
        try {
            return []
            /*
            if (!isSupabaseConfigured || !supabase) {
                return []
            }

            const {data, error} = await supabase
                .from("v_user_company")
                .select("*")
                .eq("company_code", companyCode)
                .eq("role", "admin")
                .order("user_created_at", {ascending: false});

            console.log("회사별 관리자 조회 DATA : ")
            console.log("companyCode : " + companyCode)
            console.log(data)

            if (error || !data) return [];

            return data.map((user) => ({
                userIdx: user.userIdx,
                userId: user.userId,
                name: user.name,
                createdAt: user.created_at,
                companyIdx: user.companies?.[0]?.id ?? null, // ← 배열에서 첫 번째 접근
                company_code: user.companies?.[0]?.code ?? null,
            }));
             */
        } catch (error) {
            console.error("회사 관리자 목록 조회 오류:", error)
            return []
        }
    }

    // 회사 관리자 삭제 (O)
    static async deleteCompanyAdmin_bak(adminId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return false
            }

            // 먼저 관리자 정보 조회
            const {data: admin, error: fetchError} = await supabase
                .from("users")
                .select("*")
                .eq("id", adminId)
                .single()

            if (fetchError || !admin) return false

            // users 테이블에서도 삭제
            const {error: userError} = await supabase
                .from("users")
                .delete()
                .eq("id", adminId)
                .eq("role", "admin")

            return !userError
        } catch (error) {
            console.error("회사 관리자 삭제 오류:", error)
            return false
        }
    }
}
