"use client"


import {useEffect, useState} from "react";
import {ColDef} from "ag-grid-community";
import {formatToKoreanDate} from "@/utils/data-format";
import AgGridWrapper from "@/components/common/ag-grid-wrapper";
import {DataSql} from "@/services/data-sql";
import {Item} from "@/types/data-sql";
import {useAppContext} from "@/contexts/app-context";

export default function ItemMng() {
    const {currentUser} = useAppContext()
    const [isLoading, setIsLoading] = useState(false)
    const [rowData, setRowData] = useState<Item[]>([])

    const [columnDefs] = useState<ColDef[]>([
        {headerName: "품목코드", field: "item_cd", width: 150, cellClass: "ag-text-center-cell",},
        {headerName: "품목명", field: "item_nm", width: 300},
        {headerName: "품목규격", field: "item_spec", width: 300},
        {headerName: "품목구분", field: "item_type", width: 90, cellClass: "ag-text-center-cell",},
        {headerName: "품목단위", field: "item_unit", width: 90, cellClass: "ag-text-center-cell",},
        {headerName: "사용여부", field: "item_yn", width: 90, cellClass: "ag-text-center-cell",},
        {headerName: "생성일시", field: "item_created_at", valueFormatter: (params) => formatToKoreanDate(params.value),}
    ]);

    useEffect(() => {
        loadItemList()
    }, [])

    const loadItemList = async () => {
        setIsLoading(true)

        try {
            if(!currentUser){
                setRowData([])
            }
            else {
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

    return (
        <div className="p-6 space-y-6">
            {/* 헤더 */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">품목 관리</h1>
            </div>

            {/* 로딩 상태 */}
            {isLoading && (
                <div className="text-center py-8">
                    <div className="text-gray-500">데이터를 불러오는 중...</div>
                </div>
            )}

            <div style={{height: "60vh"}}>
                <AgGridWrapper<Item> rowData={rowData} columnDefs={columnDefs} height={"100%"} width={"70%"}/>
            </div>
        </div>
    )
}