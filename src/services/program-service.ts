import {isSupabaseConfigured, supabase} from "@/lib/supabase"
import type {CompanyProgram, MenuCategory, MenuLinkProgram, Program} from "@/types/program"
import {mockCompanyPrograms, mockMenuCategories, mockMenuPrograms, mockPrograms} from "@/data/data";
import {CompanyService} from "@/services/company-service";

export class ProgramService {

    // 프로그램 목록 조회 (O)
    static async getPrograms(): Promise<Program[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return mockPrograms
            }

            const {data, error} = await supabase.from("programs").select("*").order("created_at", {ascending: false})

            if (error || !data) return []

            console.log("프로그램 목록 전체 조회 : ")
            console.log(data)

            return data.map((program) => ({
                id: program.id,
                name: program.name,
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

    // 프로그램 생성 (O)
    static async createProgram(programData: { name: string; path: string; description: string; }): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                const newProgram: Program = {
                    id: Date.now().toString(),
                    name: programData.name,
                    description: programData.description,
                    path: programData.path,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }
                mockPrograms.push(newProgram)
                return true
            }

            const {error} = await supabase.from("programs").insert({
                name: programData.name,
                path: programData.path,
                description: programData.description,
            })

            return !error
        } catch {
            return false
        }
    }

    // 프로그램 수정 (O)
    static async updateProgram(
        programId: string,
        programData: {
            name: string
            path: string
            description?: string
        },
    ): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                const programIndex = mockPrograms.findIndex((p) => p.id === programId)
                if (programIndex === -1) return false

