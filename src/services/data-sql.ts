import {isSupabaseConfigured, supabase} from "@/lib/supabase"
import {CommonCode, CommonGroupData, Company, CompanyInsertData, Item, ItemInsertData} from "@/types/data-sql";
import utilsUrl from "@/utils/utilsUrl";

export class DataSql {
    /* 공통데이터 조회 */
    static async get_comm_code(companyIdx: string, group_id: string): Promise<CommonCode[]> {
        try {
            const res = await fetch(
                `${utilsUrl.REST_API_URL}/common/select`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({groupId: group_id, companyIdx}),
                }
            );

            if (!res.ok) {
                console.error("실패:", res.statusText);
                return [];
            }

            const data = await res.json();
            return data.common.map((item: { value: string; dataId: string; }) => ({
                label: item.value,
                value: item.dataId
            }));
        } catch (err) {
            console.error("API 호출 오류:", err);
            return [];
        }
    }

    /* 공통데이터 그룹별 데이터 조회 */
    static async get_comm_code_dtl(companyIdx: string, groupId: string): Promise<CommonGroupData[]> {
        try {
            const res = await fetch(
                `${utilsUrl.REST_API_URL}/common/groupDtlSelect`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({groupId: groupId, companyIdx: companyIdx}),
                }
            );

            if (!res.ok) {
                console.error("실패:", res.statusText);
                return [];
            }

            const data = await res.json();
            return data.common.map((val: {
                dataId: string;
                groupId: string;
                value: string;
                useYn: number;
                sortOrder: number;
                keyId: string
            }) => ({
                dataId: val.dataId,
                groupId: val.groupId,
                value: val.value,
                useYn: val.useYn,
                sortOrder: val.sortOrder,
                keyId: val.keyId,
            }));
        } catch (err) {
            console.error("API 호출 오류:", err);
            return [];
        }
    }

    /* 공통데이터 저장 */
    static async set_comm_code(companyIdx: string, groupId: string, value: string, sortOrder: number, useYn: string, keyId: string): Promise<boolean> {
        try {
            const res = await fetch(
                `${utilsUrl.REST_API_URL}/common/insertCommon`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        companyIdx: companyIdx || "",
                        groupId: groupId || "",
                        value: value || "",
                        sortOrder: sortOrder || "",
                        useYn: useYn || "",
                        keyId: keyId || "",
                    }),
                }
            );

            if (!res.ok) {
                console.error("set_comm_code 실패:", res.statusText);
                return false;
            }

            return true;

        } catch (error) {
            console.error("저장 오류:", error);
            return false;
        }
    }

    /* 공통데이터 수정 */
    static async update_comm_code(companyIdx: string, dataId: string, value: string, sortOrder: number, useYn: string): Promise<boolean> {
        try {
            const res = await fetch(
                `${utilsUrl.REST_API_URL}/common/updateCommon`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        companyIdx: companyIdx || "",
                        dataId: dataId || "",
                        value: value || "",
                        sortOrder: sortOrder || "",
                        useYn: useYn || "",
                    }),
                }
            );

            if (!res.ok) {
                console.error("update_comm_code 실패:", res.statusText);
                return false;
            }

            return true;
        } catch (error) {
            console.error("오류:", error)
            return false
        }
    }

    /* 공통데이터 삭제 */
    static async del_comm_code(companyIdx: string, dataId: string): Promise<boolean> {
        try {
            const res = await fetch(`${utilsUrl.REST_API_URL}/common/deleteCommon`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({companyIdx, dataId}),
            });

            if (!res.ok) {
                console.error("del_comm_code 실패:", res.statusText);
                return false;
            }

            return true;
        } catch (error) {
            console.error("오류:", error)
            return false
        }
    }

    /* 품목 전체 조회 */
    static async get_item_list(companyIdx: string, item: string, item_idx?: string, item_type?: string, item_yn?: string): Promise<Item[]> {
        try {
            const res = await fetch(
                `${utilsUrl.REST_API_URL}/item/itemSelect`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({companyIdx, item, itemIdx: item_idx, itemType: item_type, itemYn: item_yn}),
                }
            );

            if (!res.ok) {
                console.error("실패:", res.statusText);
                return [];
            }

            const data = await res.json();

            return data.itemList.map((item: {
                companyIdx: string; itemIdx: string; itemCd: string; itemNm: string;
                itemSpec: string; itemType: string; itemUnit: string; itemYn: string;
                itemCreatedAt: string; itemUpdatedAt: string; itemEtc: string; itemTypeIdx: string;
                itemUnitIdx: string;
            }) => ({
                companyIdx: item.companyIdx,
                item_idx: item.itemIdx,
                item_cd: item.itemCd,
                item_nm: item.itemNm,
                item_spec: item.itemSpec,
                item_type: item.itemType,
                item_unit: item.itemUnit,
                item_yn: item.itemYn,
                item_created_at: item.itemCreatedAt,
                item_updated_at: item.itemUpdatedAt,
                item_etc: item.itemEtc,
                item_type_idx: item.itemTypeIdx,
                item_unit_idx: item.itemUnitIdx,
            }));
        } catch (err) {
            console.error("API 호출 오류:", err);
            return [];
        }
    }

    /* 품목 저장 */
    static async set_item_list(cur_item_idx: string, save_data: ItemInsertData[]): Promise<{
        success: boolean;
        error?: string;
        item_idx?: string
    }> {
        try {
            if (!save_data || save_data.length === 0) {
                return {
                    success: false,
                    error: '저장할 데이터가 없습니다.'
                };
            }

            const item = save_data[0];

            const res = await fetch(
                `${utilsUrl.REST_API_URL}/item/itemSave`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        curItemIdx: cur_item_idx || "",
                        companyIdx: item.companyIdx,
                        itemCd: item.item_cd,
                        itemNm: item.item_nm,
                        itemSpec: item.item_spec,
                        itemType: item.item_type,
                        itemUnit: item.item_unit,
                        useYn: item.use_yn,
                        etc: item.etc
                    }),
                }
            );

            if (!res.ok) {
                console.error("API 요청 실패:", res.statusText);
                return {
                    success: false,
                    error: `API 요청 실패: ${res.statusText}`
                };
            }

            const data: {
                success: boolean;
                error?: string;
                itemIdx?: string;
            } = await res.json();

            if (data.success) {
                return {
                    success: true,
                    item_idx: data.itemIdx
                };
            } else {
                return {
                    success: false,
                    error: data.error || '저장 실패'
                };
            }

        } catch (error) {
            console.error("품목 저장 오류:", error);
            return {
                success: false,
                error: '저장 실패'
            };
        }
    }

    /* 거래선 전체 조회 */
    static async get_company_list(companyIdx: string, company: string, coIdx?: string, useYn?: string): Promise<Company[]> {
        try {
            const res = await fetch(
                `${utilsUrl.REST_API_URL}/companyMst/companySelect`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({companyIdx, company: company, coIdx: coIdx, useYn: useYn}),
                }
            );

            if (!res.ok) {
                console.error("실패:", res.statusText);
                return [];
            }

            const data = await res.json();

            return data.companyList.map((val: Company) => ({
                ...val,
                coType: val.coType || [] // 배열로 초기화
            }));
        } catch (err) {
            console.error("API 호출 오류:", err);
            return [];
        }
    }

    /* 거래선 저장 */
    static async set_company_list(cur_idx: string, save_data: CompanyInsertData[]): Promise<{
        success: boolean;
        error?: string;
        company_idx?: string
    }> {
        try {
            if (!save_data || save_data.length === 0) {
                return {
                    success: false,
                    error: '저장할 데이터가 없습니다.'
                };
            }

            const saveData = save_data[0];

            const res = await fetch(
                `${utilsUrl.REST_API_URL}/companyMst/companySave`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        curCoIdx: cur_idx || "",
                        companyIdx: saveData.companyIdx,

                        coCd: saveData.coCd,
                        coNm: saveData.coNm,
                        useYn: saveData.useYn,
                        compAddr: saveData.compAddr,
                        compType: saveData.compType,
                        compItem: saveData.compItem,
                        compCurr: saveData.compCurr,

                        bizNo: saveData.bizNo,
                        ceoNm: saveData.ceoNm,
                        tel: saveData.tel,
                        fax: saveData.fax,
                        email: saveData.email,
                        country: saveData.country,
                        userIdx: saveData.userIdx,

                    coType: saveData.coType || [],
                    }),
                }
            );

            if (!res.ok) {
                console.error("API 요청 실패:", res.statusText);
                return {
                    success: false,
                    error: `API 요청 실패: ${res.statusText}`
                };
            }

            const data: {
                coIdx: string;
                success: boolean;
                error?: string;
            } = await res.json();

            if (data.success) {
                return {
                    success: true,
                    company_idx: data.coIdx
                };
            } else {
                return {
                    success: false,
                    error: data.error || '저장 실패'
                };
            }

        } catch (error) {
            console.error("저장 오류:", error);
            return {
                success: false,
                error: '저장 실패'
            };
        }
    }

    ///// supabase 연동 //////
    /* 공통데이터 조회 */
    static async get_comm_code_bak(companyIdx: string, group_id: string): Promise<CommonCode[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return []
            }

            const {data, error} = await supabase
                .from('common_code')
                .select('value, data_id')
                .eq('group_id', group_id)
                .eq('use_yn', true)
                .eq('companyIdx', companyIdx)
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
                .eq('companyIdx', companyIdx)
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
    static async get_item_list_bak(companyIdx: string, item: string, item_idx?: string, item_type?: string, item_yn?: string): Promise<Item[]> {
        try {
            if (!isSupabaseConfigured || !supabase) {
                return []
            }

            let query = supabase
                .from("v_item_mst")
                .select("*")
                .eq("companyIdx", companyIdx);
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
                companyIdx: val?.companyIdx,
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
    static async set_item_list_bak(cur_item_idx: string, save_data: ItemInsertData[]): Promise<{
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
                    item.companyIdx,
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
                    companyIdx: item.companyIdx,
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
                        item.companyIdx,
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
                    .eq("companyIdx", item.companyIdx)
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