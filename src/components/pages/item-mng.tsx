"use client"


import {useEffect, useState} from "react";
import {ColDef} from "ag-grid-community";
import {ProgramService} from "@/services/program-service";
import type {Program} from "@/types/program";
import {formatToKoreanDate} from "@/utils/data-format";
import AgGridWrapper from "@/components/common/ag-grid-wrapper";

export default function ItemMng() {
    const [isLoading, setIsLoading] = useState(false)

    const [rowData, setRowData] = useState<Program[]>([])
    const [columnDefs] = useState<ColDef[]>([
        {headerName: "이름", field: "name", width: 150, cellClass: "ag-text-center-cell",},
        {headerName: "설명", field: "description", width: 300},
        {headerName: "경로", field: "path", width: 300},
        {headerName: "생성일시", field: "createdAt", valueFormatter: (params) => formatToKoreanDate(params.value),}
    ]);

    useEffect(() => {
        loadItemList()
    }, [])

    const loadItemList = async () => {
        setIsLoading(true)
        try {
            const data = await ProgramService.getPrograms()
            setRowData(data)
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

            <AgGridWrapper<Program> rowData={rowData} columnDefs={columnDefs}/>
        </div>
    )
}