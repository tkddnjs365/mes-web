"use client"

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {ColDef} from "ag-grid-community";
import {formatToKoreanDate} from "@/utils/data-format";
import AgGridWrapper, {AgGridWrapperRef} from "@/components/common/ag-grid-wrapper";
import {DataSql} from "@/services/data-sql";
import {CommonCode, Company, Item, ItemInsertData} from "@/types/data-sql";
import {useAppContext} from "@/contexts/app-context";
import {CommonToolbar} from "@/components/common/common-toolbar";
import {FormLabelText} from "@/components/ui/form-label-text"
import {FormLabelSelect} from "@/components/ui/form-label-select";
import {validateRequiredFields} from "@/utils/validation";

const USE_YN_OPTIONS = [
    {label: "Yes", value: "Y"},
    {label: "No", value: "N"},
];

// 초기 저장 조건
const INITIAL_SAVE_CONDITION = {
    item_cd: '',
    item_nm: '',
    item_type: '',
    item_spec: '',
    item_unit: '',
    item_yn: 'Y',
    etc: '',
};

// 탭 메뉴 설정
const TAB_MENU = [
    {id: 'basic', label: '기본정보', icon: '📋'},
    {id: 'vender', label: '거래처정보', icon: '🏢'},
    {id: 'etc', label: '기타정보', icon: '📝'}
] as const;

// 필수 입력 필드 정의
const REQUIRED_FIELDS = [
    {name: "품목코드", key: "item_cd"},
    {name: "품목명", key: "item_nm"},
    {name: "품목구분", key: "item_type"},
    {name: "품목규격", key: "item_spec"},
    {name: "품목단위", key: "item_unit"},
] as const;

/**
 * 품목 관리
 */

