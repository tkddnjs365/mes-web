import {Company} from "@/types/user";
import {isSupabaseConfigured, supabase} from "@/lib/supabase";
import {mockCompanies} from "@/data/data";

export class CompanyService {
    // 회사 목록 조회 (O)
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

    // 특정 회사 목록 조회_회사코드 (O)
    static async getCompanies_code(company_code: string): Promise<Company[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return mockCompanies
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
}