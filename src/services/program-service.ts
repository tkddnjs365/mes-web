import {isSupabaseConfigured, supabase} from "@/lib/supabase"
import type {CompanyProgram, Program} from "@/types/program"

// Mock 데이터
const mockPrograms: Program[] = [
    {
        id: '1',
        name: '1프로그램명',
        icon: '',
        description: 'program.description || undefined',
        path: 'program.path',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
      {
        id: '2',
        name: '프로그램명2',
        icon: '',
        description: '222222',
        path: 'program.path',
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
      {
        id: '3',
        name: '프로그램명3',
        icon: '',
        description: '222222',
        path: 'program.path',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
]
const mockCompanyPrograms: CompanyProgram[] = []

export class ProgramService {
    // 프로그램 목록 조회
    static async getPrograms(): Promise<Program[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return mockPrograms
            }

            const {data, error} = await supabase.from("programs").select("*").order("created_at", {ascending: false})

            if (error || !data) return []

            return data.map((program) => ({
                id: program.id,
                name: program.name,
                icon: '',
                description: program.description || undefined,
                path: program.path,
                isActive: program.is_active,
                createdAt: program.created_at,
                updatedAt: program.updated_at,
            }))
        } catch {
            return []
        }
    }

    // 회사별 프로그램 연결 조회
    static async getCompanyPrograms(companyCode: string): Promise<CompanyProgram[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return mockCompanyPrograms.filter((cp) => cp.companyCode === companyCode)
            }

            const {data, error} = await supabase
                .from("company_programs")
                .select("*")
                .eq("company_code", companyCode)
                .order("created_at", {ascending: false})

            if (error || !data) return []

            return data.map((cp) => ({
                id: cp.id,
                companyCode: cp.company_code,
                programId: cp.program_id,
                isActive: cp.is_active,
                createdAt: cp.created_at,
                updatedAt: cp.updated_at,
            }))
        } catch {
            return []
        }
    }

    // 회사-프로그램 연결
    static async connectCompanyProgram(companyCode: string, programId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                const existing = mockCompanyPrograms.find((cp) => cp.companyCode === companyCode && cp.programId === programId)
                if (existing) return false

                mockCompanyPrograms.push({
                    id: Date.now().toString(),
                    companyCode,
                    programId,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                })
                return true
            }

            const {error} = await supabase.from("company_programs").insert({
                company_code: companyCode,
                program_id: programId,
            })

            return !error
        } catch {
            return false
        }
    }

    // 회사-프로그램 연결 해제
    static async disconnectCompanyProgram(companyCode: string, programId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                const index = mockCompanyPrograms.findIndex(
                    (cp) => cp.companyCode === companyCode && cp.programId === programId,
                )
                if (index === -1) return false

                mockCompanyPrograms.splice(index, 1)
                return true
            }

            const {error} = await supabase
                .from("company_programs")
                .delete()
                .eq("company_code", companyCode)
                .eq("program_id", programId)

            return !error
        } catch {
            return false
        }
    }
}
