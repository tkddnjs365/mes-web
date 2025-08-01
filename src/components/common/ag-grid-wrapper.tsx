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
        headerName: "No",
        valueGetter: (params) => {
            const rowIndex = params.node?.rowIndex;
            if (rowIndex === undefined || rowIndex === null) return "";
            return rowIndex + 1 + params.api.paginationGetCurrentPage() * params.api.paginationGetPageSize();
        },
        width: 60,
        pinned: "left",
        suppressMovable: true,
        cellClass: "ag-text-center-cell",
        headerClass: "ag-center-header",
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
        <div className="ag-theme-alpine" style={{height: height, width: width}}>
            <AgGridReact<T>
                ref={gridRef}
                rowData={rowData}
                columnDefs={finalColumnDefs}
                pagination={true}
                paginationPageSize={10}
                enableCellTextSelection={true}
                defaultColDef={{
                    resizable: true,
                    headerClass: "ag-center-header",
                }}
                theme={"legacy"}
                onRowClicked={handleRowClick}
            />
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