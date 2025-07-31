"use client"


import {useState} from "react";
import {ColDef} from "ag-grid-community";
import {formatToKoreanDate} from "@/utils/data-format";
import AgGridWrapper from "@/components/common/ag-grid-wrapper";
import {DataSql} from "@/services/data-sql";
import {Item} from "@/types/data-sql";
import {useAppContext} from "@/contexts/app-context";
import {CommonToolbar} from "@/components/common/common-toolbar";
import {LoadingSpinner} from "@/components/loading-spiner";

export default function ItemMng() {
    const {currentUser} = useAppContext()
    const [isLoading, setIsLoading] = useState(false)
    const [rowData, setRowData] = useState<Item[]>([])
    const [searchCondition, setSearchCondition] = useState({
        item: '',
    })

    const [columnDefs] = useState<ColDef[]>([
        {headerName: "품목코드", field: "item_cd", width: 150, cellClass: "ag-text-center-cell",},
        {headerName: "품목명", field: "item_nm", width: 300},
        {headerName: "품목규격", field: "item_spec", width: 300},
        {headerName: "품목구분", field: "item_type", width: 90, cellClass: "ag-text-center-cell",},
        {headerName: "품목단위", field: "item_unit", width: 90, cellClass: "ag-text-center-cell",},
        {
            headerName: "사용여부",
            field: "item_yn",
            width: 90,
            cellStyle: {display: "flex", justifyContent: "center", alignItems: "center"},
        },
        {headerName: "생성일시", field: "item_created_at", valueFormatter: (params) => formatToKoreanDate(params.value),}
    ]);

    /* 품목 목록 조회 */
    const loadItemList = async () => {
        setIsLoading(true)

        try {
            if (!currentUser) {
                setRowData([])
            } else {
                const data = await DataSql.get_item_list(currentUser.company_idx, "")
                console.log("품목 데이터 : ", data)
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
        setSearchCondition({
            item: '',
        })
    }
    // 초기화
    const handleReset = () => {
        setIsLoading(true)

        try {
            setRowData([])
            handleResetCondition();
        } catch (error) {
        } finally {
            setIsLoading(false)
        }
    }
    // 조회
    const handleSearch = async () => {
        try {
            await loadItemList()
        } catch (error) {
        } finally {
        }
    }
    //엑셀
    const handleExcel = () => {
    }

    return (
        <div className="p-6 space-y-6">

            {/* 로딩 상태 */}
            {isLoading && <LoadingSpinner/>}

            <div className="bg-white rounded-sm shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                    {/* 왼쪽: 품목 버튼 + 입력창 */}
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-md flex-wrap">
                        <label htmlFor="select_item"
                               className="text-center text-sm font-medium text-gray-700 min-w-[60px]">
                            품목
                        </label>
                        <input
                            id="select_item"
                            type="text"
                            value={searchCondition.item}
                            onChange={(e) => setSearchCondition({...searchCondition, item: e.currentTarget.value})}
                            className="bg-white min-h-[30px] w-[240px] border border-gray-300 rounded-md px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="품목을 입력하세요"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* 버튼 툴바 */}
                    <CommonToolbar
                        onReset={handleReset}
                        onSearch={handleSearch}
                        onExport={handleExcel}
                        visibleReset={true}
                        visibleSearch={true}
                        visibleSave={true}
                        visibleExprot={true}
                    />
                </div>
            </div>


            <div style={{height: "60vh"}}>
                <AgGridWrapper<Item>
                    rowData={rowData}
                    columnDefs={columnDefs}
                    height={"100%"}
                    width={"70%"}
                />
            </div>
        </div>
    )
}