"use client"

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {ColDef} from "ag-grid-community";
import AgGridWrapper, {AgGridWrapperRef} from "@/components/common/ag-grid-wrapper";
import {DataSql} from "@/services/data-sql";
import {CommonCode, Company, CompanyInsertData} from "@/types/data-sql";
import {useAppContext} from "@/contexts/app-context";
import {CommonToolbar} from "@/components/common/common-toolbar";
import {FormLabelText} from "@/components/ui/form-label-text"
import {FormLabelSelect} from "@/components/ui/form-label-select";
import {validateRequiredFields} from "@/utils/validation";

const USE_YN_OPTIONS = [
    {label: "Yes", value: "Y"},
    {label: "No", value: "N"},
];

// 거래처 정보 초기 상태
const INITIAL_SAVE_CONDITION = {
    coCd: '',
    coNm: '',
    useYn: 'Y',
    compAddr: '',
    compType: '',
    compItem: '',
    compCurr: '',
    bizNo: '',
    ceoNm: '',
    tel: '',
    fax: '',
    email: '',
    country: '',
    coType: [] as string[],
};

export default function CompanyMng() {
    const {currentUser} = useAppContext()
    const [isLoading, setIsLoading] = useState(false)
    const [rowData, setRowData] = useState<Company[]>([])
    const [searchCondition, setSearchCondition] = useState({company: ''}) // 조회조건용
    const [saveCondition, setSaveCondition] = useState(INITIAL_SAVE_CONDITION) // 저장용
    const [selectIdx, setSelectIdx] = useState("") // 선택된 idx
    const [invalidFields, setInvalidFields] = useState<string[]>([]); // 저장 오류상태 Chk 관리
    const [curr, setCurr] = useState<CommonCode[]>([{label: "", value: ""}])
    const [country, setCountry] = useState<CommonCode[]>([{label: "", value: ""}])
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

        const [currData, countryData, coTypeData] = await Promise.all([
            DataSql.get_comm_code(currentUser.companyIdx, 'sys.curr'),
            DataSql.get_comm_code(currentUser.companyIdx, 'sys.country'),
            DataSql.get_comm_code(currentUser.companyIdx, 'sys.co_type')
        ]);

        setCurr([{label: "", value: ""}, ...currData]); //화폐
        setCountry([{label: "", value: ""}, ...countryData]); //국가
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
                const data = await DataSql.get_company_list(currentUser.companyIdx, searchCondition.company)
                setRowData(data)
            }
        } catch (error) {
            console.error("조회 실패:", error)
        } finally {
            setIsLoading(false)
        }
    }

    /* AG 그리드 ROW 클릭 */
    const handleRowClick = async (selectedItem: Company) => {
        if (selectedItem.coIdx) {
            setSaveCondition(INITIAL_SAVE_CONDITION)
            setSelectIdx("")
            setSelectIdx(selectedItem.coIdx)
            setInvalidFields([]);
            await loadItemDetail(selectedItem.coIdx);
        }
    }

    const loadItemDetail = async (coIdx: string) => {
        setIsLoading(true)

        try {
            if (!currentUser) {
                console.error("사용자 정보가 없습니다.");
                return;
            }

            const data = await DataSql.get_company_list(currentUser.companyIdx, "", coIdx, "")

            // 조회된 데이터가 있으면 saveCondition에 설정
            if (data && data.length > 0) {
                const detailData = data[0];
                setSaveCondition({
                    coCd: detailData.coCd || '',
                    coNm: detailData.coNm || '',
                    useYn: detailData.useYn || '',
                    compAddr: detailData.compAddr || '',
                    compType: detailData.compType || '',
                    compItem: detailData.compItem || '',
                    compCurr: detailData.compCurr || '',
                    bizNo: detailData.bizNo || '',
                    ceoNm: detailData.ceoNm || '',
                    tel: detailData.tel || '',
                    fax: detailData.fax || '',
                    email: detailData.email || '',
                    country: detailData.country || '',
                    coType: detailData.coType || [],
                });
            }
        } catch (error) {
            console.error("로드 실패:", error)
        } finally {
            setIsLoading(false)
        }
    }

    /* 툴바 핸들러 */
    // 조회 조건 초기화
    const handleResetCondition = () => {
        setSearchCondition({
            company: '',
        })
        setSaveCondition(INITIAL_SAVE_CONDITION)
        setSelectIdx("");
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
            setSelectIdx("");
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
            {field: saveCondition.coCd, name: "거래처코드", key: "coCd"},
            {field: saveCondition.coNm, name: "거래처명", key: "coNm"},
            {field: saveCondition.coType, name: "거래처유형", key: "coType"},
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

        const companyData: CompanyInsertData = {
            companyIdx: currentUser.companyIdx,
            coCd: saveCondition.coCd,
            coNm: saveCondition.coNm,
            useYn: saveCondition.useYn,
            compAddr: saveCondition.compAddr,
            compType: saveCondition.compType,
            compItem: saveCondition.compItem,
            compCurr: saveCondition.compCurr,

            bizNo: saveCondition.bizNo,
            ceoNm: saveCondition.ceoNm,
            tel: saveCondition.tel,
            fax: saveCondition.fax,
            email: saveCondition.email,
            country: saveCondition.country,
            userIdx: currentUser?.id,

            coType: saveCondition.coType,
        };

        const result = await DataSql.set_company_list(selectIdx, [companyData]);
        if (result.success) {
            alert("저장되었습니다.");
            await loadItemList();

            setSaveCondition(INITIAL_SAVE_CONDITION)
            setSelectIdx("");
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
                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-1 rounded-lg border border-gray-200">
                            <label
                                className="text-sm font-semibold text-gray-700 min-w-[50px] whitespace-nowrap text-center">
                                거래처명
                            </label>
                            <input
                                type="text"
                                value={searchCondition.company}
                                onChange={(e) => setSearchCondition({
                                    ...searchCondition,
                                    company: e.currentTarget.value
                                })}
                                className="w-[280px] min-h-[36px] px-3 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="거래처명 또는 거래처코드 입력"
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
                <div className={"w-[55%] h-[65vh]"}>
                    <AgGridWrapper<Company>
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
                    className="bg-white rounded-lg shadow-md border border-gray-200 w-[45%] h-80 min-h-[65vh] overflow-x-auto overflow-y-auto">
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
                                    <span>거래처 일반 정보</span>
                                </div>

                                {/* 가운데: 상태 표시 */}
                                <div className="ml-4 flex items-center space-x-2 text-xs text-white">
                                    <div
                                        className={`w-2 h-2 rounded-full ${selectIdx ? 'bg-red-500' : 'bg-white'}`}></div>
                                    <span>{selectIdx ? '수정 등록' : '신규 등록'}</span>
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
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <h3 className="text-sm font-semibold text-gray-800">기본 정보</h3>
                            </div>

                            {/* 첫 번째 줄 */}
                            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                                <FormLabelText
                                    label="거래처코드"
                                    value={saveCondition.coCd}
                                    onChange={(val) => {
                                        setSaveCondition({...saveCondition, coCd: val});
                                        if (invalidFields.includes("coCd") && val.trim() !== "") {
                                            setInvalidFields(invalidFields.filter((key) => key !== "coCd"));
                                        }
                                    }}
                                    placeholder="거래처코드를 입력하세요"
                                    disabled={isLoading}
                                    inputWidth="w-full"
                                    isError={invalidFields.includes("coCd")}
                                />

                                <FormLabelText
                                    label="거래처명"
                                    value={saveCondition.coNm}
                                    onChange={(val) => {
                                        setSaveCondition({...saveCondition, coNm: val});
                                        if (invalidFields.includes("coNm") && val.trim() !== "") {
                                            setInvalidFields(invalidFields.filter((key) => key !== "coNm"));
                                        }
                                    }}
                                    placeholder="거래처명을 입력하세요"
                                    disabled={isLoading}
                                    inputWidth="w-full"
                                    isError={invalidFields.includes("coNm")}
                                />
                            </div>

                            {/* 두 번째 줄 */}
                            <div className="grid grid-cols-1">
                                <FormLabelText
                                    label="주소"
                                    value={saveCondition.compAddr}
                                    onChange={(val) => {
                                        setSaveCondition({...saveCondition, compAddr: val});
                                        if (invalidFields.includes("compAddr") && val.trim() !== "") {
                                            setInvalidFields(invalidFields.filter((key) => key !== "compAddr"));
                                        }
                                    }}
                                    placeholder="주소를 입력하세요"
                                    disabled={isLoading}
                                    inputWidth="w-full"
                                    isError={invalidFields.includes("compAddr")}
                                />
                            </div>

                            {/* 세 번째 줄 */}
                            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                                <FormLabelSelect
                                    label="거래처유형"
                                    value={saveCondition.coType}
                                    onChange={(val) => {
                                        // val은 string | string[] 타입이므로 타입 체크 필요
                                        const newCoType = Array.isArray(val) ? val : [val];
                                        setSaveCondition({...saveCondition, coType: newCoType});

                                        // 유효성 검사 - 배열이 비어있지 않은지 확인
                                        if (invalidFields.includes("coType") && newCoType.length > 0) {
                                            setInvalidFields(invalidFields.filter((key) => key !== "coType"));
                                        }
                                    }}
                                    options={coType}
                                    disabled={isLoading}
                                    isError={invalidFields.includes("coType")}
                                    type={"multi"}
                                />
                                <FormLabelSelect
                                    label="화폐"
                                    value={saveCondition.compCurr}
                                    onChange={(val) => {
                                        const value = val as string;
                                        setSaveCondition({...saveCondition, compCurr: value});
                                        if (invalidFields.includes("compCurr") && value.trim() !== "") {
                                            setInvalidFields(invalidFields.filter((key) => key !== "compCurr"));
                                        }
                                    }}
                                    options={curr}
                                    disabled={isLoading}
                                    isError={invalidFields.includes("compCurr")}
                                />
                            </div>

                            {/* 네 번째 줄 */}
                            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                                <FormLabelText
                                    label="사업형태"
                                    value={saveCondition.compType}
                                    onChange={(val) => {
                                        setSaveCondition({...saveCondition, compType: val});
                                        if (invalidFields.includes("compType") && val.trim() !== "") {
                                            setInvalidFields(invalidFields.filter((key) => key !== "compType"));
                                        }
                                    }}
                                    placeholder="사업형태를 입력하세요"
                                    disabled={isLoading}
                                    inputWidth="w-full"
                                    isError={invalidFields.includes("compType")}
                                />
                                <FormLabelText
                                    label="산업종목"
                                    value={saveCondition.compItem}
                                    onChange={(val) => {
                                        setSaveCondition({...saveCondition, compItem: val});
                                        if (invalidFields.includes("compItem") && val.trim() !== "") {
                                            setInvalidFields(invalidFields.filter((key) => key !== "compItem"));
                                        }
                                    }}
                                    placeholder="산업종목를 입력하세요"
                                    disabled={isLoading}
                                    inputWidth="w-full"
                                    isError={invalidFields.includes("compItem")}
                                />
                            </div>

                            {/* 다섯 번째 줄 */}
                            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                                <FormLabelText
                                    label="사업자등록번호"
                                    value={saveCondition.bizNo}
                                    onChange={(val) => {
                                        setSaveCondition({...saveCondition, bizNo: val});
                                        if (invalidFields.includes("bizNo") && val.trim() !== "") {
                                            setInvalidFields(invalidFields.filter((key) => key !== "bizNo"));
                                        }
                                    }}
                                    placeholder="사업자등록번호를 입력하세요"
                                    disabled={isLoading}
                                    inputWidth="w-full"
                                    isError={invalidFields.includes("bizNo")}
                                />

                                <FormLabelText
                                    label="대표자명"
                                    value={saveCondition.ceoNm}
                                    onChange={(val) => {
                                        setSaveCondition({...saveCondition, ceoNm: val});
                                        if (invalidFields.includes("ceoNm") && val.trim() !== "") {
                                            setInvalidFields(invalidFields.filter((key) => key !== "ceoNm"));
                                        }
                                    }}
                                    placeholder="대표자명을 입력하세요"
                                    disabled={isLoading}
                                    inputWidth="w-full"
                                    isError={invalidFields.includes("ceoNm")}
                                />
                            </div>

                            {/* 여섯 번째 줄 */}
                            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                                <FormLabelText
                                    label="대표 전화번호"
                                    value={saveCondition.tel}
                                    onChange={(val) => {
                                        setSaveCondition({...saveCondition, tel: val});
                                        if (invalidFields.includes("tel") && val.trim() !== "") {
                                            setInvalidFields(invalidFields.filter((key) => key !== "tel"));
                                        }
                                    }}
                                    placeholder="전화번호를 입력하세요"
                                    disabled={isLoading}
                                    inputWidth="w-full"
                                    isError={invalidFields.includes("tel")}
                                />

                                <FormLabelText
                                    label="대표 팩스번호"
                                    value={saveCondition.fax}
                                    onChange={(val) => {
                                        setSaveCondition({...saveCondition, fax: val});
                                        if (invalidFields.includes("fax") && val.trim() !== "") {
                                            setInvalidFields(invalidFields.filter((key) => key !== "fax"));
                                        }
                                    }}
                                    placeholder="팩스번호를 입력하세요"
                                    disabled={isLoading}
                                    inputWidth="w-full"
                                    isError={invalidFields.includes("fax")}
                                />
                            </div>

                            {/* 일곱 번째 줄*/}
                            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                                <FormLabelText
                                    label="대표 이메일"
                                    value={saveCondition.email}
                                    onChange={(val) => {
                                        setSaveCondition({...saveCondition, email: val});
                                        if (invalidFields.includes("email") && val.trim() !== "") {
                                            setInvalidFields(invalidFields.filter((key) => key !== "email"));
                                        }
                                    }}
                                    placeholder="이메일을 입력하세요"
                                    disabled={isLoading}
                                    inputWidth="w-full"
                                    isError={invalidFields.includes("email")}
                                />

                                <FormLabelSelect
                                    label="국가"
                                    value={saveCondition.country}
                                    onChange={(val) => {
                                        const value = val as string;
                                        setSaveCondition({...saveCondition, country: value});
                                        if (invalidFields.includes("country") && value.trim() !== "") {
                                            setInvalidFields(invalidFields.filter((key) => key !== "country"));
                                        }
                                    }}
                                    options={country}
                                    disabled={isLoading}
                                    isError={invalidFields.includes("country")}
                                />
                            </div>

                            {/* 여덟 번째 줄*/}
                            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                                <FormLabelSelect
                                    label="사용여부"
                                    value={saveCondition.useYn}
                                    onChange={(val) => {
                                        const value = val as string;
                                        setSaveCondition({...saveCondition, useYn: value});
                                    }}
                                    options={USE_YN_OPTIONS}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* 하단 버튼 */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 pb-1 border-b border-gray-200"/>

                            <div className="flex justify-end">
                                <CommonToolbar
                                    onReset={() => {
                                        setSaveCondition(INITIAL_SAVE_CONDITION);
                                        setSelectIdx("");
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