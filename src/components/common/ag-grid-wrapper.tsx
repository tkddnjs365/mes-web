"use client";

import React, {useImperativeHandle, useRef, useMemo, useCallback} from "react";
import {AgGridReact} from "ag-grid-react";
import {ColDef, RowClickedEvent} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// 상수 정의
const GRID_CONFIG = {
    HEADER_HEIGHT: 50,
    ROW_HEIGHT: 35,
    HEADER_ROW_HEIGHT: 40,
    DEFAULT_PAGE_SIZE: 15,
    INDEX_COLUMN_WIDTH: 80,
    PAGE_SIZE_OPTIONS: [10, 15, 25, 50]
} as const;

// CSS 변수들을 객체로 분리
const GRID_CSS_VARIABLES = {
    '--ag-header-background-color': '#f1f5f9',
    '--ag-header-foreground-color': '#1e293b',
    '--ag-border-color': '#cbd5e1',
    '--ag-row-hover-color': '#e0f2fe',
    '--ag-selected-row-background-color': '#dbeafe',
    '--ag-odd-row-background-color': '#ffffff',
    '--ag-even-row-background-color': '#f8fafc',
    '--ag-font-size': '13px',
    '--ag-font-family': 'Inter, system-ui, sans-serif'
} as const;

// AG Grid 컴포넌트에 전달할 props의 타입 정의
interface AgGridWrapperProps<T> {
    rowData: T[];                    // 그리드에 표시할 데이터 배열
    columnDefs: ColDef[];           // 컬럼 정의 배열 (어떤 컬럼을 보여줄지)
    height: string;                 // 그리드 높이 (예: "400px")
    width: string;                  // 그리드 너비 (예: "100%")
    onRowClick?: (data: T) => void; // 행을 클릭했을 때 실행할 함수 (선택사항)
    title?: string;                 // 그리드 제목 (기본값: "데이터 목록")
}

// 부모 컴포넌트에서 호출할 수 있는 메서드들의 타입 정의
export interface AgGridWrapperRef<T = unknown> {
    exportToExcel: (fileName?: string) => void; // CSV로 데이터 내보내기 함수
    getSelectedRows: () => T[];                // 선택된 행 데이터 가져오기 함수 추가
    selectAll: () => void;                       // 전체 선택 함수 추가
    deselectAll: () => void;                     // 전체 선택 해제 함수 추가
}

