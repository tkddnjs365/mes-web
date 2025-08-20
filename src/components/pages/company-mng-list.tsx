"use client"

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {ColDef} from "ag-grid-community";
import AgGridWrapper, {AgGridWrapperRef} from "@/components/common/ag-grid-wrapper";
import {DataSql} from "@/services/data-sql";
import {CommonCode, Company} from "@/types/data-sql";
import {useAppContext} from "@/contexts/app-context";
import {CommonToolbar} from "@/components/common/common-toolbar";
import {FormLabelSelect} from "@/components/ui/form-label-select";
import {FormLabelText} from "@/components/ui/form-label-text";

const USE_YN_OPTIONS = [
    {label: "", value: ""},
    {label: "Yes", value: "Y"},
    {label: "No", value: "N"},
];
const SEARCH_CONDITION = {
    company: '',
    coType: [] as string[],
    useYn: '',
};

export default function CompanyMngList() {
    const {currentUser} = useAppContext()
    const [isLoading, setIsLoading] = useState(false)
    const [rowData, setRowData] = useState<Company[]>([])
    const [searchCondition, setSearchCondition] = useState(SEARCH_CONDITION) // 조회조건용
    const [coType, setCoType] = useState<CommonCode[]>([{label: "", value: ""}])

    // 거래처유형 변환 함수
    const getCoTypeLabels = useCallback((values: string[] | null | undefined): string => {
        if (!values || !Array.isArray(values)) return '';

        const labels = values.map(value => {
            const foundItem = coType.find(item => item.value === value);
            return foundItem ? foundItem.label : value;
        });
        return labels.join(', ');
    }, [coType]);

    const columnDefs = useMemo<ColDef[]>(() => [
        {headerName: "co_idx", field: "coIdx", width: 50, hide: true,},
        {headerName: "거래처코드", field: "coCd", width: 200, cellClass: "ag-text-center-cell",},
        {headerName: "거래처명", field: "coNm", width: 250},
        {headerName: "주소", field: "compAddr", width: 250},
        {
            headerName: "거래처유형",
            field: "coType",
            width: 150,
            cellRenderer: (params: { value: string[] | null | undefined }) => {
                return getCoTypeLabels(params.value);
            }
        },
        {
            headerName: "사용여부",
            field: "useYn",
            width: 110,
            cellStyle: {display: "flex", justifyContent: "center", alignItems: "center"},
        },
        {headerName: "화폐", field: "compCurr", width: 100, cellClass: "ag-text-center-cell",},
        {headerName: "사업형태", field: "compType", width: 150, cellClass: "ag-text-center-cell",},
        {headerName: "산업종목", field: "compItem", width: 150, cellClass: "ag-text-center-cell",},
        {headerName: "사업자등록번호", field: "bizNo", width: 200, cellClass: "ag-text-center-cell",},
        {headerName: "대표자명", field: "ceoNm", width: 150, cellClass: "ag-text-center-cell",},
        {headerName: "대표전화번호", field: "tel", width: 150, cellClass: "ag-text-center-cell",},
        {headerName: "대표팩스번호", field: "fax", width: 150, cellClass: "ag-text-center-cell",},
        {headerName: "대표이메일", field: "email", width: 150, cellClass: "ag-text-center-cell",},
        {headerName: "국가", field: "country", width: 150, cellClass: "ag-text-center-cell",},
        {headerName: "수정자", field: "updatedUser", width: 100, cellClass: "ag-text-center-cell",},
        {headerName: "수정일시", field: "updatedAt", width: 200, cellClass: "ag-text-center-cell",},
    ], [getCoTypeLabels]);

    const gridRef = useRef<AgGridWrapperRef>(null);

    // 컴포넌트 마운트 시 공통코드 로드
    useEffect(() => {
        if (currentUser?.companyIdx) {
            loadCommonCodes();
        }
    }, [currentUser]);

    /* 공통코드 로드 */
    const loadCommonCodes = async () => {
        if (!currentUser?.companyIdx) return;

        const [coTypeData] = await Promise.all([
            DataSql.get_comm_code(currentUser.companyIdx, 'sys.co_type')
        ]);

        setCoType([...coTypeData]); //거래처유형
        try {
        } catch (error) {
            console.error("공통코드 로드 실패:", error);
        }
    };

    /* 목록 조회 */
    const loadItemList = async () => {
        setIsLoading(true)

        try {
            if (!currentUser) {
                setRowData([])
            } else {
                const data = await DataSql.get_company_list(currentUser.companyIdx, searchCondition.company, "", searchCondition.useYn)
                setRowData(data)
            }
        } catch (error) {
            console.error("조회 실패:", error)
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
            const fileName = `거래처목록_${currentDate}`;
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
                        {/* 거래처명 */}
                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-1 rounded-lg border border-gray-200">
                            <FormLabelText
                                label="거래처명"
                                value={searchCondition.company}
                                onChange={(val) => {
                                    setSearchCondition({...searchCondition, company: val});
                                }}
                                placeholder="거래처명 또는 거래처코드 입력"
                                disabled={isLoading}
                                inputWidth="w-[280px]"
                            />
                        </div>

                        {/* 사용여부 */}
                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-1 rounded-lg border border-gray-200">
                            <FormLabelSelect
                                label="사용여부"
                                value={searchCondition.useYn}
                                onChange={(val) => {
                                    const value = val as string;
                                    setSearchCondition({...searchCondition, useYn: value});
                                }}
                                options={USE_YN_OPTIONS}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className={"flex justify-between space-x-2 w-full"}>
                <div className={"w-[100%] h-[65vh]"}>
                    <AgGridWrapper<Company>
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