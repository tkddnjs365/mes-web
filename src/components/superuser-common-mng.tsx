"use client"

import {useCallback, useEffect, useState} from "react"
import type {Company} from "@/types/user"
import {CompaniesService} from "@/services/companies-service";
import {CommonGroupData} from "@/types/data-sql";
import {DataSql} from "@/services/data-sql";
import {FormLabelText} from "@/components/ui/form-label-text";
import {FormLabelSelect} from "@/components/ui/form-label-select";

// 상수 정의
const USE_YN_OPTIONS = [
    {label: "Yes", value: "Y"},
    {label: "No", value: "N"},
];

const INITIAL_SAVE_CONDITION = {
    groupId: '',
    value: '',
    sortOrder: 1,
    useYn: 'Y',
    keyId: '',
};

const DIALOG_TYPES = {
    GROUP: "Group" as const,
    DATA: "Data" as const,
    NEW: "New" as const,
    UPDATE: "Update" as const,
};

type DialogOpenType = typeof DIALOG_TYPES.GROUP | typeof DIALOG_TYPES.DATA | "";
type DialogType = typeof DIALOG_TYPES.NEW | typeof DIALOG_TYPES.UPDATE | "";

export default function SuperuserCompanyMng() {
    // 상태 관리
    const [companies, setCompanies] = useState<Company[]>([])
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
    const [selectedCommon, setSelectedCommon] = useState<CommonGroupData | null>(null)
    const [selectedCommonData, setSelectedCommonData] = useState<CommonGroupData | null>(null)
    const [commonCodeGroup, setCommonCodeGroup] = useState<CommonGroupData[] | null>(null)
    const [commonCodeData, setCommonCodeData] = useState<CommonGroupData[] | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogOpenType, setDialogOpenType] = useState<DialogOpenType>("")
    const [dialogType, setDialogType] = useState<DialogType>("")
    const [saveCondition, setSaveCondition] = useState(INITIAL_SAVE_CONDITION)
    const [isLoading, setIsLoading] = useState(false)

    // 초기화
    useEffect(() => {
        loadCompanies()
    }, [])

    // 유틸리티 함수들
    const resetSaveCondition = useCallback(() => {
        setSaveCondition(INITIAL_SAVE_CONDITION)
    }, [])

    const resetSelections = useCallback(() => {
        setSelectedCommon(null)
        setSelectedCommonData(null)
        setCommonCodeData(null)
        setCommonCodeGroup(null)
        setSelectedCompany(null)
        resetSaveCondition()
    }, [resetSaveCondition])

    const closeDialog = useCallback(() => {
        setDialogOpen(false)
        setDialogOpenType("")
        setDialogType("")
        resetSaveCondition()
    }, [resetSaveCondition])

    const showAlert = useCallback((message: string) => {
        alert(message)
    }, [])

    const showConfirm = useCallback((message: string): boolean => {
        return confirm(message)
    }, [])

    // API 호출 함수들
    const loadCompanies = useCallback(async () => {
        setIsLoading(true)
        try {
            const data = await CompaniesService.getCompanies("admin")
            setCompanies(data.filter((company) => company.isActive))
        } catch (error) {
            console.error("회사 목록 로드 실패:", error)
            showAlert("회사 목록을 불러오는데 실패했습니다.")
        } finally {
            setIsLoading(false)
        }
    }, [showAlert])

    const loadCommonCodeGroup = useCallback(async (companyIdx: string) => {
        try {
            const data = await DataSql.get_comm_code_dtl(companyIdx, "sys")
            setCommonCodeGroup(data)
        } catch (error) {
            console.error("공통코드 그룹 로드 실패:", error)
            showAlert("공통코드 그룹을 불러오는데 실패했습니다.")
        }
    }, [showAlert])

    const loadCommonCodeData = useCallback(async (companyId: string, dataId: string) => {
        try {
            const data = await DataSql.get_comm_code_dtl(companyId, dataId)
            setCommonCodeData(data)
        } catch (error) {
            console.error("공통코드 데이터 로드 실패:", error)
            showAlert("공통코드 데이터를 불러오는데 실패했습니다.")
        }
    }, [showAlert])

    // 이벤트 핸들러들
    const handleCompanySelect = useCallback(async (company: Company) => {
        resetSelections()
        setSelectedCompany(company)
        setSaveCondition(prev => ({...prev, groupId: "sys"}))
        await loadCommonCodeGroup(company.id)
    }, [resetSelections, loadCommonCodeGroup])

    /* 그룹코드 클릭 이벤트 */
    const handleGroupCdSelect = useCallback(async (groupData: CommonGroupData) => {
        if (!selectedCompany) return

        setSelectedCommon(groupData)
        setCommonCodeData(null)
        setSelectedCommonData(null)
        resetSaveCondition()
        setSaveCondition(prev => ({...prev, groupId: groupData.dataId}))
        await loadCommonCodeData(selectedCompany.id, groupData.dataId)
    }, [selectedCompany, resetSaveCondition, loadCommonCodeData])

    const openDialog = useCallback((type: DialogOpenType, mode: DialogType) => {
        setDialogOpen(true)
        setDialogOpenType(type)
        setDialogType(mode)
    }, [])

    const validateSaveCondition = useCallback((): boolean => {
        if (!selectedCompany || !saveCondition.keyId || !saveCondition.value || !saveCondition.groupId) {
            showAlert("모든 필드를 입력해주세요.")
            return false
        }
        return true
    }, [selectedCompany, saveCondition, showAlert])

    const handleInsert = useCallback(async () => {
        if (!validateSaveCondition()) return
        if (!showConfirm("저장하시겠습니까?")) return

        setIsLoading(true)
        try {
            const success = await DataSql.set_comm_code(
                selectedCompany!.id,
                saveCondition.groupId,
                saveCondition.value,
                saveCondition.sortOrder,
                saveCondition.useYn === "Y" ? "1" : "0",
                saveCondition.keyId
            )

            if (success) {
                showAlert("등록되었습니다.")
                closeDialog()
                resetSelections()
            } else {
                showAlert("저장에 실패 했습니다.")
            }
        } catch (error) {
            console.error("등록 오류:", error)
            showAlert("등록 중 오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }, [validateSaveCondition, showConfirm, selectedCompany, saveCondition, showAlert, closeDialog, resetSelections, loadCommonCodeGroup])

    const handleDelete = useCallback(async (dataId: string) => {
        if (!selectedCompany) return
        if (!showConfirm("정말 삭제하시겠습니까?")) return

        setIsLoading(true)
        try {
            const success = await DataSql.del_comm_code(selectedCompany.id, dataId)
            if (success) {
                showAlert("삭제되었습니다.")
                closeDialog()
                resetSelections()
            } else {
                showAlert("삭제에 실패했습니다.")
            }
        } catch (error) {
            console.error("삭제 오류:", error)
            showAlert("삭제 중 오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }, [selectedCompany, showConfirm, showAlert, closeDialog, resetSelections, loadCommonCodeGroup])

    // 컴포넌트 렌더링 함수들
    const renderLoadingSpinner = () => (
        <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"/>
            <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
    )

    const renderCompanyList = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold">회사 목록</h2>
                <p className="text-sm text-gray-600">회사를 선택하면 공통코드를 관리 할 수 있습니다.</p>
            </div>
            <div className="p-4">
                {isLoading ? renderLoadingSpinner() : (
                    companies.length === 0 ? (
                        <p className="mt-2 text-gray-600">등록된 회사가 없습니다.</p>
                    ) : (
                        <div className="space-y-2">
                            {companies.map((company) => (
                                <div
                                    key={company.id}
                                    onClick={() => handleCompanySelect(company)}
                                    className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                                        selectedCompany?.id === company.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                    }`}
                                >
                                    <div className="font-semibold">{company.code}</div>
                                    <div className="text-sm text-gray-600">{company.name}</div>
                                    {company.description && (
                                        <div className="text-xs text-gray-500 mt-1">{company.description}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    )

    const renderActionButton = (label: string, onClick: () => void) => (
        <button
            onClick={onClick}
            className="px-4 py-4 rounded-md font-medium transition-all cursor-pointer border h-[35px] min-h-[35px] flex items-center justify-center bg-blue-600 text-white border-blue-600 hover:bg-blue-700 btn-sm"
            disabled={isLoading}
        >
            {label}
        </button>
    )

    const renderDeleteButton = (onClick: () => void) => (
        <button
            onClick={onClick}
            className="px-3 py-1 text-sm min-h-[36px] rounded-md font-medium transition-all cursor-pointer border border-gray-300 flex items-center justify-center bg-red-600 text-white hover:bg-red-700"
            disabled={isLoading}
        >
            삭제
        </button>
    )

    const renderDataItem = (value: CommonGroupData, isSelected: boolean, onSelect: () => void, onDelete: () => void) => (
        <div
            key={value.dataId}
            onClick={onSelect}
            className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
            }`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <div className="font-semibold text-sm">
                        데이터 : <span className="font-semibold text-lg">{value.value}</span>
                    </div>
                    <div className="font-semibold text-sm">
                        Key값 : <span className="font-semibold text-lg">{value.keyId}</span>
                    </div>
                </div>
                {renderDeleteButton(onDelete)}
            </div>
        </div>
    )

    /* 그룹코드 */
    const renderCommonCodeGroup = () => {
        if (!selectedCompany) {
            return (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4">
                        <p className="text-gray-500 text-center py-8">회사를 선택해주세요.</p>
                    </div>
                </div>
            )
        }

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold">회사명 : {selectedCompany.name}</h2>
                            <p className="text-sm text-gray-600">회사코드 : {selectedCompany.code}</p>
                        </div>
                    </div>
                </div>
                <div className="p-4">
                    <div className="flex justify-end items-center mb-4">
                        {renderActionButton("그룹 추가", () => openDialog(DIALOG_TYPES.GROUP, DIALOG_TYPES.NEW))}
                    </div>
                    {commonCodeGroup?.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">등록된 그룹코드가 없습니다.</p>
                    ) : (
                        <div className="space-y-2">
                            {commonCodeGroup?.map((value) =>
                                renderDataItem(
                                    value,
                                    value.dataId === selectedCommon?.dataId,
                                    () => handleGroupCdSelect(value),
                                    () => handleDelete(value.dataId)
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const renderCommonCodeData = () => {
        if (!selectedCommon) {
            return (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4">
                        <p className="text-gray-500 text-center py-8">그룹코드를 선택해주세요.</p>
                    </div>
                </div>
            )
        }

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold">데이터 : {selectedCommon?.value}</h2>
                            <p className="text-sm text-gray-600">Key값 : {selectedCommon?.keyId}</p>
                        </div>
                    </div>
                </div>
                <div className="p-4">
                    <div className="flex justify-end items-center mb-4">
                        {renderActionButton("데이터 추가", () => openDialog(DIALOG_TYPES.DATA, DIALOG_TYPES.NEW))}
                    </div>
                    {commonCodeData?.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">등록된 데이터 없습니다.</p>
                    ) : (
                        <div className="space-y-2">
                            {commonCodeData?.map((value) =>
                                renderDataItem(
                                    value,
                                    value.dataId === selectedCommonData?.dataId,
                                    () => setSelectedCommonData(value),
                                    () => handleDelete(value.dataId)
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const renderDialog = () => {
        if (!dialogOpen || !selectedCompany) return null

        return (
            <div className="fixed inset-0 bg-black-30 flex items-center justify-center z-50 p-4">
                <div
                    className="bg-white rounded-lg shadow-xl w-full mx-4 max-h-[90vh] overflow-y-auto max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold">{dialogOpenType} 등록</h2>
                    </div>
                    <div className="p-4">
                        <div className="space-y-4">
                            <FormLabelText
                                label="키 값"
                                value={saveCondition.keyId}
                                onChange={(val) => setSaveCondition(prev => ({...prev, keyId: val}))}
                                placeholder={`예 : ${dialogOpenType === DIALOG_TYPES.GROUP ? "item_type" : "1"}`}
                                disabled={isLoading}
                                inputWidth="w-full"
                            />
                            <FormLabelText
                                label="데이터"
                                value={saveCondition.value}
                                onChange={(val) => setSaveCondition(prev => ({...prev, value: val}))}
                                placeholder={`예 : ${dialogOpenType === DIALOG_TYPES.GROUP ? "품목구분" : "완제품"}`}
                                disabled={isLoading}
                                inputWidth="w-full"
                            />
                            <FormLabelSelect
                                label="사용여부"
                                value={saveCondition.useYn}
                                onChange={(val) => {
                                    const value = val as string;
                                    setSaveCondition(prev => ({...prev, useYn: value}))
                                }}
                                options={USE_YN_OPTIONS}
                                disabled={isLoading}
                            />
                            <div className="flex space-x-2">
                                <button
                                    onClick={closeDialog}
                                    className="px-4 py-4 rounded-md font-medium transition-all cursor-pointer border border-gray-300 min-h-[40px] flex items-center justify-center bg-transparent hover:bg-gray-50 flex-1"
                                    disabled={isLoading}
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleInsert}
                                    className="px-4 py-4 rounded-md font-medium transition-all cursor-pointer border min-h-[40px] flex items-center justify-center bg-blue-600 text-white border-blue-600 hover:bg-blue-700 flex-1"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "등록 중..." : "등록"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <h1 className="text-xl sm:text-2xl font-bold">공통코드 관리</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
                {renderCompanyList()}
                <div className="lg:col-span-2 overflow-y-auto min-h-[40vh]">
                    {renderCommonCodeGroup()}
                </div>
                <div className="lg:col-span-2 overflow-y-auto min-h-[40vh]">
                    {renderCommonCodeData()}
                </div>
            </div>

            {renderDialog()}
        </div>
    )
}