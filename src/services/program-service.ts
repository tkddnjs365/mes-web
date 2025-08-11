import {isSupabaseConfigured, supabase} from "@/lib/supabase"
import {
    CompanyProgram,
    MenuCategory,
    MenuItem,
    MenuLinkProgram,
    Prog_Menu_Company,
    ProgMenu,
    Program
} from "@/types/program"
import {CompanyService} from "@/services/company-service";
import {DashBoardMain} from "@/components/dashboard-main"

/* 프로그램 연결 */
const componentMap: Record<string, () => Promise<{ default: React.ComponentType }>> = {
    "user-mng": () => import("@/components/pages/user-mng"),
    "item-mng": () => import("@/components/pages/item-mng"),
    "item-mng-list": () => import("@/components/pages/item-mng-list"),
};

export class ProgramService {

    /* 프로그램 오픈 */
    static async getProgram_progIdx(prog_path: string): Promise<React.ComponentType | null> {
        try {
            const normalizedPath = prog_path
                .replace(".tsx", "")
                .replace("/components/pages/", "");

            if (prog_path === "dashboard") {
                return DashBoardMain
            }

            console.log("normalizedPath : " + normalizedPath)

            const loader = componentMap[normalizedPath];
            if (loader) {
                const page_moduel = await loader();
                return page_moduel.default;
            }

            alert("프로그램 정보를 확인하세요.")
            return null
        } catch {
            return null
        }
    }

