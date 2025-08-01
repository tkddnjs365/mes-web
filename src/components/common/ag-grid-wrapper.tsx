"use client";

import React, {useImperativeHandle, useRef} from "react";
import {AgGridReact} from "ag-grid-react";
import {ColDef, RowClickedEvent} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

interface AgGridWrapperProps<T> {
    rowData: T[];
    columnDefs: ColDef[];
    height: string;
    width: string;
    onRowClick?: (data: T) => void; // 행 클릭 이벤트 핸들러 추가
}

export interface AgGridWrapperRef {
    exportToExcel: (fileName?: string) => void;
}

const AgGridWrapper = <T, >(
    {rowData, columnDefs, height, width, onRowClick}: AgGridWrapperProps<T>,
    ref: React.Ref<AgGridWrapperRef>
) => {
    const gridRef = useRef<AgGridReact<T>>(null);

    // 부모 컴포넌트에서 호출할 수 있는 메서드 노출
    useImperativeHandle(ref, () => ({
        exportToExcel: (fileName = 'export') => {
            // AG Grid Community에서는 CSV로 export
            if (gridRef.current?.api) {
                gridRef.current.api.exportDataAsCsv({
                    fileName: `${fileName}.csv`,
                });
            }
        },
    }));

    // 순번 컬럼 정의
    const indexColumn: ColDef = {
        headerName: "NO",
        valueGetter: (params) => {
            const rowIndex = params.node?.rowIndex;
            if (rowIndex === undefined || rowIndex === null) return "";
            return rowIndex + 1 + params.api.paginationGetCurrentPage() * params.api.paginationGetPageSize();
        },
        width: 80,
        pinned: "left",
        suppressMovable: true,
        cellClass: "ag-text-center-cell font-semibold text-blue-700",
        headerClass: "ag-center-header font-bold bg-blue-100 text-blue-800",
        cellStyle: {
            backgroundColor: '#f8fafc',
            borderRight: '2px solid #e2e8f0'
        }
    };

    // 순번 컬럼을 맨 앞에 추가
    const finalColumnDefs: ColDef[] = [indexColumn, ...columnDefs];

    // 행 클릭 이벤트 핸들러
    const handleRowClick = (event: RowClickedEvent<T>) => {
        if (onRowClick && event.data) {
            onRowClick(event.data);
        }
    };

    return (
        <div
            className="border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden bg-white"
            style={{height: height, width: width}}>

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 border-b-2 border-blue-800">
                <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-sm flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd"
                                  d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
                                  clipRule="evenodd"/>
                        </svg>
                        데이터 목록
                    </h3>
                    <div className="text-xs text-blue-100 font-medium">
                        총 {rowData.length}건
                    </div>
                </div>
            </div>
            <div
                className="ag-theme-alpine"
                style={{
                    height: `calc(${height} - 50px)`,
                    width: width,
                    '--ag-header-background-color': '#f1f5f9',
                    '--ag-header-foreground-color': '#1e293b',
                    '--ag-border-color': '#cbd5e1',
                    '--ag-row-hover-color': '#e0f2fe',
                    '--ag-selected-row-background-color': '#dbeafe',
                    '--ag-odd-row-background-color': '#ffffff',
                    '--ag-even-row-background-color': '#f8fafc',
                    '--ag-font-size': '13px',
                    '--ag-font-family': 'Inter, system-ui, sans-serif'
                } as React.CSSProperties}
            >

                <AgGridReact<T>
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={finalColumnDefs}
                    pagination={true}
                    paginationPageSize={15}
                    paginationPageSizeSelector={[10, 15, 25, 50]}
                    enableCellTextSelection={true}
                    rowSelection="single"
                    defaultColDef={{
                        resizable: true,
                        sortable: true,
                        filter: true,
                        headerClass: "font-bold text-gray-700 bg-slate-100",
                        cellClass: "font-medium text-gray-800",
                    }}
                    headerHeight={40}
                    rowHeight={35}
                    animateRows={true}
                    theme={"legacy"}
                    onRowClicked={handleRowClick}
                    rowClassRules={{
                        'hover:bg-blue-50 cursor-pointer transition-colors duration-150': () => true,
                    }}
                />
            </div>
        </div>
    );
};

// forwardRef의 제네릭 타입을 명시적으로 지정
const ForwardedAgGridWrapper = React.forwardRef(AgGridWrapper) as <T>(
    props: AgGridWrapperProps<T> & { ref?: React.Ref<AgGridWrapperRef> }
) => ReturnType<typeof AgGridWrapper>;

// displayName을 별도로 설정 - React.ForwardRefExoticComponent 타입 사용
(ForwardedAgGridWrapper as React.ForwardRefExoticComponent<AgGridWrapperProps<unknown>>).displayName = 'AgGridWrapper';

export default ForwardedAgGridWrapper;