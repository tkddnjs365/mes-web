"use client"


import {useEffect, useRef, useState} from "react";
import {ColDef} from "ag-grid-community";
import {formatToKoreanDate} from "@/utils/data-format";
import AgGridWrapper, {AgGridWrapperRef} from "@/components/common/ag-grid-wrapper";
import {SupabaseDataSql} from "@/services/supabase-data-sql";
import {CommonCode, Item, ItemInsertData} from "@/types/data-sql";
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

export default function ItemMng() {
    const {currentUser} = useAppContext()
    const [isLoading, setIsLoading] = useState(false)
    const [rowData, setRowData] = useState<Item[]>([])
    const [searchCondition, setSearchCondition] = useState({item: ''}) // 조회조건용
    const [saveCondition, setSaveCondition] = useState(INITIAL_SAVE_CONDITION) // 저장용
    const [selectItemIdx, setSelectItemIdx] = useState("")
    const [invalidFields, setInvalidFields] = useState<string[]>([]); // 저장 오류상태 Chk 관리

    // 공통코드 상태 추가
    const [itemTypes, setItemTypes] = useState<CommonCode[]>([{label: "", value: ""}])
    const [itemUnits, setItemUnits] = useState<CommonCode[]>([{label: "", value: ""}])

    const [columnDefs] = useState<ColDef[]>([
        {headerName: "item_idx", field: "item_idx", width: 50, hide: true,},
        {headerName: "품목코드", field: "item_cd", width: 150, cellClass: "ag-text-center-cell",},
        {headerName: "품목명", field: "item_nm", width: 300},
        {headerName: "품목규격", field: "item_spec", width: 300},
        {headerName: "품목구분", field: "item_type", width: 110, cellClass: "ag-text-center-cell",},
        {headerName: "품목단위", field: "item_unit", width: 110, cellClass: "ag-text-center-cell",},
        {
            headerName: "사용여부",
            field: "item_yn",
            width: 110,
            cellStyle: {display: "flex", justifyContent: "center", alignItems: "center"},
        },
        {headerName: "생성일시", field: "item_created_at", valueFormatter: (params) => formatToKoreanDate(params.value),}
    ]);

    const gridRef = useRef<AgGridWrapperRef>(null);

    // 컴포넌트 마운트 시 공통코드 로드
    useEffect(() => {
        if (currentUser?.company_idx) {
            loadCommonCodes();
        }
    }, [currentUser]);

    /* 공통코드 로드 */
    const loadCommonCodes = async () => {
        if (!currentUser?.company_idx) return;

        try {
            // 품목구분 로드
            const itemTypeData = await SupabaseDataSql.get_comm_code(currentUser.company_idx, 'sys.item.item_type');
            setItemTypes([{label: "", value: ""}, ...itemTypeData]);

            // 품목단위 로드
            const itemUnitData = await SupabaseDataSql.get_comm_code(currentUser.company_idx, 'sys.item.item_unit');
            setItemUnits([{label: "", value: ""}, ...itemUnitData]);
        } catch (error) {
            console.error("공통코드 로드 실패:", error);
        }
    };

    /* 품목 목록 조회 */
    const loadItemList = async () => {
        setIsLoading(true)

        try {
            if (!currentUser) {
                setRowData([])
            } else {
                const data = await SupabaseDataSql.get_item_list(currentUser.company_idx, searchCondition.item)
                console.log("품목 데이터 : ", data)
                setRowData(data)
            }
        } catch (error) {
            console.error("프로그램 목록 로드 실패:", error)
        } finally {
            setIsLoading(false)
        }
    }

    /* AG 그리드 ROW 클릭 */
    const handleRowClick = async (selectedItem: Item) => {
        console.log("선택된 품목:", selectedItem);
        if (selectedItem.item_idx) {
            setSaveCondition(INITIAL_SAVE_CONDITION)
            setSelectItemIdx("")
            setSelectItemIdx(selectedItem.item_idx)
            await loadItemDetail(selectedItem.item_idx);
        }
    }
    const loadItemDetail = async (item_idx: string) => {
        setIsLoading(true)

        try {
            if (!currentUser) {
                console.error("사용자 정보가 없습니다.");
                return;
            }

            const data = await SupabaseDataSql.get_item_list(currentUser.company_idx, "", item_idx)
            console.log("선택된 품목 상세 데이터 : ", data)

            // 조회된 데이터가 있으면 saveCondition에 설정
            if (data && data.length > 0) {
                const itemDetail = data[0];
                setSaveCondition({
                    item_cd: itemDetail.item_cd || '',
                    item_nm: itemDetail.item_nm || '',
                    item_type: itemDetail.item_type_idx || '',
                    item_spec: itemDetail.item_spec || '',
                    item_unit: itemDetail.item_unit_idx || '',
                    item_yn: itemDetail.item_yn || 'Y',
                    etc: itemDetail.item_etc ? itemDetail.item_etc.replace(/\\n/g, '\n') : '',
                });
            }
        } catch (error) {
            console.error("품목 상세 정보 로드 실패:", error)
        } finally {
            setIsLoading(false)
        }
    }

    /* 툴바 핸들러 */
    // 조회 조건 초기화
    const handleResetCondition = () => {
        setSearchCondition({
            item: '',
        })
        setSaveCondition(INITIAL_SAVE_CONDITION)
        setSelectItemIdx("");
        setInvalidFields([]);
    }
    // 초기화
    const handleReset = () => {
        setIsLoading(true)

        try {
            setRowData([])
            handleResetCondition();
        } catch {
        } finally {
            setIsLoading(false)
        }
    }
    // 조회
    const handleSearch = async () => {
        try {
            setSaveCondition(INITIAL_SAVE_CONDITION)
            setSelectItemIdx("");
            setInvalidFields([]);
            await loadItemList()
        } catch {
        } finally {
        }
    }
    //저장
    const handleSave = async () => {
        // 필수 필드 검증
        const requiredFields = [
            {field: saveCondition.item_cd, name: "품목코드", key: "item_cd"},
            {field: saveCondition.item_nm, name: "품목명", key: "item_nm"},
            {field: saveCondition.item_type, name: "품목구분", key: "item_type"},
            {field: saveCondition.item_spec, name: "품목규격", key: "item_spec"},
            {field: saveCondition.item_unit, name: "품목단위", key: "item_unit"},
        ];
        const validation = validateRequiredFields(requiredFields);
        if (!validation.isValid) {
            setInvalidFields(validation.invalidKeys); // 상태로 저장
            return;
        }
        setInvalidFields([]); // 오류 없으면 초기화

        const confirmSave = window.confirm("저장하시겠습니까?");
        if (!confirmSave) return;

        if (!currentUser) {
            console.error("사용자 정보가 없습니다.");
            return;
        }

        const itemData: ItemInsertData = {
            company_idx: currentUser.company_idx,
            item_cd: saveCondition.item_cd,
            item_nm: saveCondition.item_nm,
            item_type: saveCondition.item_type,
            item_spec: saveCondition.item_spec,
            item_unit: saveCondition.item_unit,
            use_yn: saveCondition.item_yn,
            etc: saveCondition.etc,
        };

        const result = await SupabaseDataSql.set_item_list(selectItemIdx, [itemData]);
        if (result.success) {
            alert("저장되었습니다.");
            console.log('저장 성공, item_idx:', result.item_idx);
            await loadItemList();

            setSaveCondition(INITIAL_SAVE_CONDITION)
            setSelectItemIdx("");
            setInvalidFields([]);
        } else {
            alert("저장에 실패했습니다.");
            console.error('저장 실패:', result.error);
        }
    }
    //엑셀
    const handleExcel = () => {
        if (gridRef.current) {
            const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
            const fileName = `품목목록_${currentDate}`;
            gridRef.current.exportToExcel(fileName);
        }
    }

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

                {/* 조회조건 필드들 */}
                <div className="p-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* 품목 - 개별 박스로 그룹핑 */}
                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-1 rounded-lg border border-gray-200">
                            <label
                                className="text-sm font-semibold text-gray-700 min-w-[50px] whitespace-nowrap text-center">
                                품목
                            </label>
                            <input
                                type="text"
                                value={searchCondition.item}
                                onChange={(e) => setSearchCondition({
                                    ...searchCondition,
                                    item: e.currentTarget.value
                                })}
                                className="w-[280px] min-h-[36px] px-3 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="품목명 또는 품목코드 입력"
                                disabled={isLoading}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSearch();
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className={"flex justify-between space-x-2 w-full"}>
                <div className={"w-[60%] h-[65vh]"}>
                    <AgGridWrapper<Item>
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        height={"100%"}
                        width={"100%"}
                        onRowClick={handleRowClick}
                    />
                </div>

                {/* 상세 정보 패널 */}
                <div
                    className="bg-white rounded-lg shadow-md border border-gray-200 w-[40%] h-80 min-h-[65vh] overflow-x-auto overflow-y-auto">
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
                                    <span>{selectItemIdx ? '수정 등록' : '신규 등록'}</span>
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

                    {/* 패널 내용 */}
                    <div className="px-4 py-3 space-y-4">
                        {/* 기본 정보 섹션 */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <h3 className="text-sm font-semibold text-gray-800">기본 정보</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <FormLabelText
                                    label="품목코드"
                                    value={saveCondition.item_cd}
                                    onChange={(val) => {
                                        setSaveCondition({...saveCondition, item_cd: val});
                                        if (invalidFields.includes("item_cd") && val.trim() !== "") {
                                            setInvalidFields(invalidFields.filter((key) => key !== "item_cd"));
                                        }
                                    }}
                                    placeholder="품목코드를 입력하세요"
                                    disabled={isLoading}
                                    inputWidth="w-full"
                                    isError={invalidFields.includes("item_cd")}
                                />

                                <FormLabelText
                                    label="품목명"
                                    value={saveCondition.item_nm}
                                    onChange={(val) => {
                                        setSaveCondition({...saveCondition, item_nm: val});
                                        if (invalidFields.includes("item_nm") && val.trim() !== "") {
                                            setInvalidFields(invalidFields.filter((key) => key !== "item_nm"));
                                        }
                                    }}
                                    placeholder="품목명을 입력하세요"
                                    disabled={isLoading}
                                    inputWidth="w-full"
                                    isError={invalidFields.includes("item_nm")}
                                />
                            </div>
                        </div>

                        {/* 분류 정보 섹션 */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <h3 className="text-sm font-semibold text-gray-800">분류 정보</h3>
                            </div>

                            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                                <FormLabelSelect
                                    label="품목구분"
                                    value={saveCondition.item_type}
                                    onChange={(val) => {
                                        setSaveCondition({...saveCondition, item_type: val});
                                        if (invalidFields.includes("item_type") && val.trim() !== "") {
                                            setInvalidFields(invalidFields.filter((key) => key !== "item_type"));
                                        }
                                    }}
                                    options={itemTypes}
                                    disabled={isLoading}
                                    isError={invalidFields.includes("item_type")}
                                />

                                <FormLabelSelect
                                    label="품목단위"
                                    value={saveCondition.item_unit}
                                    onChange={(val) => {
                                        setSaveCondition({...saveCondition, item_unit: val});
                                        if (invalidFields.includes("item_unit") && val.trim() !== "") {
                                            setInvalidFields(invalidFields.filter((key) => key !== "item_unit"));
                                        }
                                    }}
                                    options={itemUnits}
                                    disabled={isLoading}
                                    isError={invalidFields.includes("item_unit")}
                                />

                                <FormLabelSelect
                                    label="사용여부"
                                    value={saveCondition.item_yn}
                                    onChange={(val) => {
                                        setSaveCondition({...saveCondition, item_yn: val});
                                    }}
                                    options={USE_YN_OPTIONS}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* 상세 정보 섹션 */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <h3 className="text-sm font-semibold text-gray-800">상세 정보</h3>
                            </div>

                            <FormLabelText
                                label="품목규격"
                                value={saveCondition.item_spec}
                                onChange={(val) => {
                                    setSaveCondition({...saveCondition, item_spec: val});
                                    if (invalidFields.includes("item_spec") && val.trim() !== "") {
                                        setInvalidFields(invalidFields.filter((key) => key !== "item_spec"));
                                    }
                                }}
                                placeholder="품목규격을 입력하세요"
                                disabled={isLoading}
                                inputWidth="w-full"
                                isError={invalidFields.includes("item_spec")}
                            />

                            <FormLabelText
                                label="특기사항"
                                value={saveCondition.etc}
                                onChange={(val) => setSaveCondition({...saveCondition, etc: val})}
                                placeholder="특기사항을 입력하세요"
                                disabled={isLoading}
                                inputWidth="w-full"
                                type="textarea"
                            />
                        </div>

                        {/* 하단 버튼 */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 pb-1 border-b border-gray-200"/>

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
        </div>
    )
}