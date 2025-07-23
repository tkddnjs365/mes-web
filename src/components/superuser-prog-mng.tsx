"use client"

import {useEffect, useState} from "react"
import {ProgramService} from "@/services/program-service"
import type {Program} from "@/types/program"

export default function SuperuserProgMng() {
    const [programs, setPrograms] = useState<Program[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingProgram, setEditingProgram] = useState<Program | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        path: "",
        description: "",
    })

    useEffect(() => {
        loadPrograms()
    }, [])

    /* 프로그램 목록 조회 */
    const loadPrograms = async () => {
        setIsLoading(true)
        try {
            const data = await ProgramService.getPrograms()
            setPrograms(data)
        } catch (error) {
            console.error("프로그램 목록 로드 실패:", error)
        } finally {
            setIsLoading(false)
        }
    }

    /* 프로그램 추가 */
    const handleCreate = async () => {
        if (!formData.name || !formData.path) {
            alert("프로그램명과 경로는 필수입니다.")
            return
        }

        setIsLoading(true)

        try {
            const success = await ProgramService.createProgram(formData)
            if (success) {
                alert("프로그램이 등록되었습니다.")
                setIsDialogOpen(false)
                resetForm()
                await loadPrograms()
            } else {
                alert("프로그램 등록에 실패했습니다.")
            }
        } catch {
            alert("프로그램 등록 중 오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    /* 프로그램 수정 */
    const handleUpdate = async () => {
        if (!editingProgram || !formData.name || !formData.path) {
            alert("프로그램명과 경로는 필수입니다.")
            return
        }

        setIsLoading(true)
        try {
            const success = await ProgramService.updateProgram(editingProgram.id, {
                ...formData,
            })
            if (success) {
                alert("프로그램이 수정되었습니다.")
                setIsDialogOpen(false)
                resetForm()
                await loadPrograms()
            } else {
                alert("프로그램 수정에 실패했습니다.")
            }
        } catch {
            alert("프로그램 수정 중 오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    /* 프로그램 삭제 */
    const handleDelete = async (programId: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return

        setIsLoading(true)
        try {
            const success = await ProgramService.deleteProgram(programId)
            if (success) {
                alert("프로그램이 삭제되었습니다.")
                await loadPrograms()
            } else {
                alert("프로그램 삭제에 실패했습니다.")
            }
        } catch {
            alert("프로그램 삭제 중 오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    /* 프로그램 추가 버튼 클릭 */
    const openCreateDialog = () => {
        resetForm()
        setEditingProgram(null)
        setIsDialogOpen(true)
    }

    /* 수정 모달 창 */
    const openEditDialog = (program: Program) => {
        setFormData({
            name: program.name,
            path: program.path,
            description: program.description || "",
        })
        setEditingProgram(program)
        setIsDialogOpen(true)
    }

    /* 프로그램 추가 모달창 데이터 초기화 */
    const resetForm = () => {
        setFormData({
            name: "",
            path: "",
            description: "",
        })
        setEditingProgram(null)
    }

    return (
        <div className={"p-4 sm:p-6 space-y-6"}>
            {/* 상단 */}
            <div className={"flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"}>
                <h1 className={"text-xl sm:text-2xl font-bold"}>프로그램 등록</h1>
                <button
                    onClick={openCreateDialog}
                    className={"px-4 py-4 rounded-md font-medium transition-all cursor-pointer border min-h-[44px] flex items-center justify-center bg-blue-600 text-white border-blue-600 hover:bg-blue-700\n"}
                    disabled={isLoading}
                >
                    프로그램 추가
                </button>
            </div>

            <div className={"bg-white rounded-lg shadow-sm border border-gray-200"}>
                <div className={"p-4"}>
                    {
                        isLoading ? (
                                <div className={"text-center py-8"}>
                                    <div
                                        className={"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"}></div>
                                    <p className={"mt-2 text-gray-600"}>로딩 중...</p>
                                </div>
                            )
                            : (
                                (
                                    programs.length == 0 ? (
                                            <p className={"text-gray-500 text-center py-8"}>등록된 프로그램이 없습니다.</p>
                                        )
                                        : (
                                            <div className={"overflow-x-auto"}>
                                                <table className={"w-full"}>
                                                    <thead>
                                                    <tr className={"border-b"}>
                                                        <th className={"text-left p-3 font-semibold"}>프로그램명</th>
                                                        <th className={"text-left p-3 font-semibold"}>프로그램 경로</th>
                                                        <th className={"text-left p-3 font-semibold"}>설명</th>
                                                        <th className={"text-left p-3 font-semibold"}>등록일</th>
                                                        <th className={"text-center p-3 font-semibold"}>작업</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {programs.map((program) => (
                                                        <tr key={program.id} className="border-b hover:bg-gray-50">
                                                            <td className="p-3 font-medium">{program.name}</td>
                                                            <td className="p-3 text-sm text-gray-600 font-mono">{program.path}</td>
                                                            <td className="p-3 text-sm text-gray-600">{program.description || "-"}</td>
                                                            <td className="p-3 text-sm text-gray-600">
                                                                {new Date(program.createdAt).toLocaleDateString("ko-KR")}
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="flex space-x-2 justify-center">
                                                                    <button
                                                                        onClick={() => openEditDialog(program)}
                                                                        className="px-3 py-1 text-sm min-h-[36px] rounded-md font-medium transition-all cursor-pointer border border-gray-300 flex items-center justify-center bg-transparent hover:bg-gray-50"
                                                                        disabled={isLoading}
                                                                    >
                                                                        수정
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(program.id)}
                                                                        className="px-3 py-1 text-sm min-h-[36px] rounded-md font-medium transition-all cursor-pointer border border-gray-300 flex items-center justify-center bg-red-600 text-white hover:bg-red-700"
                                                                        disabled={isLoading}
                                                                    >
                                                                        삭제
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                )
                            )
                    }
                </div>
            </div>

            {/* 프로그램 등록/수정 다이얼로그 */}
            {isDialogOpen && (
                <div className="fixed inset-0 bg-black-30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full mx-4 max-h-[90vh] overflow-y-auto max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                            <h2 className="text-xl font-bold">{editingProgram ? "프로그램 수정" : "프로그램 등록"}</h2>
                        </div>
                        <div className="px-4 py-3">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">프로그램명 *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="프로그램명을 입력하세요"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">프로그램 경로 *</label>
                                    <input
                                        type="text"
                                        value={formData.path}
                                        onChange={(e) => setFormData({...formData, path: e.target.value})}
                                        placeholder="예: /components/item-management"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                        disabled={isLoading}
                                    />
                                    <p className="text-xs text-gray-500">소스 코드의 컴포넌트 경로를 입력하세요</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">설명</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        placeholder="프로그램 설명을 입력하세요"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] resize-none"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setIsDialogOpen(false)}
                                        className="px-4 py-4 rounded-md font-medium transition-all cursor-pointer border border-gray-300 min-h-[44px] flex items-center justify-center bg-transparent hover:bg-gray-50 flex-1"
                                        disabled={isLoading}
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={editingProgram ? handleUpdate : handleCreate}
                                        className="px-4 py-4 rounded-md font-medium transition-all cursor-pointer border min-h-[44px] flex items-center justify-center bg-blue-600 text-white border-blue-600 hover:bg-blue-700 flex-1"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "처리 중..." : editingProgram ? "수정" : "등록"}
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
