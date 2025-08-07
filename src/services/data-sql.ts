import {isSupabaseConfigured, supabase} from "@/lib/supabase"
import {CommonCode, Item, ItemInsertData} from "@/types/data-sql";

export class DataSql {

    /* 공통데이터 조회 */
    static async get_comm_code(company_idx: string, group_id: string): Promise<CommonCode[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return []
            }

            const {data, error} = await supabase
                .from('common_code')
                .select('value, data_id')
                .eq('group_id', group_id)
                .eq('use_yn', true)
                .eq('company_idx', company_idx)
                .order('value', {ascending: true});

            if (error) {
                console.error('공통코드 조회 오류:', error);
                return [];
            }

            if (!data) return [];

            return data.map((item) => ({
                label: item.value,
                value: item.data_id
            }));
        } catch (error) {
            console.error('get_comm_code 오류:', error);
            return [];
        }
    }

    /**
     * 품목코드 중복 확인
     */
    private static async checkDuplicateItemCode(
        companyIdx: string,
        itemCd: string
    ): Promise<boolean> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return false
            }

            const {data, error} = await supabase
                .from('item_mst')
                .select('item_idx')
                .eq('company_idx', companyIdx)
                .eq('item_cd', itemCd.trim())
                .limit(1);

            if (error) {
                console.error('중복 확인 오류:', error);
                return false;
            }

            return data && data.length > 0;
        } catch (error) {
            console.error('checkDuplicateItemCode 오류:', error);
            return false;
        }
    }

    /* 품목 전체 조회 */
    static async get_item_list(company_idx: string, item: string, item_idx?: string, item_type?: string, item_yn?: string): Promise<Item[]> {
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
            if (item_idx) {
                query = query.eq("item_idx", item_idx);
            }
            if (item_type) {
                query = query.eq("item_type_idx", item_type);
            }
            if (item_yn) {
                query = query.eq("item_yn", item_yn);
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
                item_type_idx: val?.item_type_idx,
                item_unit_idx: val?.item_unit_idx
            }));
        } catch (error) {
            console.error("사용자 프로그램 조회 오류:", error)
            return []
        }
    }

    /* 품목 저장 */
    static async set_item_list(cur_item_idx: string, save_data: ItemInsertData[]): Promise<{
        success: boolean;
        error?: string;
        item_idx?: string
    }> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return {
                    success: false,
                    error: 'Supabase가 설정되지 않았습니다.'
                };
            }

            const item = save_data[0];
            let rtn_item_idx: string;

            if (cur_item_idx === "") {
                // 중복 item_cd 확인
                const isDuplicate = await this.checkDuplicateItemCode(
                    item.company_idx,
                    item.item_cd
                )

                if (isDuplicate) {
                    return {
                        success: false,
                        error: '이미 존재하는 품목코드입니다.'
                    };
                }

                // item_idx 자동 증가 처리 (예시: 현재 최대값 + 1)
                const {data: maxItem} = await supabase
                    .from("item_mst")
                    .select("item_idx")
                    .order("item_idx", {ascending: false})
                    .limit(1);

                const nextItemIdx = maxItem && maxItem.length > 0 ? maxItem[0].item_idx + 1 : 1;
                rtn_item_idx = nextItemIdx;

                const {error} = await supabase.from("item_mst").insert({
                    item_idx: nextItemIdx,
                    company_idx: item.company_idx,
                    item_cd: item.item_cd,
                    item_nm: item.item_nm,
                    item_spec: item.item_spec,
                    item_type: item.item_type,
                    item_unit: item.item_unit,
                    use_yn: item.use_yn,
                    etc: item.etc,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                    .select('item_idx')
                    .single();

                if (error) {
                    console.error('Supabase 삽입 오류:', error);
                    return {
                        success: false,
                        error: `데이터 저장 중 오류가 발생했습니다: ${error.message}`
                    };
                }
            } else {
                /* UPDATE 기능 */
                rtn_item_idx = cur_item_idx;

                // 기존 데이터의 item_cd와 다른 경우에만 중복 확인
                const {data: existingItem, error: fetchError} = await supabase
                    .from("item_mst")
                    .select("item_cd")
                    .eq("item_idx", cur_item_idx)
                    .single();

                if (fetchError) {
                    console.error('기존 데이터 조회 오류:', fetchError);
                    return {
                        success: false,
                        error: `기존 데이터 조회 중 오류가 발생했습니다: ${fetchError.message}`
                    };
                }

                // 품목코드가 변경된 경우에만 중복 확인
                if (existingItem.item_cd !== item.item_cd) {
                    const isDuplicate = await this.checkDuplicateItemCode(
                        item.company_idx,
                        item.item_cd
                    );

                    if (isDuplicate) {
                        return {
                            success: false,
                            error: '이미 존재하는 품목코드입니다.'
                        };
                    }
                }

                const {data, error} = await supabase
                    .from("item_mst")
                    .update({
                        item_cd: item.item_cd,
                        item_nm: item.item_nm,
                        item_spec: item.item_spec,
                        item_type: item.item_type,
                        item_unit: item.item_unit,
                        use_yn: item.use_yn,
                        etc: item.etc,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("item_idx", cur_item_idx)
                    .eq("company_idx", item.company_idx)
                    .select('item_idx')
                    .single();

                if (error) {
                    console.error('Supabase 업데이트 오류:', error);
                    return {
                        success: false,
                        error: `데이터 수정 중 오류가 발생했습니다: ${error.message}`
                    };
                }

                if (!data) {
                    return {
                        success: false,
                        error: '수정할 데이터를 찾을 수 없습니다.'
                    };
                }
            }

            return {
                success: true,
                item_idx: rtn_item_idx
            };
        } catch (error) {
            console.error("", error)
            return {
                success: false,
                error: '저장 실패'
            };
        }
    }
}