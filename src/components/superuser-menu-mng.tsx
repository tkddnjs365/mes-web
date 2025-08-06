"use client"

import {useEffect, useState} from "react"
import {SupabaseProgramService} from "@/services/supabase-program-service"
import type {MenuCategory, MenuLinkProgram, Program} from "@/types/program"

export default function SuperuserMenuMng() {
    const [programs, setPrograms] = useState<Program[]>([])
    const [allCategories, setAllCategories] = useState<MenuCategory[]>([])
    const [mainCategories, setMainCategories] = useState<MenuCategory[]>([])
    const [subCategories, setSubCategories] = useState<MenuCategory[]>([])
    const [selectedMainCategory, setSelectedMainCategory] = useState<MenuCategory | null>(null)
    const [selectedSubCategory, setSelectedSubCategory] = useState<MenuCategory | null>(null)
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [menuLinkPrograms, setMenuLinkPrograms] = useState<MenuLinkProgram[]>([]) // 중메뉴 프로그램

    const [categoryFormData, setCategoryFormData] = useState({
        name: "",
        description: "",
        sortOrder: 0,
        parentId: "",
        saveType: ""
    })

    useEffect(() => {
        const fetchData = async () => {
            await loadData();
        };
        fetchData();
    }, []);


    const loadData = async () => {
        setIsLoading(true)
        try {
            const [programsData, categoriesData] = await Promise.all([
                SupabaseProgramService.getPrograms(),
                SupabaseProgramService.getMenuCategories(),
            ])

            setPrograms(programsData)
            setAllCategories(categoriesData)
            setMainCategories(categoriesData.filter((data) => data.id === data.parentId)) // 대메뉴
            setSubCategories(categoriesData.filter((data: MenuCategory) => data.parentId === selectedMainCategory?.id && data.parentId !== data.id)); //중메뉴
        } catch (error) {
            console.error("데이터 로드 실패:", error)
        } finally {
            setIsLoading(false)
        }
    }

    /* 메뉴 추가 버튼 */
    const handleCreateCategory = async () => {
        if (!categoryFormData.name) {
            alert("메뉴명은 필수입니다.")
            return
        }

        setIsLoading(true)
        try {
            const success = await SupabaseProgramService.createMenuCategory(categoryFormData)
            if (success) {
                alert("메뉴가 등록되었습니다.")
                setIsCategoryDialogOpen(false)
                resetCategoryForm()
                await loadData()
            } else {
                alert("메뉴 등록에 실패했습니다.")
            }
        } catch {
            alert("메뉴 등록 중 오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    const resetCategoryForm = () => {
        setCategoryFormData({
            name: "",
            description: "",
            sortOrder: 0,
            parentId: "",
            saveType: ""
        })
    }

    /* 중메뉴 클릭 */
    const subMenuClick = async (category: MenuCategory) => {
        try {
            setSelectedSubCategory(category)
            await loadMenuLinkPrograms(category.id)
        } catch (error) {
            console.error("회사 프로그램 목록 로드 실패:", error)
        }
    }

    /* 선택된 중메뉴의 프로그램 조회 */
    const loadMenuLinkPrograms = async (menuId: string) => {
        try {
            const data = await SupabaseProgramService.getMenuLihkPrograms(menuId)
            setMenuLinkPrograms(data)
        } catch (error) {
            console.error("회사 프로그램 목록 로드 실패:", error)
        }
    }

    /* 프로그램ID별 해당 중메뉴에 활성화 되어있는지 CHK */
    const isProgramConnected = (programId: string) => {
        return menuLinkPrograms.some((cp) => cp.programId === programId)
    }

    /* 중메뉴별 프로그램 연결 및 삭제 */
    const handleToggleProgram = async (programId: string, isConnected: boolean) => {
        if (!selectedSubCategory) return

        setIsLoading(true)

        try {
            const success = isConnected
                ? await SupabaseProgramService.disconnectMenuProgram(selectedSubCategory.id, programId)
                : await SupabaseProgramService.connectMenuProgram(selectedSubCategory.id, programId)

            if (success) {
                await loadMenuLinkPrograms(selectedSubCategory.id)
            } else {
                alert(`프로그램 ${isConnected ? "연결 해제" : "연결"}에 실패했습니다.`)
            }
        } catch {
            alert(`프로그램 ${isConnected ? "연결 해제" : "연결"} 중 오류가 발생했습니다.`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <h1 className="text-xl sm:text-2xl font-bold">메뉴 등록</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 대메뉴 목록 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[410px] flex flex-col">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 h-[50px]">
                        <h2 className="text-lg font-bold">대메뉴</h2>
                        <button
                            onClick={() => {
                                setCategoryFormData({
                                    name: "",
                                    description: "",
                                    sortOrder: 0,
                                    parentId: "",
                                    saveType: "main",
                                });
                                setIsCategoryDialogOpen(true);
                            }}
                            className="px-3 py-1 text-sm min-h-[36px] rounded-md font-medium transition-all cursor-pointer border flex items-center justify-center bg-blue-600 text-white border-blue-600 hover:bg-blue-700">
                            대메뉴 추가
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-3">
                        {mainCategories.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">등록된 대메뉴가 없습니다.</p>
                        ) : (
                            <div className="space-y-2">
                                {mainCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        onClick={() => {
                                            setSelectedMainCategory(category);
                                            setSelectedSubCategory(null);
                                            setSubCategories(allCategories.filter((data: MenuCategory) => data.parentId === category.id && data.parentId !== data.id));
                                        }}
                                        className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                                            selectedMainCategory?.id === category.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                        }`}
                                    >
                                        <div className="font-semibold">{category.name}</div>
                                        {category.description &&
                                            <div className="text-sm text-gray-600 mt-1">{category.description}</div>}
                                        <div className="text-xs text-gray-500 mt-1">순서: {category.sortOrder}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 중메뉴 목록 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[410px] flex flex-col">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 h-[50px]">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">중메뉴</h2>
                            {selectedMainCategory &&
                                <p className="text-sm text-gray-600 mt-1 ml-4">{selectedMainCategory.name}</p>}
                        </div>
                        {selectedMainCategory &&
                            <button
                                onClick={() => {
                                    setCategoryFormData({
                                        name: "",
                                        description: "",
                                        sortOrder: 0,
                                        parentId: selectedMainCategory.id,
                                        saveType: "sub",
                                    });
                                    setIsCategoryDialogOpen(true);
                                }}

                                className="px-3 py-1 text-sm min-h-[36px] rounded-md font-medium transition-all cursor-pointer border flex items-center justify-center bg-blue-600 text-white border-blue-600 hover:bg-blue-700">
                                중메뉴 추가
                            </button>
                        }
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-3">

                        {!selectedMainCategory ? (
                            <p className="text-gray-500 text-center py-8">대메뉴를 선택해주세요.</p>
                        ) : (
                            <div className="px-4 py-3">
                                {subCategories.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">등록된 중메뉴가 없습니다.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {subCategories.map((category) => (
                                            <div
                                                key={category.id}
                                                onClick={() => subMenuClick(category)}
                                                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                                                    selectedSubCategory?.id === category.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                                }`}
                                            >
                                                <div className="font-semibold">{category.name}</div>
                                                {category.description &&
                                                    <div
                                                        className="text-sm text-gray-600 mt-1">{category.description}</div>}
                                                <div
                                                    className="text-xs text-gray-500 mt-1">순서: {category.sortOrder}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 프로그램 연결 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[410px] flex flex-col">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 h-[50px]">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">프로그램 연결</h2>
                            {selectedSubCategory &&
                                <p className="text-sm text-gray-600 mt-1 ml-4">{selectedSubCategory.name}</p>}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-3">
                        {!selectedSubCategory ? (
                            <p className="text-gray-500 text-center py-8">중메뉴를 선택해주세요.</p>
                        ) : (
                            <div className="px-4 py-3">
                                {programs.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">등록된 프로그램이 없습니다.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {programs.map((program) => {
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
            </div>

            {/* 대메뉴 등록 다이얼로그 */}
            {isCategoryDialogOpen && (
                <div className="fixed inset-0 bg-black-30 flex items-center justify-center z-50 p-4">
                    <div className="max-w-md bg-white rounded-lg shadow-xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                         onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                            <h2 className="text-xl font-bold">메뉴 등록</h2>
                        </div>
                        <div className="px-4 py-3">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">메뉴명 *</label>
                                    <input
                                        type="text"
                                        value={categoryFormData.name}
                                        onChange={(e) => setCategoryFormData({
                                            ...categoryFormData,
                                            name: e.target.value
                                        })}
                                        placeholder="메뉴명을 입력하세요."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">설명</label>
                                    <input
                                        type="text"
                                        value={categoryFormData.description}
                                        onChange={(e) => setCategoryFormData({
                                            ...categoryFormData,
                                            description: e.target.value
                                        })}
                                        placeholder="메뉴 설명을 입력하세요"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">정렬 순서</label>
                                    <input
                                        type="number"
                                        value={categoryFormData.sortOrder}
                                        onChange={(e) =>
                                            setCategoryFormData({
                                                ...categoryFormData,
                                                sortOrder: Number.parseInt(e.target.value) || 0
                                            })
                                        }
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setIsCategoryDialogOpen(false)}
                                        className="flex-1 px-4 py-4 rounded-md font-medium transition-all cursor-pointer border border-gray-300 min-h-[44px] flex items-center justify-center bg-transparent hover:bg-gray-50"
                                        disabled={isLoading}
                                    >
                                        취소
                                    </button>
                                    <button onClick={handleCreateCategory}
                                            className="flex-1 px-4 py-4 rounded-md font-medium transition-all cursor-pointer border min-h-[44px] flex items-center justify-center bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
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
