import {Company} from "@/types/user";
import {isSupabaseConfigured, supabase} from "@/lib/supabase";
import utilsUrl from "@/utils/utilsUrl";

export class CompaniesService {

    /* 회사 목록 전체 조회 */
    static async getCompanies(type: string): Promise<Company[]> {
        try {
            const res = await fetch(
                `${utilsUrl.REST_API_URL}/company/${type}`,
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
            console.error("회사 목록 조회 오류:", error)
            return []
        }
    }

    /* 회사코드로 회사 목록 조회 */
    static async getCompanies_code(company_code: string): Promise<Company[]> {
        try {
            const res = await fetch(
                `${utilsUrl.REST_API_URL}/company/select`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({company_code}),
                }
            );

            if (!res.ok) {
                console.error("API 통신 실패:", res.statusText);
                return [];
            }

            const data = await res.json();
            return data.data || [];
        } catch (error) {
            console.error("회사 목록 조회 오류:", error)
            return []
        }
    }

    /* 회사 IDX로 회사 목록 조회 */
    static async getCompanies_idx(company_id: string): Promise<Company[]> {
        try {
            const res = await fetch(
                `${utilsUrl.REST_API_URL}/company/select`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({company_id}),
                }
            );

            if (!res.ok) {
                console.error("API 통신 실패:", res.statusText);
                return [];
            }

            const data = await res.json();
            return data.data || [];
        } catch (error) {
            console.error("회사 목록 조회 오류:", error)
            return []
        }
    }


    ///// supabase 연동 //////
    // 회사 목록 조회 (O)
    static async getCompanies_bak(): Promise<Company[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return []
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

    // 특정 회사 목록 조회_회사코드 (O)
    static async getCompanies_code_bak(company_code: string): Promise<Company[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return []
            }

            const {data, error: companyError} = await supabase
                .from("companies")
                .select("*")
                .eq("code", company_code)

            if (companyError || !data) {
                console.error("회사 조회 실패:", companyError);
                return [];
            }

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

    // 특정 회사 목록 조회_회사ID (O)
    static async getCompanies_idx_bak(company_id: string): Promise<Company[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return []
            }

            const {data, error: companyError} = await supabase
                .from("companies")
                .select("*")
                .eq("id", company_id)

            if (companyError || !data) {
                console.error("회사 조회 실패:", companyError);
                return [];
            }

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
}