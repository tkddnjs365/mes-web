"use client"

import {useEffect, useState} from "react"
import {SupabaseSuperUserService} from "@/services/supabase-super-user-service"
import {SupabaseProgramService} from "@/services/supabase-program-service"
import type {Company, Company_Admin} from "@/types/user"
import type {CompanyProgram, Program} from "@/types/program"
import {SupabaseCompanyService} from "@/services/supabase-company-service";

export default function SuperuserCompanyMng() {
    const [companies, setCompanies] = useState<Company[]>([]) // 회사 목록
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null) // 선택된 회사
    const [activeTab, setActiveTab] = useState<"admins" | "programs">("admins") // 선택된 탭

    // 관리자 관련 상태
    const [companyAdmins, setCompanyAdmins] = useState<Company_Admin[]>([]) // 회사별 관리자
    const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false) // 괸리자 추가 버튼 클릭 여부

    // 프로그램 관련 상태
    const [allPrograms, setAllPrograms] = useState<Program[]>([]) // 프로그램 목록
    const [companyPrograms, setCompanyPrograms] = useState<CompanyProgram[]>([]) // 회사별 프로그램 

    const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false) // 회사추가 버튼 클릭 여부
    const [isLoading, setIsLoading] = useState(false) // 로딩 여부

    // 회사코드 모달 창 저장 Form
    const [companyFormData, setCompanyFormData] = useState({
        code: "",
        name: "",
        description: "",
    })

    // 관리자 모달 창 저장 Form
    const [adminFormData, setAdminFormData] = useState({
        userId: "",
        password: "",
        name: "",
    })

    useEffect(() => {
        loadCompanies()
        loadAllPrograms()
    }, [])

    /* 회사코드 목록 */
    const loadCompanies = async () => {
        setIsLoading(true)
        try {
            const data = await SupabaseCompanyService.getCompanies()
            setCompanies(data.filter((company) => company.isActive))
        } catch (error) {
            console.error("회사 목록 로드 실패:", error)
        } finally {
            setIsLoading(false)
        }
    }

    /* 전체 프로그램 목록 */
    const loadAllPrograms = async () => {
        try {
            const data = await SupabaseProgramService.getPrograms()
            setAllPrograms(data)
        } catch (error) {
            console.error("프로그램 목록 로드 실패:", error)
        }
    }

    /* 선택된 회사코드의 관리자 조회 */
    const loadCompanyAdmins = async (companyCode: string) => {
        try {
            const data = await SupabaseSuperUserService.getCompanyAdmins(companyCode)
            console.log("선택된 회사별 관리자 : ")
            console.log(data)
            setCompanyAdmins(data)
        } catch (error) {
            console.error("관리자 목록 로드 실패:", error)
        }
    }

    /* 선택된 회사코드의 프로그램 조회 */
    const loadCompanyPrograms = async (companyCode: string) => {
        try {
            const data = await SupabaseProgramService.getCompanyPrograms(companyCode)
            console.log("선택된 회사의 프로그램 : ")
            console.log(data)
            setCompanyPrograms(data)
        } catch (error) {
            console.error("회사 프로그램 목록 로드 실패:", error)
        }
    }

    /* 회사 코드 선택 시 관리자, 프로그램 조회 */
    const handleCompanySelect = async (company: Company) => {
        setSelectedCompany(company)
        await Promise.all([loadCompanyAdmins(company.code), loadCompanyPrograms(company.code)])
    }

    /* 회사 추가 버튼 */
    const handleCreateCompany = async () => {
        if (!companyFormData.code || !companyFormData.name) {
            alert("회사코드와 회사명은 필수입니다.")
            return
        }

        setIsLoading(true)
        try {
            const success = await SupabaseSuperUserService.createCompany(companyFormData)
            if (success) {
                alert("회사가 등록되었습니다.")
                setIsCompanyDialogOpen(false)
                setCompanyFormData({code: "", name: "", description: ""})
                await loadCompanies()
            } else {
                alert("회사 등록에 실패했습니다. 이미 존재하는 회사코드일 수 있습니다.")
            }
        } catch {
            alert("회사 등록 중 오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    /* 관리자 추가 버튼 */
    const handleCreateAdmin = async () => {
        if (!selectedCompany || !adminFormData.userId || !adminFormData.password || !adminFormData.name) {
            alert("모든 필드를 입력해주세요.")
            return
        }

        setIsLoading(true)
        try {
            const success = await SupabaseSuperUserService.createCompanyAdmin({
                companyCode: selectedCompany.code,
                userId: adminFormData.userId,
                password: adminFormData.password,
                name: adminFormData.name,
            })

            if (success) {
                alert("관리자가 등록되었습니다.")
                setIsAdminDialogOpen(false)
                setAdminFormData({userId: "", password: "", name: ""})
                await loadCompanyAdmins(selectedCompany.code)
            } else {
                alert("관리자 등록에 실패했습니다. 이미 존재하는 사용자 ID일 수 있습니다.")
            }
        } catch {
            alert("관리자 등록 중 오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    /* 관리자 삭제 */
    const handleDeleteAdmin = async (adminId: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return

        setIsLoading(true)
        try {
            const success = await SupabaseSuperUserService.deleteCompanyAdmin(adminId)
            if (success) {
                alert("관리자가 삭제되었습니다.")
                if (selectedCompany) {
                    await loadCompanyAdmins(selectedCompany.code)
                }
            } else {
                alert("관리자 삭제에 실패했습니다.")
            }
        } catch {
            alert("관리자 삭제 중 오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    /* 회사별 프로그램 연결 및 삭제 */
    const handleToggleProgram = async (programId: string, isConnected: boolean) => {
        if (!selectedCompany) return

        setIsLoading(true)

        try {
            const success = isConnected
                ? await SupabaseProgramService.disconnectCompanyProgram(selectedCompany.code, programId)
                : await SupabaseProgramService.connectCompanyProgram(selectedCompany.code, programId)

            if (success) {
                await loadCompanyPrograms(selectedCompany.code)
            } else {
                alert(`프로그램 ${isConnected ? "연결 해제" : "연결"}에 실패했습니다.`)
            }
        } catch {
            alert(`프로그램 ${isConnected ? "연결 해제" : "연결"} 중 오류가 발생했습니다.`)
        } finally {
            setIsLoading(false)
        }
    }

    /* 프로그램ID별 해당 회사에 활성화 되어있는지 CHK */
    const isProgramConnected = (programId: string) => {
        return companyPrograms.some((cp) => cp.programId === programId)
    }

    return (
        <div className={"p-4 sm:p-6 space-y-6"}>
            {/* 상단 */}
            <div className={"flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"}>
                <h1 className={"text-xl sm:text-2xl font-bold"}>회사 관리</h1>
                <button
                    onClick={() => {
                        setIsCompanyDialogOpen(true)
                    }}
                    className={"px-4 p-4 rounded-md font-medium cursor-pointer border min-h-[44px] flex items-center justify-center bg-blue-600 text-white border-blue-600 hover:bg-blue-700"}
                    disabled={isLoading}
                >
                    회사 추가
                </button>
            </div>

            <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6"}>
                {/* 회사 목록 */}
                <div className={"bg-white rounded-lg shadow-sm border border-gray-200"}>
                    <div className={"p-4 border-b border-gray-200"}>
                        <h2 className={"text-lg font-bold"}>회사 목록</h2>
                        <p className={"text-sm text-gray-600"}>회사를 선택하면 관리자와 프로그램을 관리 할 수 있습니다.</p>
                    </div>

                    <div className={"p-4"}>
                        {
                            isLoading
                                ? (
                                    <div className={"text-center py-8"}>
                                        <div
                                            className={"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"}/>
                                        <p className={"mt-2 text-gray-600"}>로딩 중...</p>
                                    </div>
                                )
                                : (
                                    companies.length === 0
                                        ? (
                                            <p className={"mt-2 text-gray-600"}>등록된 회사가 없습니다.</p>
                                        )
                                        : (
                                            <div className="space-y-2">
                                                {companies.map((company) => (
                                                    <div
                                                        key={company.id}
                                                        onClick={() => handleCompanySelect(company)}
                                                        className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${selectedCompany?.id === company.id ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                                                    >
                                                        <div className="font-semibold">{company.code}</div>
                                                        <div className="text-sm text-gray-600">{company.name}</div>
                                                        {company.description &&
                                                            <div
                                                                className="text-xs text-gray-500 mt-1">{company.description}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                )
                        }
                    </div>
                </div>

                {/* 관리자/프로그램 관리 */}
                <div className="lg:col-span-2">
                    {!selectedCompany ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-4">
                                <p className="text-gray-500 text-center py-8">회사를 선택해주세요.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold">회사명 : {selectedCompany.name}</h2>
                                        <p className="text-sm text-gray-600">회사코드 : {selectedCompany.code}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setActiveTab("admins")}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                activeTab === "admins"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                        >
                                            관리자
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("programs")}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                activeTab === "programs"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                        >
                                            프로그램
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                {activeTab === "admins" ? (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-semibold">관리자 목록</h3>
                                            <button
                                                onClick={() => setIsAdminDialogOpen(true)}
                                                className="px-4 py-4 rounded-md font-medium transition-all cursor-pointer border min-h-[44px] flex items-center justify-center bg-blue-600 text-white border-blue-600 hover:bg-blue-700 btn-sm"
                                                disabled={isLoading}
                                            >
                                                관리자 추가
                                            </button>
                                        </div>
                                        {companyAdmins.length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">등록된 관리자가 없습니다.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {companyAdmins.map((admin) => (
                                                    <div key={admin.user_idx}
                                                         className="p-4 border border-gray-200 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="font-semibold">{admin.name}</div>
                                                                <div
                                                                    className="text-sm text-gray-600">ID: {admin.user_id}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    등록일: {new Date(admin.createdAt).toLocaleDateString("ko-KR")}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteAdmin(admin.user_idx)}
                                                                className="px-3 py-1 text-sm min-h-[36px] rounded-md font-medium transition-all cursor-pointer border border-gray-300 flex items-center justify-center bg-red-600 text-white hover:bg-red-700"
                                                                disabled={isLoading}
                                                            >
                                                                삭제
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <div className="mb-4">
                                            <h3 className="font-semibold">프로그램 연결 관리</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                체크된 프로그램만 해당 회사에서 사용할 수 있습니다.
                                            </p>
                                        </div>
                                        {allPrograms.length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">등록된 프로그램이 없습니다.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {allPrograms.map((program) => {
                                                    const isConnected = isProgramConnected(program.id)
                                                    return (
                                                        <div key={program.id}
                                                             className="p-4 border border-gray-200 rounded-lg">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isConnected}
                                                                        onChange={() => handleToggleProgram(program.id, isConnected)}
                                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                                        disabled={isLoading}
                                                                    />
                                                                    <div>
                                                                        <div
                                                                            className="font-semibold">{program.name}</div>
                                                                        <div
                                                                            className="text-sm text-gray-600 font-mono">{program.path}</div>
                                                                        {program.description && (
                                                                            <div
                                                                                className="text-xs text-gray-500 mt-1">{program.description}</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <span
                                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${isConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                                                {isConnected ? "연결됨" : "연결 안됨"}
                                                                 </span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 회사 등록 다이얼로그 */}
            {isCompanyDialogOpen && (
                <div className="fixed inset-0 bg-black-30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full mx-4 max-h-[90vh] overflow-y-auto max-w-md"
                         onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold">회사 등록</h2>
                        </div>
                        <div className="p-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">회사코드 *</label>
                                    <input
                                        type="text"
                                        value={companyFormData.code}
                                        onChange={(e) => setCompanyFormData({...companyFormData, code: e.target.value})}
                                        placeholder="회사코드를 입력하세요."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">회사명 *</label>
                                    <input
                                        type="text"
                                        value={companyFormData.name}
                                        onChange={(e) => setCompanyFormData({...companyFormData, name: e.target.value})}
                                        placeholder="회사명을 입력하세요"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">설명</label>
                                    <textarea
                                        value={companyFormData.description}
                                        onChange={(e) => setCompanyFormData({
                                            ...companyFormData,
                                            description: e.target.value
                                        })}
                                        placeholder="회사 설명을 입력하세요"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] resize-none"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setIsCompanyDialogOpen(false)}
                                        className="px-4 py-4 rounded-md font-medium transition-all cursor-pointer border border-gray-300 min-h-[44px] flex items-center justify-center bg-transparent hover:bg-gray-50 flex-1"
                                        disabled={isLoading}
                                    >
                                        취소
                                    </button>
                                    <button onClick={handleCreateCompany}
                                            className="px-4 py-4 rounded-md font-medium transition-all cursor-pointer border min-h-[44px] flex items-center justify-center bg-blue-600 text-white border-blue-600 hover:bg-blue-700 flex-1"
                                            disabled={isLoading}>
                                        {isLoading ? "등록 중..." : "등록"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 관리자 등록 다이얼로그 */}
            {isAdminDialogOpen && selectedCompany && (
                <div className="fixed inset-0 bg-black-30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full mx-4 max-h-[90vh] overflow-y-auto max-w-md"
                         onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold">관리자 등록</h2>
                            <p className="text-gray-600 mt-1">
                                {selectedCompany.name} ({selectedCompany.code})의 관리자를 등록합니다.
                            </p>
                        </div>
                        <div className="p-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">사용자 ID *</label>
                                    <input
                                        type="text"
                                        value={adminFormData.userId}
                                        onChange={(e) => setAdminFormData({...adminFormData, userId: e.target.value})}
                                        placeholder="사용자 ID를 입력하세요"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">비밀번호 *</label>
                                    <input
                                        type="password"
                                        value={adminFormData.password}
                                        onChange={(e) => setAdminFormData({...adminFormData, password: e.target.value})}
                                        placeholder="비밀번호를 입력하세요"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">이름 *</label>
                                    <input
                                        type="text"
                                        value={adminFormData.name}
                                        onChange={(e) => setAdminFormData({...adminFormData, name: e.target.value})}
                                        placeholder="이름을 입력하세요"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setIsAdminDialogOpen(false)}
                                        className="px-4 py-4 rounded-md font-medium transition-all cursor-pointer border border-gray-300 min-h-[44px] flex items-center justify-center bg-transparent hover:bg-gray-50 flex-1"
                                        disabled={isLoading}
                                    >
                                        취소
                                    </button>
                                    <button onClick={handleCreateAdmin}
                                            className="px-4 py-4 rounded-md font-medium transition-all cursor-pointer border min-h-[44px] flex items-center justify-center bg-blue-600 text-white border-blue-600 hover:bg-blue-700 flex-1"
                                            disabled={isLoading}>
                                        {isLoading ? "등록 중..." : "등록"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
