/* 공통 데이터 조회 용*/
export interface CommonCode {
    label: string;
    value: string;
}

/* 품목 조회용 */
export interface Item {
    companyIdx: string;
    item_idx: string;
    item_cd: string;
    item_nm: string;
    item_spec: string;
    item_type: string;
    item_unit: string;
    item_yn: string;
    item_created_at: string;
    item_updated_at: string;
    item_etc: string;
    item_type_idx: string
    item_unit_idx: string
}

/* 품목 저장 용 */
export interface ItemInsertData {
  companyIdx: string;
  item_cd: string;
  item_nm: string;
  item_spec: string | null;
  item_type: string;
  item_unit: string;
  use_yn: string;
  etc: string | null;
}