// AG Grid를 감싸는 래퍼 컴포넌트 정의
const AgGridWrapper = <T, >(
    {rowData, columnDefs, height, width, onRowClick, title = "데이터 목록"}: AgGridWrapperProps<T>,
    ref: React.Ref<AgGridWrapperRef<T>>
) => {

    // AG Grid의 API에 접근하기 위한 ref 생성
    const gridRef = useRef<AgGridReact<T>>(null);

    // 부모 컴포넌트에서 호출할 수 있는 메서드들을 외부에 노출
    useImperativeHandle(ref, () => ({
        // CSV 파일로 데이터를 내보내는 함수
        exportToExcel: (fileName = 'export') => {
            // AG Grid Community 버전에서는 Excel이 아닌 CSV로만 내보내기 가능
            if (gridRef.current?.api) {
                gridRef.current.api.exportDataAsCsv({
                    fileName: `${fileName}.csv`,
                });
            }
        },
        // 선택된 행 데이터를 가져오는 함수
        getSelectedRows: () => {
            if (gridRef.current?.api) {
                return gridRef.current.api.getSelectedRows() || [];
            }
            return [];
        },
        // 전체 선택 함수
        selectAll: () => {
            if (gridRef.current?.api) {
                gridRef.current.api.selectAll();
            }
        },
        // 전체 선택 해제 함수
        deselectAll: () => {
            if (gridRef.current?.api) {
                gridRef.current.api.deselectAll();
            }
        }
    }), []);

    // 순번(NO) 컬럼 정의 - useMemo로 메모이제이션
    const indexColumn: ColDef = useMemo(() => ({
        headerName: "NO",           // 컬럼 헤더에 표시될 이름
        // 각 행의 순번을 계산하는 함수 (페이지네이션 고려)
        valueGetter: (params) => {
            const rowIndex = params.node?.rowIndex;
            if (rowIndex === undefined || rowIndex === null) return "";
            // 현재 페이지 번호와 페이지 크기를 고려해서 전체 순번 계산
            return rowIndex + 1 + params.api.paginationGetCurrentPage() * params.api.paginationGetPageSize();
        },
        width: GRID_CONFIG.INDEX_COLUMN_WIDTH,                  // 컬럼 너비
        pinned: "left",            // 왼쪽에 고정 (스크롤해도 항상 보임)
        suppressMovable: true,      // 컬럼 이동 불가
        sortable: false,           // 순번 컬럼은 정렬 불가
        filter: false,             // 순번 컬럼은 필터 불가
        // 셀 스타일 클래스 (가운데 정렬, 굵은 글씨, 파란색)
        cellClass: "ag-text-center-cell font-semibold text-blue-700",
        // 헤더 스타일 클래스 (가운데 정렬, 굵은 글씨, 파란색 배경)
        headerClass: "ag-center-header font-bold bg-blue-100 text-blue-800",
        // 셀의 직접 스타일 설정
        cellStyle: {
            backgroundColor: '#f8fafc',      // 연한 회색 배경
            borderRight: '2px solid #e2e8f0' // 오른쪽에 테두리 추가
        }
    }), []);

    // 최종 컬럼 정의: 순번 컬럼을 맨 앞에 추가 - useMemo로 메모이제이션
    const finalColumnDefs: ColDef[] = useMemo(() =>
        [indexColumn, ...columnDefs],
        [indexColumn, columnDefs]
    );

    // 체크박스 컬럼이 있는지 확인 - useMemo로 메모이제이션
    const hasCheckboxColumn = useMemo(() =>
        finalColumnDefs.some(col => col.field === 'chk'),
        [finalColumnDefs]
    );

    // 기본 컬럼 정의 - useMemo로 메모이제이션
    const defaultColDef = useMemo(() => ({
        resizable: true,     // 컬럼 크기 조절 가능
        sortable: true,      // 정렬 가능
        filter: true,        // 필터 가능
        headerClass: "font-bold text-gray-700 bg-slate-100", // 헤더 스타일
        cellClass: "font-medium text-gray-800",              // 셀 스타일
    }), []);

    // 행 스타일 규칙 - useMemo로 메모이제이션
    const rowClassRules = useMemo(() => ({
        'hover:bg-blue-50 cursor-pointer transition-colors duration-150': () => true,
    }), []);

    // 체크박스 설정 - useMemo로 메모이제이션
    const checkboxConfig = useMemo(() =>
        hasCheckboxColumn ? {
            rowSelection: {
                mode: 'multiRow' as const,           // 다중 행 선택 모드
                checkboxes: true,           // 체크박스 표시
                headerCheckbox: true,       // 헤더에 전체 선택 체크박스
                enableClickSelection: false // 체크박스만으로 선택 (행 클릭으로는 선택 안됨)
            }
        } : {},
        [hasCheckboxColumn]
    );

    // 행을 클릭했을 때 실행되는 함수 - useCallback으로 메모이제이션
    const handleRowClick = useCallback((event: RowClickedEvent<T>) => {
        // onRowClick 함수가 전달되었고, 클릭한 행에 데이터가 있으면 실행
        if (onRowClick && event.data) {
            onRowClick(event.data);
        }
    }, [onRowClick]);

    // 그리드 스타일 계산 - useMemo로 메모이제이션
    const gridStyle = useMemo(() => ({
        height: `calc(${height} - ${GRID_CONFIG.HEADER_HEIGHT}px)`,  // 헤더 높이를 제외한 나머지 높이
        width: width,
        ...GRID_CSS_VARIABLES
    }), [height, width]);

    // 헤더 JSX를 별도 함수로 분리
    const renderHeader = () => (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 border-b-2 border-blue-800">
            <div className="flex items-center justify-between">
                {/* 왼쪽: 제목과 아이콘 */}
                <h3 className="text-white font-bold text-sm flex items-center">
                    {/* 표 모양 아이콘 */}
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd"
                              d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
                              clipRule="evenodd"/>
                    </svg>
                    {title}
                </h3>
                {/* 오른쪽: 전체 데이터 개수 표시 */}
                <div className="text-xs text-blue-100 font-medium">
                    총 {rowData.length}건
                </div>
            </div>
        </div>
    );

    return (
        // 전체 그리드를 감싸는 컨테이너 div
        <div
            className="border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden bg-white"
            style={{height: height, width: width}}>

            {/* 그리드 상단 헤더 영역 */}
            {renderHeader()}

            {/* 실제 AG Grid가 들어갈 영역 */}
            <div className="ag-theme-alpine" style={gridStyle as React.CSSProperties}>
                {/* 실제 AG Grid 컴포넌트 */}
                <AgGridReact<T>
                    ref={gridRef}                    // Grid API 접근용 ref
                    rowData={rowData}                // 표시할 데이터
                    columnDefs={finalColumnDefs}     // 컬럼 정의 (순번 컬럼 포함)
                    pagination={true}                // 페이지네이션 활성화
                    paginationPageSize={GRID_CONFIG.DEFAULT_PAGE_SIZE}          // 한 페이지에 15개 행 표시
                    paginationPageSizeSelector={GRID_CONFIG.PAGE_SIZE_OPTIONS} // 페이지 크기 선택 옵션
                    enableCellTextSelection={true}   // 셀 텍스트 선택 가능
                    defaultColDef={defaultColDef}    // 모든 컬럼에 기본적으로 적용될 설정
                    headerHeight={GRID_CONFIG.HEADER_ROW_HEIGHT}                // 헤더 높이
                    rowHeight={GRID_CONFIG.ROW_HEIGHT}                   // 행 높이
                    animateRows={true}               // 행 애니메이션 활성화
                    theme={"legacy"}                 // AG Grid 테마
                    onRowClicked={handleRowClick}    // 행 클릭 이벤트 핸들러
                    rowClassRules={rowClassRules}    // 모든 행에 적용할 CSS 클래스 규칙
                    {...checkboxConfig}              // 체크박스 컬럼이 있을 때만 다중 선택 기능 활성화
                />
            </div>
        </div>
    );
};

// React.forwardRef를 사용해서 ref를 전달할 수 있도록 래핑
const ForwardedAgGridWrapper = React.forwardRef(AgGridWrapper) as <T>(
    props: AgGridWrapperProps<T> & { ref?: React.Ref<AgGridWrapperRef> }
) => ReturnType<typeof AgGridWrapper>;

// 개발자 도구에서 컴포넌트 이름이 제대로 표시되도록 displayName 설정
ForwardedAgGridWrapper.displayName = 'AgGridWrapper';

export default ForwardedAgGridWrapper;