                mockPrograms[programIndex] = {
                    ...mockPrograms[programIndex],
                    ...programData,
                    updatedAt: new Date().toISOString(),
                }
                return true
            }

            const {error} = await supabase
                .from("programs")
                .update({
                    name: programData.name,
                    path: programData.path,
                    description: programData.description,
                })
                .eq("id", programId)

            return !error
        } catch {
            return false
        }
    }

    // 프로그램 삭제 (O)
    static async deleteProgram(programId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                const programIndex = mockPrograms.findIndex((p) => p.id === programId)
                if (programIndex === -1) return false

                mockPrograms.splice(programIndex, 1)
                return true
            }

            const {error} = await supabase.from("programs").delete().eq("id", programId)

            return !error
        } catch {
            return false
        }
    }

    // 메뉴 카테고리 목록 조회 (O)
    static async getMenuCategories(): Promise<MenuCategory[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return mockMenuCategories
            }

            const {data, error} = await supabase
                .from("menus")
                .select("*")
                .order("sortorder", {ascending: true})

            console.log("메뉴 전체 조회 : ")
            console.log(data)

            if (error || !data) return []

            return data.map((category) => ({
                id: category.id,
                name: category.name,
                description: category.description || undefined,
                sortOrder: category.sortorder,
                createdAt: category.created_at,
                updatedAt: category.updated_at,
                parentId: category.parent_id,
            }))
        } catch {
            return []
        }
    }

    // 메뉴 카테고리 생성 (O)
    static async createMenuCategory(categoryData: {
        name: string
        description: string
        sortOrder: number
        parentId: string
        saveType: string
    }): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                const parentId = categoryData.saveType === "main"
                    ? Date.now().toString()
                    : categoryData.parentId;

                const newCategory: MenuCategory = {
                    id: Date.now().toString(),
                    name: categoryData.name,
                    description: categoryData.description,
                    sortOrder: categoryData.sortOrder,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    parentId: parentId,
                }
                mockMenuCategories.push(newCategory)
                return true
            }

            if (categoryData.saveType === "main") {
                /* 대메뉴 일때는 id와 parent_id를 동일하게 적용 */
                const {data, error} = await supabase.from("menus").insert({
                    name: categoryData.name,
                    description: categoryData.description,
                    sortorder: categoryData.sortOrder,
                    parent_id: null
                }).select('id').single();

                if (error) {
                    console.error(error);
                    return false;
                }

                // 2. 반환된 id를 parent_id로 업데이트
                const newId = data.id;

                const {error: updateError} = await supabase.from("menus")
                    .update({parent_id: newId})
                    .eq("id", newId);

                if (updateError) {
                    console.error(updateError);
                    return false;
                }
                return !error
            } else {
                const {error} = await supabase.from("menus").insert({
                    name: categoryData.name,
                    description: categoryData.description,
                    sortorder: categoryData.sortOrder,
                    parent_id: categoryData.parentId
                });
                return !error
            }
        } catch {
            return false
        }
    }

    // 중메뉴 프로그램 연결 조회 (O)
    static async getMenuLihkPrograms(menuId: string): Promise<MenuLinkProgram[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return mockMenuPrograms.filter((cp) => cp.menuId === menuId)
            }

            const {data, error} = await supabase
                .from("menu_link_prog")
                .select("*")
                .eq("menu_idx", menuId)
                .order("created_at", {ascending: false})

            console.log("중메뉴에 연결된 프로그램 조회 : ")
            console.log(data)

            if (error || !data) return []

            return data.map((cp) => ({
                id: cp.id,
                menuId: cp.menu_idx,
                programId: cp.prog_idx,
                createdAt: cp.created_at,
                updatedAt: cp.updated_at,
            }))
        } catch {
            return []
        }
    }

    // 중메뉴-프로그램 연결 (O)
    static async connectMenuProgram(menuId: string, programId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                const existing = mockMenuPrograms.find((cp) => cp.menuId === menuId && cp.programId === programId)
                if (existing) return false

                mockMenuPrograms.push({
                    id: Date.now().toString(),
                    menuId,
                    programId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                })

                console.log((mockMenuPrograms))
                return true
            }

            const {error} = await supabase.from("menu_link_prog").insert({
                menu_idx: menuId,
                prog_idx: programId,
            })

            return !error
        } catch {
            return false
        }
    }

    // 중메뉴-프로그램 연결 해제 (O)
    static async disconnectMenuProgram(menuId: string, programId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                const index = mockMenuPrograms.findIndex(
                    (cp) => cp.menuId === menuId && cp.programId === programId,
                )
                if (index === -1) return false

                mockMenuPrograms.splice(index, 1)
                return true
            }

            const {error} = await supabase
                .from("menu_link_prog")
                .delete()
                .eq("menu_idx", menuId)
                .eq("prog_idx", programId)

            return !error
        } catch {
            return false
        }
    }

    // 회사별 프로그램 연결 조회 (O)
    static async getCompanyPrograms(companyCode: string): Promise<CompanyProgram[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return mockCompanyPrograms.filter((cp) => cp.companyCode === companyCode)
            }

            const {data, error} = await supabase
                .from("v_prog_company")
                .select("*")
                .eq("company_code", companyCode)
                .order("created_at", {ascending: false})

            if (error || !data) return []

            return data.map((cp) => ({
                id: cp.link_idx,
                companyCode: cp.company_code,
                programId: cp.prog_idx,
                createdAt: cp.created_at,
                updatedAt: cp.updated_at,
            }))
        } catch {
            return []
        }
    }

    // 회사-프로그램 연결 (O)
    static async connectCompanyProgram(companyCode: string, programId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                const existing = mockCompanyPrograms.find((cp) => cp.companyCode === companyCode && cp.programId === programId)
                if (existing) return false

                mockCompanyPrograms.push({
                    id: Date.now().toString(),
                    companyCode,
                    programId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                })
                return true
            }

            // 회사 정보 가져오기
            const comp_data = await CompanyService.getCompanies_code(companyCode)
            if (!comp_data) {
                console.error("회사 조회 실패:", comp_data);
                return false;
            }

            const company_idx = comp_data[0].id;

            const {error} = await supabase.from("prog_link_company").insert({
                company_idx: company_idx,
                prog_idx: programId,
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

            // 회사 정보 가져오기
            const comp_data = await CompanyService.getCompanies_code(companyCode)
            if (!comp_data) {
                console.error("회사 조회 실패:", comp_data);
                return false;
            }

            const company_idx = comp_data[0].id;

            const {error} = await supabase
                .from("prog_link_company")
                .delete()
                .eq("company_idx", company_idx)
                .eq("prog_idx", programId)

            return !error
        } catch {
            return false
        }
    }
}
