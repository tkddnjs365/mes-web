/* 공통 데이터 조회 용*/
export interface CommonCode {
    label: string;
    value: string;
}

/* 공통코드_그룹코드 */
export interface CommonGroupData {
    dataId: string;
    groupId: string;
    value: string;
    useYn: number;
    sortOrder: number;
    keyId: string;
}

/* 공통코드_그룹별 데이터 */
export interface CommonGroupDtlData {
    dataId: string;
    groupId: string;
    value: string;
    useYn: number;
    sortOrder: number;
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

/* 거래처 조회용 */
export interface Company {
    coIdx: string;
    coCd: string;
    coNm: string;
    useYn: string;
    compAddr: string;
    compType: string;
    compItem: string;
    compCurr: string;
    bizNo: string;
    ceoNm: string;
    tel: string;
    fax: string;
    email: string;
    country: string;
    createdAt: string;
    createdUser: string;
    updatedAt: string;
    updatedUser: string;

    compCurrIdx: string;
    countryIdx: string;
    createdUserIdx: string;
    updatedUserIdx: string

    coType: string[];
}

/* 거래처 저장용 */
export interface CompanyInsertData {
    companyIdx: string;

    coCd: string;
    coNm: string;
    useYn: string;
    compAddr: string;
    compType: string;
    compItem: string;
    compCurr: string;
    bizNo: string;
    ceoNm: string;
    tel: string;
    fax: string;
    email: string;
    country: string;
    userIdx: string;
    coType: string[];
}