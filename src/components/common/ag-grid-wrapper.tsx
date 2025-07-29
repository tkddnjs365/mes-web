"use client";

import {AgGridReact} from "ag-grid-react";
import {ColDef} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

interface AgGridWrapperProps<T> {
    rowData: T[];
    columnDefs: ColDef[];
    height: string;
    width: string;
}

export default function AgGridWrapper<T>({rowData, columnDefs, height, width}: AgGridWrapperProps<T>) {
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

    return (
        <div className="ag-theme-alpine" style={{height: height, width: width}}>
            <AgGridReact<T>
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
            />
        </div>
    );
}