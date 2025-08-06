"use client"

import {useEffect, useState} from "react"
import type {User} from "@/types/user"
import type {MenuItem, ProgramWithDetails} from "@/types/program"
import {SupabaseUserService} from "@/services/supabase-user-service"
import {SupabaseProgramService} from "@/services/supabase-program-service";

interface SidebarProps {
    user: User
    onMenuClick: (menuId: string, title: string) => void
}

export default function DashboardSidebar({user, onMenuClick}: SidebarProps) {
    const [expandedMenus, setExpandedMenus] = useState<string[]>(["system"])
    const [userPrograms, setUserPrograms] = useState<ProgramWithDetails[]>([])
    const [companyPrograms, setCompanyPrograms] = useState<ProgramWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [filteredMenus, setFilteredMenus] = useState<MenuItem[]>([])

    // 모든 메뉴 ID를 재귀적으로 수집하는 함수
    const getAllMenuIds = (menus: MenuItem[]): string[] => {
        const ids: string[] = []

        const collectIds = (items: MenuItem[]) => {
            items.forEach(item => {
                if (item.children && item.children.length > 0) {
                    ids.push(item.id)
                    collectIds(item.children)
                }
            })
        }

        collectIds(menus)
        return ids
    }

    useEffect(() => {
        const loadMenus = async () => {
            const menus = await getFilteredMenuItems()
            setFilteredMenus(menus)

            // 모든 메뉴를 확장 상태로 설정
            const allMenuIds = getAllMenuIds(menus)
            setExpandedMenus(allMenuIds)
        }

        loadMenus()
    }, [companyPrograms])

    // 사용자 프로그램 조회
    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                setLoading(true)

                if (user.role === "admin") {
                    // 관리자는 회사에 연결된 모든 프로그램 조회
                    const programs = await SupabaseUserService.getCompanyPrograms(user.company_idx)
                    setCompanyPrograms(programs)
                } else if (user.role === "user") {
                    // 일반 사용자는 자신에게 연결된 프로그램만 조회
                    const programs = await SupabaseUserService.getUserPrograms(user.id, user.company_idx)
                    setUserPrograms(programs)
                }
            } catch (error) {
                console.error("프로그램 조회 오류:", error)
            } finally {
                setLoading(false)
            }
        }

        if (user.role !== "super") {
            fetchPrograms()
        } else {
            setLoading(false)
        }
    }, [user])

    // 사용자 권한에 따른 메뉴 필터링
    const getFilteredMenuItems = async (): Promise<MenuItem[]> => {
        const allMenus = await SupabaseProgramService.getAllMenuItems()
        if (user.role === "super") {
            // 슈퍼유저는 모든 메뉴 접근 가능
            return allMenus
        }

        if (user.role === "admin") {
            // 관리자는 회사에 연결된 프로그램만 접근 가능
            return filterMenusByPrograms(allMenus, companyPrograms)
        }

        if (user.role === "user") {
            // 일반 사용자는 자신에게 연결된 프로그램만 접근 가능
            return filterMenusByPrograms(allMenus, userPrograms)
        }

        return []
    }

    // 프로그램 목록에 따른 메뉴 필터링
    // menus : 전체 메뉴, programs : 사용자권한 프로그램
    const filterMenusByPrograms = (menus: MenuItem[], programs: ProgramWithDetails[]): MenuItem[] => {
        const programIds = programs.map((p) => p.programId) //id만 추출해서 배열로 생성

        const filterMenu = (menu: MenuItem): MenuItem | null => {
            if (menu.children) {
                const filteredChildren = menu.children
                    .map((child) => filterMenu(child))
                    .filter((child) => child !== null) as MenuItem[]

                if (filteredChildren.length > 0) {
                    return {...menu, children: filteredChildren}
                }
                return null
            } else {
                // 리프 메뉴인 경우 programId 확인
                if (menu.programId && programIds.includes(menu.programId)) {
                    return menu
                }
                return null
            }
        }

        return menus
            .map((menu) => filterMenu(menu))
            .filter((menu) => menu !== null) as MenuItem[]
    }

    /* 하위 메뉴 생성 */
    const toggleMenu = (menuId: string) => {
        setExpandedMenus((prev) => (prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]))
    }

    /* 메뉴 생성 */
    const renderMenuItem = (item: MenuItem, level = 0) => {
        const hasChildren = item.children && item.children.length > 0 //하위 노드 여부
        const isExpanded = expandedMenus.includes(item.id)

        // MES 스타일 레벨별 들여쓰기 및 색상
        const levelStyles = {
            0: "bg-gradient-to-r from-blue-500 to-blue-800 text-white border-b border-blue-800",
            1: "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-b border-slate-300 ml-3",
            2: "bg-white text-slate-700 border-b border-slate-200 ml-6",
        }

        const hoverStyles = {
            0: "hover:from-blue-700 hover:to-blue-800",
            1: "hover:from-slate-200 hover:to-slate-300 hover:shadow-sm",
            2: "hover:bg-blue-50 hover:text-blue-800",
        }

        const currentLevelStyle = levelStyles[level as keyof typeof levelStyles] || levelStyles[2]
        const currentHoverStyle = hoverStyles[level as keyof typeof hoverStyles] || hoverStyles[2]

        return (
            <div key={item.id} className="transition-all duration-200">
                <div
                    className={`
                        flex items-center justify-between px-4 py-2 cursor-pointer 
                        transition-all duration-200 ease-in-out
                        ${currentLevelStyle} 
                        ${currentHoverStyle}
                        ${level === 0 ? 'font-bold text-sm shadow-md' : 'font-medium text-sm'}
                        ${level > 0 ? 'border-l-4 border-blue-600' : ''}
                    `}
                    onClick={() => {
                        if (hasChildren) {
                            toggleMenu(item.id)
                        } else {
                            onMenuClick(item.id, item.title)
                        }
                    }}
                >
                    <div className="flex items-center space-x-3">
                        {/* 아이콘 추가 */}
                        {level === 0 && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                      d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
                                      clipRule="evenodd"/>
                            </svg>
                        )}
                        {level === 1 && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                      clipRule="evenodd"/>
                            </svg>
                        )}
                        {level >= 2 && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}

                        <span className={"text-sm leading-tight"}>
                            {item.title}
                        </span>
                    </div>

                    {hasChildren && (
                        <div className="flex items-center space-x-2">
                            {/* 하위 메뉴 개수 표시 */}
                            <span className={`
                                text-xs px-2 py-1 rounded-full 
                                ${level === 0
                                ? 'bg-blue-950 text-blue-100'
                                : 'bg-slate-400 text-white'
                            }
                            `}>
                                {item.children!.length}
                            </span>

                            {/* 토글 아이콘 */}
                            <svg
                                className={`
                                    w-4 h-4 transition-transform duration-200 ease-in-out
                                    ${isExpanded ? "rotate-90" : ""}
                                    ${level === 0 ? 'text-blue-100' : 'text-slate-500'}
                                `}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path fillRule="evenodd"
                                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                      clipRule="evenodd"/>
                            </svg>
                        </div>
                    )}
                </div>

                {hasChildren && isExpanded && (
                    <div className="transition-all duration-300 ease-in-out">
                        {item.children!.map((child) => renderMenuItem(child, level + 1))}
                    </div>
                )}
            </div>
        )
    }

    const availableProgramsCount = user.role === "admin" ? companyPrograms.length : userPrograms.length

    return (
        <div className="w-64 bg-white shadow-2xl h-full flex flex-col border-r-1 border-blue-600">
            {/* 헤더 */}
            <div className="p-5 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div>
                        <h2 className="font-bold text-gray-900">메뉴 목록</h2>
                    </div>
                </div>
            </div>

            {/* 프로그램 정보 */}
            <div className="p-2 border-b border-gray-200 bg-gray-50">
                {user.role !== "super" && (
                    <div className="mt-2 text-xs text-gray-600">
                        {"연결된 프로그램"}:
                        <span
                            className="font-semibold text-blue-600 ml-1">{loading ? "..." : `${availableProgramsCount}개`}</span>
                    </div>
                )}
            </div>

            {/* 메뉴 */}
            <div className="flex-1 overflow-y-auto bg-slate-50">
                {loading && user.role !== "super" ? (
                    <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-sm text-slate-600 font-medium">메뉴 구성 중...</p>
                        <p className="text-xs text-slate-500 mt-1">잠시만 기다려주세요</p>
                    </div>
                ) : filteredMenus.length === 0 ? (
                    <div className="p-6 text-center">
                        <div
                            className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                      clipRule="evenodd"/>
                            </svg>
                        </div>
                        <p className="text-sm text-slate-700 font-medium">접근 가능한 메뉴가 없습니다</p>
                        <p className="text-xs text-slate-500 mt-2">관리자에게 권한을 요청하세요</p>
                    </div>
                ) : (
                    <div className="py-2">
                        {filteredMenus.map((item) => renderMenuItem(item))}
                    </div>
                )}
            </div>

            {/* 푸터 */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>시스템 정상</span>
                    </div>
                    <div>v1.0</div>
                </div>
            </div>
        </div>
    )
}
