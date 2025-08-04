import {isSupabaseConfigured, supabase} from "@/lib/supabase"
import {Company_Admin, SuperUser} from "@/types/user"
import {CompanyService} from "@/services/company-service";
import bcrypt from "bcryptjs";

// 비밀번호 해싱
const saltRounds = 10;

export class SuperUserService {

    // 슈퍼유저 로그인 (O)
    static async loginSuperUser(userId: string, password: string): Promise<SuperUser | null> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return null
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
                user_id: data.user_id,
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

    // 회사 추가 (O)
    static async createCompany(companyData: { code: string; name: string; description: string }): Promise<boolean> {
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
    static async createCompanyAdmin(adminData: {
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
            const comp_data = await CompanyService.getCompanies_code(adminData.companyCode)
            if (!comp_data) {
                console.error("회사 조회 실패:", comp_data);
                return false;
            }

            const company_idx = comp_data[0].id;
            const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

            // users 테이블에도 추가 (로그인을 위해)
            const {error: userError} = await supabase.from("users").insert({
                user_id: adminData.userId,
                password: hashedPassword,
                name: adminData.name,
                role: "admin",
                permissions: JSON.stringify(["all"]),
                is_approved: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                company_idx: company_idx
            })

            return !userError
        } catch (error) {
            console.error("회사 관리자 추가 오류:", error)
            return false
        }
    }

    // 회사 관리자 목록 조회 (O)
    static async getCompanyAdmins(companyCode: string): Promise<Company_Admin[]> {
        try {
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
                user_idx: user.user_idx,
                user_id: user.user_id,
                name: user.name,
                createdAt: user.created_at,
                company_idx: user.companies?.[0]?.id ?? null, // ← 배열에서 첫 번째 접근
                company_code: user.companies?.[0]?.code ?? null,
            }));

        } catch (error) {
            console.error("회사 관리자 목록 조회 오류:", error)
            return []
        }
    }

    // 회사 관리자 삭제 (O)
    static async deleteCompanyAdmin(adminId: string): Promise<boolean> {
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
