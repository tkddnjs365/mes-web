import {isSupabaseConfigured, supabase} from "@/lib/supabase"
import {Item} from "@/types/data-sql";

export class DataSql {

    /* 품목 전체 조회 */
    static async get_item_list(company_idx: string, item: string): Promise<Item[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return []
            }

            let query = supabase
                .from("v_item_mst")
                .select("*")
                .eq("company_idx", company_idx);
            if (item) {
                query = query.or(`item_cd.ilike.%${item}%,item_nm.ilike.%${item}%`);
            }
            query = query.order("item_created_at", {ascending: false});

            const {data, error} = await query;

            console.log("data", data)
            if (error || !data) return []

            return data.map((val) => ({
                company_idx: val?.company_idx,
                item_idx: val?.item_idx,
                item_cd: val?.item_cd,
                item_nm: val?.item_nm,
                item_spec: val?.item_spec,
                item_type: val?.item_type,
                item_unit: val?.item_unit,
                item_yn: val?.item_yn,
                item_created_at: val?.item_created_at,
                item_updated_at: val?.item_updated_at,
                item_etc: val?.item_etc,
            }));
        } catch (error) {
            console.error("사용자 프로그램 조회 오류:", error)
            return []
        }
    }
}