export default function ItemMng() {
    // 앱 컨텍스트에서 현재 사용자 정보 가져오기
    const {currentUser} = useAppContext()
    const [isLoading, setIsLoading] = useState(false)
    // 데이터 상태 관리
    const [rowData, setRowData] = useState<Item[]>([]) // 품목 목록 데이터
    const [compRowData, setCompRowData] = useState<Company[]>([]) // 거래처 목록 데이터

    // 검색 및 입력 폼 상태 관리
    const [searchCondition, setSearchCondition] = useState({item: ''}) // 조회조건
    const [saveCondition, setSaveCondition] = useState(INITIAL_SAVE_CONDITION) // 저장용
    const [selectItemIdx, setSelectItemIdx] = useState("") // 선택된 품목 ID

    // UI 상태 관리
    const [invalidFields, setInvalidFields] = useState<string[]>([]); // 저장 오류상태 Chk 관리
    const [activeTab, setActiveTab] = useState('basic'); // 탭 관리

    // 공통코드 상태 추가
    const [itemTypes, setItemTypes] = useState<CommonCode[]>([{label: "", value: ""}])
    const [itemUnits, setItemUnits] = useState<CommonCode[]>([{label: "", value: ""}])

    // 그리드 컬럼
    const columnDefs = useMemo<ColDef[]>(() => [
        {headerName: "item_idx", field: "item_idx", width: 50, hide: true}, // 숨김 필드 (PK)
        {headerName: "품목코드", field: "item_cd", width: 150, cellClass: "ag-text-center-cell"},
        {headerName: "품목명", field: "item_nm", width: 300},
        {headerName: "품목규격", field: "item_spec", width: 300},
        {headerName: "품목구분", field: "item_type", width: 110, cellClass: "ag-text-center-cell"},
        {headerName: "품목단위", field: "item_unit", width: 110, cellClass: "ag-text-center-cell"},
        {
            headerName: "사용여부",
            field: "item_yn",
            width: 110,
            cellStyle: {display: "flex", justifyContent: "center", alignItems: "center"}
        },
        {
            headerName: "생성일시",
            field: "item_created_at",
            valueFormatter: (params) => formatToKoreanDate(params.value) // 한국 날짜 형식으로 변환
        }
    ], []);
    const venderColumnDefs = useMemo<ColDef[]>(() => [
        {headerName: "coIdx", field: "coIdx", width: 50, hide: true}, // 숨김 필드 (PK)
        {headerName: "", field: "chk", width: 50, sortable: false, filter: false, cellClass: "ag-text-center-cell"}, // 체크박스 컬럼
        {headerName: "거래처코드", field: "coCd", width: 150},
        {headerName: "거래처명", field: "coNm", width: 250}
    ], []);

    // 그리드 참조 객체들
    const gridRef = useRef<AgGridWrapperRef>(null);           // 메인 품목 그리드 참조
    const companyGridRef = useRef<AgGridWrapperRef>(null);    // 거래처 그리드 참조

    // 컴포넌트 마운트 시 공통코드 로드
    useEffect(() => {
        if (currentUser?.companyIdx) {
            loadCommonCodes();
        }
    }, [currentUser]);

    /* 공통코드 로드 */
    const loadCommonCodes = useCallback(async () => {
        if (!currentUser?.companyIdx) return;

        try {
            const [itemTypeResult, itemUnitResult] = await Promise.allSettled([
                DataSql.get_comm_code(currentUser.companyIdx, 'sys.item_type'),
                DataSql.get_comm_code(currentUser.companyIdx, 'sys.item_unit')
            ]);

            // 품목구분
            setItemTypes([{label: "", value: ""}, ...itemTypeResult.value]);
            // 품목단위
            setItemUnits([{label: "", value: ""}, ...itemUnitResult.value]);
        } catch (error) {
            console.error("공통코드 로드 실패:", error);
        }
    }, [currentUser?.companyIdx]);

    /* 품목 목록 조회 */
    const loadItemList = async () => {
        setIsLoading(true)

        try {
            if (!currentUser) {
                setRowData([])
                setCompRowData([])
            } else {
                const [itemResult, companyResult] = await Promise.allSettled([
                    DataSql.get_item_list(currentUser.companyIdx, searchCondition.item),
                    DataSql.get_company_list(currentUser.companyIdx, "", "", "Y")
                ]);
                setRowData(itemResult.value)
                setCompRowData(companyResult.value)
            }
        } catch (error) {
            console.error("프로그램 목록 로드 실패:", error)
            setRowData([])
            setCompRowData([])
        } finally {
            setIsLoading(false)
        }
    }

    /* 품목 상세 정보 로드 */
    const loadItemDetail = useCallback(async (item_idx: string) => {
        setIsLoading(true);

        try {
            if (!currentUser?.companyIdx) {
                console.error("사용자 정보가 없습니다.");
                return;
            }

            // 품목 상세 정보 조회
            const data = await DataSql.get_item_list(currentUser.companyIdx, "", item_idx);
            console.log("선택된 품목 상세 데이터:", data);

            // 조회된 데이터가 있으면 폼에 설정
            if (data && data.length > 0) {
                const itemDetail = data[0];
                setSaveCondition({
                    item_cd: itemDetail.item_cd || '',
                    item_nm: itemDetail.item_nm || '',
                    item_type: itemDetail.item_type_idx || '',
                    item_spec: itemDetail.item_spec || '',
                    item_unit: itemDetail.item_unit_idx || '',
                    item_yn: itemDetail.item_yn || 'Y',
                    // 특기사항에서 이스케이프된 줄바꿈을 실제 줄바꿈으로 변환
                    etc: itemDetail.item_etc ? itemDetail.item_etc.replace(/\\n/g, '\n') : '',
                });
            }
        } catch (error) {
            console.error("품목 상세 정보 로드 실패:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser?.companyIdx]);

    /* AG 그리드 ROW 클릭 */
    const handleRowClick = useCallback(async (selectedItem: Item) => {
        if (selectedItem.item_idx) {
            // 폼 초기화 후 선택된 품목 정보 설정
            setSaveCondition(INITIAL_SAVE_CONDITION);
            setSelectItemIdx(selectedItem.item_idx);
            setInvalidFields([]);

            // 상세 정보 로드
            await loadItemDetail(selectedItem.item_idx);
        }
    }, [loadItemDetail]);

    // 선택된 거래처 정보를 가져오는 함수
    const getSelectedCompanies = (): Company[] => {
        // AG Grid에서 선택된 행 데이터 가져오기
        if (companyGridRef.current) {
            const selectedRows = companyGridRef.current.getSelectedRows();
            return selectedRows as Company[];
        }
        return [];
    };

    /**
     * 폼 유효성 검증 함수
     * - 필수 입력 필드들의 유효성을 검사하고 오류 필드 목록을 업데이트
     */
    const validateForm = useCallback(() => {
        const requiredFields = REQUIRED_FIELDS.map(field => ({
            field: saveCondition[field.key as keyof typeof saveCondition],
            name: field.name,
            key: field.key
        }));

        const validation = validateRequiredFields(requiredFields);
        setInvalidFields(validation.isValid ? [] : validation.invalidKeys);
        return validation.isValid;
    }, [saveCondition]);

    /* 툴바 핸들러 */
    // 조회 조건 초기화
    const handleResetCondition = useCallback(() => {
        setSearchCondition({item: ''});
        setSaveCondition(INITIAL_SAVE_CONDITION);
        setSelectItemIdx("");
        setInvalidFields([]);
    }, []);

    // 초기화
    const handleReset = useCallback(() => {
        setIsLoading(true);
        try {
            setRowData([]);
            handleResetCondition();
        } finally {
            setIsLoading(false);
        }
    }, [handleResetCondition]);

    // 조회
    const handleSearch = useCallback(async () => {
        try {
            // 폼 초기화 후 조회
            setSaveCondition(INITIAL_SAVE_CONDITION);
            setSelectItemIdx("");
            setInvalidFields([]);
            await loadItemList();
        } catch (error) {
            console.error("조회 중 오류:", error);
        }
    }, [loadItemList]);

    //저장
    const handleSave = useCallback(async () => {
        // 폼 유효성 검증
        if (!validateForm()) {
            alert("필수 입력 항목을 확인해주세요.");
            return;
        }

        // 저장 확인
        const confirmSave = window.confirm("저장하시겠습니까?");
        if (!confirmSave) return;

        if (!currentUser?.companyIdx) {
            console.error("사용자 정보가 없습니다.");
            alert("사용자 정보가 없습니다.");
            return;
        }

        try {
            // 저장할 품목 데이터 구성
            const itemData: ItemInsertData = {
                companyIdx: currentUser.companyIdx,
                item_cd: saveCondition.item_cd,
                item_nm: saveCondition.item_nm,
                item_type: saveCondition.item_type,
                item_spec: saveCondition.item_spec,
                item_unit: saveCondition.item_unit,
                use_yn: saveCondition.item_yn,
                etc: saveCondition.etc,
            };

            // 선택된 거래처 정보 가져오기
            const selectedCompanies = getSelectedCompanies();

            // item_company 테이블에 저장할 데이터 준비
            const itemCompanyData = selectedCompanies.map(company => ({
                company_idx: company.coIdx
            }));

            // 품목 정보 저장
            const result = await DataSql.set_item_list(selectItemIdx, [itemData], itemCompanyData);

            if (result.success) {
                alert("저장되었습니다.");

                // 목록 재조회 및 폼 초기화
                await loadItemList();
                setSaveCondition(INITIAL_SAVE_CONDITION);
                setSelectItemIdx("");
                setInvalidFields([]);
            } else {
                alert("저장에 실패했습니다.");
                console.error('저장 실패:', result.error);
            }
        } catch (error) {
            console.error('저장 중 오류 발생:', error);
            alert("저장 중 오류가 발생했습니다.");
        }
    }, [validateForm, currentUser, saveCondition, selectItemIdx, getSelectedCompanies, loadItemList]);

    //엑셀
    const handleExcel = useCallback(() => {
        if (gridRef.current) {
            const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
            const fileName = `품목목록_${currentDate}`;
            gridRef.current.exportToExcel(fileName);
        }
    }, []);

    /* 입력 필드 변경 핸들러 */
    const createFieldChangeHandler = useCallback((fieldKey: keyof typeof INITIAL_SAVE_CONDITION) => {
        return (value: string) => {
            // 값 업데이트
            setSaveCondition(prev => ({...prev, [fieldKey]: value}));

            // 해당 필드의 오류 상태 해제 (값이 입력된 경우)
            if (invalidFields.includes(fieldKey) && value.trim() !== "") {
                setInvalidFields(prev => prev.filter(key => key !== fieldKey));
            }
        };
    }, [invalidFields]);

    // 탭 렌더링 함수
    /**
     * 기본정보 탭 렌더링
     */
    const renderBasicTab = useMemo(() => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
                {/* 품목코드 입력 */}
                <FormLabelText
                    label="품목코드"
                    value={saveCondition.item_cd}
                    onChange={createFieldChangeHandler('item_cd')}
                    placeholder="품목코드를 입력하세요"
                    disabled={isLoading}
                    inputWidth="w-full"
                    isError={invalidFields.includes("item_cd")}
                />

                {/* 품목명 입력 */}
                <FormLabelText
                    label="품목명"
                    value={saveCondition.item_nm}
                    onChange={createFieldChangeHandler('item_nm')}
                    placeholder="품목명을 입력하세요"
                    disabled={isLoading}
                    inputWidth="w-full"
                    isError={invalidFields.includes("item_nm")}
                />

                {/* 품목구분 및 품목단위 (2열 레이아웃) */}
                <div className="grid grid-cols-2 gap-3">
                    <FormLabelSelect
                        label="품목구분"
                        value={saveCondition.item_type}
                        onChange={(val) => createFieldChangeHandler('item_type')(val as string)}
                        options={itemTypes}
                        disabled={isLoading}
                        isError={invalidFields.includes("item_type")}
                    />

                    <FormLabelSelect
                        label="품목단위"
                        value={saveCondition.item_unit}
                        onChange={(val) => createFieldChangeHandler('item_unit')(val as string)}
                        options={itemUnits}
                        disabled={isLoading}
                        isError={invalidFields.includes("item_unit")}
                    />
                </div>

                {/* 품목규격 입력 */}
                <FormLabelText
                    label="품목규격"
                    value={saveCondition.item_spec}
                    onChange={createFieldChangeHandler('item_spec')}
                    placeholder="품목규격을 입력하세요"
                    disabled={isLoading}
                    inputWidth="w-full"
                    isError={invalidFields.includes("item_spec")}
                />

                {/* 사용여부 선택 */}
                <div className="grid grid-cols-2 gap-3">
                    <FormLabelSelect
                        label="사용여부"
                        value={saveCondition.item_yn}
                        onChange={(val) => setSaveCondition(prev => ({...prev, item_yn: val as string}))}
                        options={USE_YN_OPTIONS}
                        disabled={isLoading}
                    />
                </div>
            </div>
        </div>
    ), [saveCondition, isLoading, invalidFields, itemTypes, itemUnits, createFieldChangeHandler]);
    /**
     * 거래처정보 탭 렌더링
     */
    const renderVenderTab = useMemo(() => (
        <div className="space-y-4">
            <div className="h-[45vh]">
                <AgGridWrapper<Company>
                    ref={companyGridRef}
                    rowData={compRowData}
                    columnDefs={venderColumnDefs}
                    height={"100%"}
                    width={"100%"}
                    title="거래처 목록"
                />
            </div>
        </div>
    ), [compRowData, venderColumnDefs]);

    /**
     * 기타정보 탭 렌더링
     */
    const renderEtcTab = useMemo(() => (
        <div className="space-y-4">
            <FormLabelText
                label="특기사항"
                value={saveCondition.etc}
                onChange={(val) => setSaveCondition(prev => ({...prev, etc: val}))}
                placeholder="특기사항을 입력하세요"
                disabled={isLoading}
                inputWidth="w-full"
                type="textarea"
            />
        </div>
    ), [saveCondition.etc, isLoading]);

    /* 탭별 랜더링 */
    const renderTabContent = useCallback(() => {
        switch (activeTab) {
            case 'basic':
                return renderBasicTab;
            case 'vender':
                return renderVenderTab;
            case 'etc':
                return renderEtcTab;
            default:
                return null;
        }
    }, [activeTab, renderBasicTab, renderVenderTab, renderEtcTab]);


    return (
        <div className="p-4 space-y-2">
            {/* 조회조건 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* 헤더: 조회조건 타이틀 + 버튼 툴바 */}
                <div
                    className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                        <h3 className="text-base font-semibold text-gray-800">조회조건</h3>
                    </div>

                    {/* 버튼 툴바 - 항상 우측 상단 고정 */}
                    <CommonToolbar
                        onReset={handleReset}
                        onSearch={handleSearch}
                        onExport={handleExcel}
                        visibleReset={true}
                        visibleSearch={true}
                        visibleExprot={true}
                    />
                </div>

                {/* 조회조건 필드들 - 확장된 검색 조건 */}
                <div className="p-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* 품목명/코드 검색 */}
                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-1 rounded-lg border border-gray-200">
                            <FormLabelText
                                label="품목"
                                value={searchCondition.item}
                                onChange={(val) => setSearchCondition({...searchCondition, item: val})}
                                placeholder="품목명 또는 품목코드 입력"
                                disabled={isLoading}
                                inputWidth="w-[200px]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between space-x-2 w-full">
                <div className="w-[60%] h-[65vh]">
                    <AgGridWrapper<Item>
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        height={"100%"}
                        width={"100%"}
                        onRowClick={handleRowClick}
                    />
                </div>

                {/* 상세 정보 패널 - 탭 구조로 변경 */}
                <div
                    className="bg-white rounded-lg shadow-md border border-gray-200 w-[40%] h-80 min-h-[65vh] overflow-hidden flex flex-col">
                    {/* 패널 헤더 */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 border-b-2 border-blue-800">
                        <div className="flex items-center justify-between">
                            <div className="flex">
                                {/* 왼쪽: 타이틀 */}
                                <div className="flex items-center text-white font-bold text-sm">
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span>품목 상세 정보</span>
                                </div>

                                {/* 가운데: 상태 표시 */}
                                <div className="ml-4 flex items-center space-x-2 text-xs text-white">
                                    <div
                                        className={`w-2 h-2 rounded-full ${selectItemIdx ? 'bg-red-500' : 'bg-white'}`}></div>
                                    <span>{selectItemIdx ? '수정 모드' : '신규 등록'}</span>
                                </div>
                            </div>

                            {/* 오른쪽: 필수 항목 경고 */}
                            {invalidFields.length > 0 && (
                                <div
                                    className="flex items-center space-x-1 text-red-500 font-semibold text-xs bg-red-100 px-2 py-1 rounded">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span>필수 항목을 확인하세요</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 탭 메뉴 */}
                    <div className="flex border-b border-gray-200 bg-gray-50">
                        {TAB_MENU.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 px-2 py-2 text-xs font-medium border-b-2 transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600 bg-white'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <span className="mr-1">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* 탭 내용 */}
                    <div className="flex-1 overflow-y-auto px-4 py-3">
                        {renderTabContent()}
                    </div>

                    {/* 하단 버튼 */}
                    <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                        <div className="flex justify-end">
                            <CommonToolbar
                                onReset={() => {
                                    setSaveCondition(INITIAL_SAVE_CONDITION);
                                    setSelectItemIdx("");
                                    setInvalidFields([]);
                                }}
                                onSave={handleSave}
                                visibleReset={true}
                                visibleSave={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}