    /* 프로그램 전체 조회 */
    static async getPrograms(): Promise<Program[]> {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/program`,
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
            return data.programs || [];
        } catch (error) {
            console.error("조회 오류:", error)
            return []
        }
    }

    /* 프로그램 추가 */
    static async createProgram(programData: {
        name: string;
        path: string;
        description: string;
    }): Promise<boolean> {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/program/progCreate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    progName: programData.name,
                    path: programData.path,
                    description: programData.description,
                }),

            });

            if (!res.ok) {
                console.error("createProgram 실패:", res.statusText);
                return false;
            }

            return true;
        } catch (error) {
            console.error("오류:", error)
            return false
        }
    }

    /* 프로그램 수정 */
    static async updateProgram(
        programId: string,
        programData: {
            name: string
            path: string
            description?: string
        },
    ): Promise<boolean> {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/program/progUpdate`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    programId: programId,
                    progName: programData.name,
                    path: programData.path,
                    description: programData.description,
                }),

            });

            if (!res.ok) {
                console.error("updateProgram 실패:", res.statusText);
                return false;
            }

            return true;
        } catch (error) {
            console.error("오류:", error)
            return false
        }
    }

    /* 프로그램 삭제 */
    static async deleteProgram(programId: string): Promise<boolean> {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/program/progDelete`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({programId}),
            });

            if (!res.ok) {
                console.error("deleteProgram 실패:", res.statusText);
                return false;
            }

            return true;
        } catch (error) {
            console.error("오류:", error)
            return false
        }
    }

    /* 회사별 프로그램 연결 조회 */
    static async getCompanyPrograms(companyCode: string): Promise<CompanyProgram[]> {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/program/companyProg/${companyCode}`,
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
            return data.programs || [];
        } catch (error) {
            console.error("조회 오류:", error)
            return []
        }
    }

    /* 회사-프로그램 연결 */
    static async connectCompanyProgram(companyCode: string, programId: string): Promise<boolean> {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/program/connectCompProg`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({companyCode, programId}),
            });

            if (!res.ok) {
                console.error("connectCompanyProgram 실패:", res.statusText);
                return false;
            }

            return true;
        } catch (error) {
            console.error("오류:", error)
            return false
        }
    }

    /* 회사-프로그램 연결 해제 */
    static async disconnectCompanyProgram(companyCode: string, programId: string): Promise<boolean> {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/program/disConnectCompProg`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({companyCode, programId}),
            });

            if (!res.ok) {
                console.error("disconnectCompanyProgram 실패:", res.statusText);
                return false;
            }

            return true;
        } catch (error) {
            console.error("오류:", error)
            return false
        }
    }

    /* 회사별 프로그램 목록 */
    static async getProgMenuCompany(companyIdx: string): Promise<Prog_Menu_Company[]> {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/program/progMenu/${companyIdx}`,
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
            return data.programs || [];
        } catch (error) {
            console.error("조회 오류:", error)
            return []
        }
    }

    /* 메뉴 목록 조회 */
    static async getMenuCategories(): Promise<MenuCategory[]> {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/program/menuCategory`,
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
            return data.menus || [];
        } catch (error) {
            console.error("조회 오류:", error)
            return []
        }
    }

    /* 메뉴 생성 */
    static async createMenuCategory(categoryData: {
        name: string
        description: string
        sortOrder: number
        parentId: string
        saveType: string
    }): Promise<boolean> {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/program/menuCreate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(categoryData),
                }
            );

            if (!res.ok) {
                console.error("API 통신 실패:", res.statusText);
                return false;
            }

            return true;
        } catch (error) {
            console.error("조회 오류:", error)
            return false;
        }
    }

    /* 중메뉴 프로그램 연결 조회 */
    static async getMenuLinkPrograms(menuId: string): Promise<MenuLinkProgram[]> {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/program/menuProg/${menuId}`,
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
            return data.programs || [];
        } catch (error) {
            console.error("조회 오류:", error)
            return []
        }
    }

    /* 중메뉴 프로그램 연결 */
    static async connectMenuProgram(menuId: string, programId: string): Promise<boolean> {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/program/menuProgConnect`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({menuId, programId}),
            });

            if (!res.ok) {
                console.error("connectMenuProgram 실패:", res.statusText);
                return false;
            }

            return true;
        } catch (error) {
            console.error("오류:", error)
            return false
        }
    }

    /* 중메뉴 프로그램 연결 해제 */
    static async disconnectMenuProgram(menuId: string, programId: string): Promise<boolean> {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/program/menuProgDisConnect`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({menuId, programId}),
            });

            if (!res.ok) {
                console.error("disconnectCompanyProgram 실패:", res.statusText);
                return false;
            }

            return true;
        } catch (error) {
            console.error("오류:", error)
            return false
        }
    }

    /* 사이드바 메뉴 조회 */
    static getAllMenuItems = async (): Promise<MenuItem[]> => {
        try {
            // 1. 모든 메뉴 조회
            const menus: MenuCategory[] = await this.getMenuCategories();

            // 2. 메뉴-프로그램 연결 정보와 프로그램 정보 조회
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/program/getMenuProg`,
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
            const menuPrograms: ProgMenu[] = data.programs || [];

            // 3. 데이터 가공
            const parentMenus = menus?.filter(menu => menu.id === menu.parentId) || [];
            const childMenus = menus?.filter(menu => menu.id !== menu.parentId) || [];

            // 메뉴별 프로그램 매핑
            const menuProgramMap = new Map();
            menuPrograms?.forEach(item => {
                if (!menuProgramMap.has(item.menuIdx)) {
                    menuProgramMap.set(item.menuIdx, []);
                }
                // 원본 코드와 동일한 구조로 매핑
                menuProgramMap.get(item.menuIdx).push({
                    id: item.progIdx,
                    name: item.progName,
                    path: item.progPath
                });
            });

            // 최종 구조 생성
            return parentMenus.map(parentMenu => {
                const children = childMenus
                    .filter(child => child.parentId === parentMenu.id)
                    .map(childMenu => {
                        const programs = menuProgramMap.get(childMenu.id) || [];
                        return {
                            id: childMenu.name.toLowerCase().replace(/\s+/g, ''),
                            title: childMenu.name,
                            children: programs.map((program: { id: string, name: string, path: string }) => ({
                                id: program.path,
                                title: program.name,
                                programId: program.id
                            }))
                        };
                    });

                return {
                    id: parentMenu.name.toLowerCase().replace(/\s+/g, ''),
                    title: parentMenu.name,
                    children
                };
            });

        } catch (error) {
            console.error("Error fetching menu data:", error);
            return [];
        }
    };


    ///// supabase 연동 //////

    // 사이드바 메뉴 조회
    static getAllMenuItems_bak = async (): Promise<MenuItem[]> => {

        if (!isSupabaseConfigured || !supabase) {
            return []
        }

        // 1. 모든 메뉴 조회
        const {data: menus, error: menuError} = await supabase
            .from("menus")
            .select("*")
            .order("sortorder", {ascending: true});

        // 2. 메뉴-프로그램 연결 정보와 프로그램 정보 조회
        const {data: menuPrograms, error: linkError} = await supabase
            .from("menu_link_prog")
            .select(`
            menu_idx,
            programs (
                id,
                name,
                path
            )
        `);

        if (menuError || linkError) {
            console.error("Error fetching menu data:", menuError || linkError);
            return [];
        }

        // 3. 데이터 가공
        const parentMenus = menus?.filter(menu => menu.id === menu.parent_id) || [];
        const childMenus = menus?.filter(menu => menu.id !== menu.parent_id) || [];

        // 메뉴별 프로그램 매핑
        const menuProgramMap = new Map();
        menuPrograms?.forEach(item => {
            if (!menuProgramMap.has(item.menu_idx)) {
                menuProgramMap.set(item.menu_idx, []);
            }
            menuProgramMap.get(item.menu_idx).push(item.programs);
        });

        // 최종 구조 생성
        return parentMenus.map(parentMenu => {
            const children = childMenus
                .filter(child => child.parent_id === parentMenu.id)
                .map(childMenu => {
                    const programs = menuProgramMap.get(childMenu.id) || [];
                    return {
                        id: childMenu.name.toLowerCase().replace(/\s+/g, ''),
                        title: childMenu.name,
                        children: programs.map((program: Program) => ({
                            id: program.path,
                            title: program.name,
                            programId: program.id
                        }))
                    };
                });

            return {
                id: parentMenu.name.toLowerCase().replace(/\s+/g, ''),
                title: parentMenu.name,
                children
            };
        });
    };

    // 프로그램 목록 조회 (O)
    static async getPrograms_bak(): Promise<Program[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return []
            }

            const {data, error} = await supabase.from("programs").select("*").order("created_at", {ascending: false})

            if (error || !data) return []

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
    static async createProgram_bak(programData: {
        name: string;
        path: string;
        description: string;
    }): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return false
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

    // 프로그램 오픈
    static async getProgram_progIdx_bak(prog_path: string): Promise<React.ComponentType | null> {
        try {
            const normalizedPath = prog_path
                .replace(".tsx", "")
                .replace("/components/pages/", "");

            if (prog_path === "dashboard") {
                return DashBoardMain
            }

            console.log("normalizedPath : " + normalizedPath)

            const loader = componentMap[normalizedPath];
            if (loader) {
                const page_moduel = await loader();
                return page_moduel.default;
            }

            alert("프로그램 정보를 확인하세요.")
            return null
        } catch {
            return null
        }
    }

    // 프로그램 수정 (O)
    static async updateProgram_bak(
        programId: string,
        programData: {
            name: string
            path: string
            description?: string
        },
    ): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return false
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
    static async deleteProgram_bak(programId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return false
            }

            const {error} = await supabase.from("programs").delete().eq("id", programId)

            return !error
        } catch {
            return false
        }
    }

    // 메뉴 카테고리 목록 조회 (O)
    static async getMenuCategories_bak(): Promise<MenuCategory[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return []
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
    static async createMenuCategory_bak(categoryData: {
        name: string
        description: string
        sortOrder: number
        parentId: string
        saveType: string
    }): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return false
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
    static async getMenuLihkPrograms_bak(menuId: string): Promise<MenuLinkProgram[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return []
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
    static async connectMenuProgram_bak(menuId: string, programId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return false
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
    static async disconnectMenuProgram_bak(menuId: string, programId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return false
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
    static async getCompanyPrograms_bak(companyCode: string): Promise<CompanyProgram[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return []
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
    static async connectCompanyProgram_bak(companyCode: string, programId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return false
            }

            // 회사 정보 가져오기
            const comp_data = await CompanyService.getCompanies_code(companyCode)
            if (!comp_data) {
                console.error("회사 조회 실패:", comp_data);
                return false;
            }

            const companyIdx = comp_data[0].id;

            const {error} = await supabase.from("prog_link_company").insert({
                companyIdx: companyIdx,
                prog_idx: programId,
            })

            return !error
        } catch {
            return false
        }
    }

    // 회사-프로그램 연결 해제
    static async disconnectCompanyProgram_bak(companyCode: string, programId: string): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return false
            }

            // 회사 정보 가져오기
            const comp_data = await CompanyService.getCompanies_code(companyCode)
            if (!comp_data) {
                console.error("회사 조회 실패:", comp_data);
                return false;
            }

            const companyIdx = comp_data[0].id;

            const {error} = await supabase
                .from("prog_link_company")
                .delete()
                .eq("companyIdx", companyIdx)
                .eq("prog_idx", programId)

            return !error
        } catch {
            return false
        }
    }

    // 회사별 프로그램 목록 (O)
    static async getProgMenuCompany_bak(companyIdx: string): Promise<Prog_Menu_Company[]> {
        try {

            if (!isSupabaseConfigured || !supabase) {
                return []
            }

            const {data, error} = await supabase
                .from("v_prog_menu_company")
                .select("*")
                .eq("companyIdx", companyIdx)

            if (error || !data) return []
            /*
                        return data.map((cp) => ({
                            prog_idx: cp.prog_idx,
                            prog_name: cp.prog_name,
                            menu_name: cp.menu_nm
                        }))*/
            return []
        } catch {
            return []
        }
    }

}
