"use client"

import {useEffect, useState} from "react"
import type {User} from "@/types/user"
import type {ProgramWithDetails} from "@/types/program"
import {UserService} from "@/services/user-service"

interface SidebarProps {
    user: User
    onMenuClick: (menuId: string, title: string) => void
}

interface MenuItem {
    id: string
    title: string
    children?: MenuItem[]
    programId?: number
}

export default function DashboardSidebar({user, onMenuClick}: SidebarProps) {
    const [expandedMenus, setExpandedMenus] = useState<string[]>(["system"])
    const [userPrograms, setUserPrograms] = useState<ProgramWithDetails[]>([])
    const [companyPrograms, setCompanyPrograms] = useState<ProgramWithDetails[]>([])
    const [loading, setLoading] = useState(true)

    // 사용자 프로그램 조회
    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                setLoading(true)

                if (user.role === "admin") {
                    // 관리자는 회사에 연결된 모든 프로그램 조회
                    const programs = await UserService.getCompanyPrograms(user.companyCode)
                    setCompanyPrograms(programs)
                } else if (user.role === "user") {
                    // 일반 사용자는 자신에게 연결된 프로그램만 조회
                    const programs = await UserService.getUserPrograms(user.id, user.companyCode)
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

    // 전체 메뉴 구조 정의
    const getAllMenuItems = (): MenuItem[] => [
        {
            id: "system",
            title: "시스템관리",
            children: [
                {
                    id: "basic",
                    title: "기준관리",
                    children: [
                        {id: "user-management", title: "사용자관리", programId: 1},
                        {id: "item-management", title: "품목관리", programId: 2},
                        {id: "item-status", title: "품목현황", programId: 3},
                        {id: "customer-management", title: "거래처관리", programId: 4},
                        {id: "department-management", title: "부서관리", programId: 5},
                    ],
                },
            ],
        },
        {
            id: "sales",
            title: "영업관리",
            children: [
                {
                    id: "order",
                    title: "수주관리",
                    children: [
                        {id: "order-management", title: "수주관리", programId: 6},
                        {id: "order-status", title: "수주현황", programId: 7},
                    ],
                },
                {
                    id: "ship",
                    title: "출고관리",
                    children: [
                        {id: "delivery-management", title: "출고관리", programId: 8},
                        {id: "delivery-status", title: "출고현황", programId: 9},
                    ],
                },
            ],

        },
        {
            id: "production",
            title: "생산관리",
            children: [
                {id: "production-management", title: "생산관리", programId: 10},
                {id: "production-plan", title: "생산계획수립", programId: 11},
                {id: "production-schedule", title: "생산일정관리", programId: 12},
                {id: "production-status", title: "생산현황", programId: 13},
                {id: "production-result", title: "생산실적", programId: 14},
            ],
        },
        {
            id: "quality",
            title: "품질관리",
            children: [
                {id: "quality-management", title: "품질관리", programId: 15},
                {id: "quality-result", title: "검사결과", programId: 16},
                {id: "defect-management", title: "불량관리", programId: 17},
                {id: "spc-analysis", title: "SPC분석", programId: 18},
                {id: "quality-report", title: "품질보고서", programId: 19},
            ],
        },
        {
            id: "equipment",
            title: "설비관리",
            children: [
                {id: "equipment-management", title: "설비관리", programId: 20},
                {id: "equipment-monitoring", title: "설비모니터링", programId: 21},
                {id: "preventive-maintenance", title: "예방보전", programId: 22},
                {id: "maintenance-history", title: "보전이력", programId: 23},
            ],
        },
    ]

    // 사용자 권한에 따른 메뉴 필터링
    const getFilteredMenuItems = (): MenuItem[] => {
        const allMenus = getAllMenuItems()

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
        const paddingLeft = `${(level + 1)}rem`

        return (
            <div key={item.id}>
                <div
                    className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors ${
                        level > 0 ? "border-l-2 border-gray-400 ml-4" : ""
                    }`}
                    style={{paddingLeft}}
                    onClick={() => {
                        if (hasChildren) {
                            toggleMenu(item.id)
                        } else {
                            onMenuClick(item.id, item.title)
                        }
                    }}
                >
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-700 font-medium">{item.title}</span>
                    </div>

                    {hasChildren && (
                        /* 하위 노드가 있을때만 ▶ 표시 */
                        <span className={`text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}>▶</span>
                    )}
                </div>

                {hasChildren && isExpanded && (
                    <div className="bg-gray-50">{item.children!.map((child) => renderMenuItem(child, level + 1))}</div>
                )}
            </div>
        )
    }

    const filteredMenus = getFilteredMenuItems()
    const availableProgramsCount = user.role === "admin" ? companyPrograms.length : userPrograms.length

    return (
        <div className="w-64 bg-white shadow-lg h-full flex flex-col">
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
                        {user.role === "admin" ? "회사 프로그램" : "연결된 프로그램"}:
                        <span
                            className="font-semibold text-blue-600 ml-1">{loading ? "..." : `${availableProgramsCount}개`}</span>
                    </div>
                )}
            </div>

            {/* 메뉴 */}
            <div className="flex-1 overflow-y-auto">
                {loading && user.role !== "super" ? (
                    <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-xs text-gray-500">메뉴 로딩 중...</p>
                    </div>
                ) : filteredMenus.length === 0 ? (
                    <div className="p-4 text-center">
                        <p className="text-sm text-gray-500">접근 가능한 메뉴가 없습니다.</p>
                        <p className="text-xs text-gray-400 mt-1">관리자에게 문의하세요.</p>
                    </div>
                ) : (
                    <div className="py-2">{filteredMenus.map((item) => renderMenuItem(item))}</div>
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
