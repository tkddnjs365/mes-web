"use client"

import AgGridWrapper, {AgGridWrapperRef} from "@/components/common/ag-grid-wrapper";
import {CommonCode, Item} from "@/types/data-sql";
import {useEffect, useRef, useState} from "react";
import {useAppContext} from "@/contexts/app-context";
import {DataSql} from "@/services/data-sql";
import {ColDef, ICellRendererParams} from "ag-grid-community";
import {formatToKoreanDate} from "@/utils/data-format";
import {CommonToolbar} from "@/components/common/common-toolbar";

// 조회 조건
const SEARCH_CONDITION = {
    item: '',
    item_type: '',
    item_yn: '',
};
const USE_YN_OPTIONS = [
    {label: "", value: ""},
    {label: "Yes", value: "Y"},
    {label: "No", value: "N"},
];

export default function ItemMngList() {
    const {currentUser} = useAppContext()
    const [isLoading, setIsLoading] = useState(false)
    const [searchCondition, setSearchCondition] = useState(SEARCH_CONDITION) // 조회조건용
    const gridRef = useRef<AgGridWrapperRef>(null);
    const [rowData, setRowData] = useState<Item[]>([])

    const [itemTypes, setItemTypes] = useState<CommonCode[]>([{label: "", value: ""}])
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
        {
            headerName: "특기사항",
            field: "item_etc",
            autoHeight: true,
            width: 300,
            cellRenderer: (params: ICellRendererParams) => {
                return (
                    <div style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        paddingTop: "2px",     // 아주 얇은 상단 패딩
                        paddingBottom: "2px",  // 아주 얇은 하단 패딩
                        lineHeight: "1.2",     // 줄 간격도 살짝 조절
                    }}>
                        {params.value ?? ""}
                    </div>
                );
            },
        },
        {headerName: "생성일시", field: "item_created_at", valueFormatter: (params) => formatToKoreanDate(params.value),},
        {headerName: "수정일시", field: "item_updated_at", valueFormatter: (params) => formatToKoreanDate(params.value),},
    ]);

    // 컴포넌트 마운트 시 공통코드 로드
    useEffect(() => {
        if (currentUser?.companyIdx) {
            loadCommonCodes();
        }
    }, [currentUser]);

    /* 공통코드 로드 */
    const loadCommonCodes = async () => {
        if (!currentUser?.companyIdx) return;

        try {
            // 품목구분 로드
            const itemTypeData = await DataSql.get_comm_code(currentUser.companyIdx, 'sys.item_type');
            setItemTypes([{label: "", value: ""}, ...itemTypeData]);
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
                const data = await DataSql.get_item_list(currentUser.companyIdx, searchCondition.item, "", searchCondition.item_type, searchCondition.item_yn)
                setRowData(data)
            }
        } catch (error) {
            console.error("프로그램 목록 로드 실패:", error)
        } finally {
            setIsLoading(false)
        }
    }

    /* 툴바 핸들러 */
    // 조회 조건 초기화
    const handleResetCondition = () => {
        setSearchCondition(SEARCH_CONDITION)
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
            await loadItemList()
        } catch {
        } finally {
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
                        {/* 품목 */}
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

                        {/* 품목구분 */}
                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-1 rounded-lg border border-gray-200">
                            <label
                                className="text-sm font-semibold text-gray-700 min-w-[50px] whitespace-nowrap text-center">
                                품목구분
                            </label>
                            <select
                                value={searchCondition.item_type}
                                onChange={(e) => {
                                    setSearchCondition({...searchCondition, item_type: e.target.value});
                                }}
                                className="w-[150px] min-h-[36px] px-3 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                disabled={isLoading}
                            >
                                {itemTypes.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 사용여부 */}
                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-1 rounded-lg border border-gray-200">
                            <label
                                className="text-sm font-semibold text-gray-700 min-w-[50px] whitespace-nowrap text-center">
                                사용여부
                            </label>
                            <select
                                value={searchCondition.item_yn}
                                onChange={(e) => {
                                    setSearchCondition({...searchCondition, item_yn: e.target.value});
                                }}
                                className="w-[150px] min-h-[36px] px-3 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                disabled={isLoading}
                            >
                                {USE_YN_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className={"flex justify-between space-x-2 w-full"}>
                <div className={"w-[100%] h-[65vh]"}>
                    <AgGridWrapper<Item>
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        height={"100%"}
                        width={"100%"}
                    />
                </div>
            </div>
        </div>
    )
}