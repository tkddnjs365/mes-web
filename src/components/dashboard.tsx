"use client"

import {User} from "@/types/user";
import DashboardSidebar from "@/components/dashboard-sidebar";
import {useEffect, useState} from "react";
import {useAppContext} from "@/contexts/app-context";
import DashboardMain from "@/components/dashboard-main";

interface DashboardProps {
    user: User
    onLogout: () => void
}

interface Tab {
    id: string
    title: string
    component: React.ReactNode
    closable: boolean
}

const getComponentForMenu = (menuId: string, title: string) => {
    switch (menuId) {
        case "user-management":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">수주현황</h2>
                    <p>수주현황 화면입니다.</p>
                </div>
            )
        case "item-management":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">수주현황</h2>
                    <p>수주현황 화면입니다.</p>
                </div>
            )
        case "item-status":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">품목현황</h2>
                    <p>품목현황 화면입니다.</p>
                </div>
            )
        case "order-management":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">수주현황</h2>
                    <p>수주현황 화면입니다.</p>
                </div>
            )
        case "order-status":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">수주현황</h2>
                    <p>수주현황 화면입니다.</p>
                </div>
            )
        case "delivery-management":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">출고관리</h2>
                    <p>출고관리 화면입니다.</p>
                </div>
            )
        case "delivery-status":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">출고현황</h2>
                    <p>출고현황 화면입니다.</p>
                </div>
            )
        case "customer-management":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">거래처관리</h2>
                    <p>거래처관리 화면입니다.</p>
                </div>
            )
        case "department-management":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">부서관리</h2>
                    <p>부서관리 화면입니다.</p>
                </div>
            )
        case "program-management":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">프로그램 추가</h2>
                    <p>프로그램 추가 화면입니다.</p>
                </div>
            )
        case "production-management":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">프로그램 추가</h2>
                    <p>프로그램 추가 화면입니다.</p>
                </div>
            )
        case "quality-management":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">프로그램 추가</h2>
                    <p>프로그램 추가 화면입니다.</p>
                </div>
            )
        case "equipment-management":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">프로그램 추가</h2>
                    <p>프로그램 추가 화면입니다.</p>
                </div>
            )
        case "production-plan":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">생산계획수립</h2>
                    <p>생산계획수립 화면입니다.</p>
                </div>
            )
        case "production-schedule":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">생산일정관리</h2>
                    <p>생산일정관리 화면입니다.</p>
                </div>
            )
        case "production-status":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">생산현황</h2>
                    <p>생산현황 화면입니다.</p>
                </div>
            )
        case "production-result":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">생산실적</h2>
                    <p>생산실적 화면입니다.</p>
                </div>
            )
        case "quality-result":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">검사결과</h2>
                    <p>검사결과 화면입니다.</p>
                </div>
            )
        case "defect-management":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">불량관리</h2>
                    <p>불량관리 화면입니다.</p>
                </div>
            )
        case "spc-analysis":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">SPC분석</h2>
                    <p>SPC분석 화면입니다.</p>
                </div>
            )
        case "quality-report":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">품질보고서</h2>
                    <p>품질보고서 화면입니다.</p>
                </div>
            )
        case "equipment-monitoring":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">설비모니터링</h2>
                    <p>설비모니터링 화면입니다.</p>
                </div>
            )
        case "preventive-maintenance":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">예방보전</h2>
                    <p>예방보전 화면입니다.</p>
                </div>
            )
        case "maintenance-history":
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">보전이력</h2>
                    <p>보전이력 화면입니다.</p>
                </div>
            )
        default:
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <p>{title} 화면입니다.</p>
                </div>
            )
    }
}

export default function Dashboard({user, onLogout}: DashboardProps) {
    const {setCurrentUser} = useAppContext()
    const [openTabs, setOpenTabs] = useState<Tab[]>([])
    const [activeTab, setActiveTab] = useState<string>("dashboard")
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())

    // 사용자 정보를 AppContext에 설정
    useEffect(() => {
        setCurrentUser(user)
        return () => setCurrentUser(null)
    }, [user, setCurrentUser])

    // 컴포넌트 마운트 시 저장된 탭 상태 복원
    useEffect(() => {
        const restoreTabsFromStorage = () => {
            try {
                const savedTabs = localStorage.getItem("mes-open-tabs")
                const savedActiveTab = localStorage.getItem("mes-active-tab")

                if (savedTabs) {
                    const parsedTabs = JSON.parse(savedTabs)
                    const restoredTabs = parsedTabs.map((tabData: Tab) =>
                        ({
                            ...tabData,
                            component: getComponentForMenu(tabData.id, tabData.title),
                        }))

                    // 대시보드 탭이 없으면 추가
                    const hasDashboard = restoredTabs.some((tab: Tab) => tab.id === "dashboard")
                    if (!hasDashboard) {
                        const dashboardTab: Tab = {
                            id: "dashboard",
                            title: "대시보드",
                            component: <DashboardMain/>,
                            closable: false,
                        }
                        restoredTabs.unshift(dashboardTab)
                    }

                    setOpenTabs(restoredTabs)

                    if (savedActiveTab && restoredTabs.some((tab: Tab) => tab.id === savedActiveTab)) {
                        setActiveTab(savedActiveTab)
                    } else {
                        setActiveTab("dashboard")
                    }
                } else {
                    // 저장된 탭이 없으면 기본 대시보드만 추가
                    const dashboardTab: Tab = {
                        id: "dashboard",
                        title: "대시보드",
                        component: <DashboardMain/>,
                        closable: false,
                    }
                    setOpenTabs([dashboardTab])
                }
            } catch (error) {
                console.error("탭 복원 중 오류:", error)
                // 오류 발생 시 기본 대시보드 탭만 설정
                const dashboardTab: Tab = {
                    id: "dashboard",
                    title: "대시보드",
                    component: <DashboardMain/>,
                    closable: false,
                }
                setOpenTabs([dashboardTab])
            }
        }

        restoreTabsFromStorage()
    }, [user])

    /* 실시간 시간 가져오기 */
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    /* 프로그램 탭으로 오픈 */
    const openTab = (id: string, title: string, component: React.ReactNode) => {
        const existingTab = openTabs.find((tab) => tab.id === id) // 이미 활성화된 탭인지 확인

        let newTabs = openTabs

        // 신규 화면 오픈일때
        if (!existingTab) {
            const newTab: Tab = {id, title, component, closable: true}
            newTabs = [...openTabs, newTab]
            setOpenTabs(newTabs)
        }

        setActiveTab(id) // 현재 활성화 탭 변경
        setIsSidebarOpen(false) // 모바일에서 메뉴 선택 후 사이드바 닫기

        // localStorage에 저장
        saveTabsToStorage(newTabs, id)
    }

    // 탭 상태를 localStorage에 저장
    const saveTabsToStorage = (tabs: Tab[], currentActiveTab: string) => {
        try {
            const tabsToSave = tabs.map((tab) => ({
                id: tab.id,
                title: tab.title,
                closable: tab.closable,
            }))
            localStorage.setItem("mes-open-tabs", JSON.stringify(tabsToSave))
            localStorage.setItem("mes-active-tab", currentActiveTab)
        } catch (error) {
            console.error("탭 저장 중 오류:", error)
        }
    }

    /* 탭 닫기 */
    const closeTab = (tabId: string) => {
        const tabToClose = openTabs.find((tab) => tab.id === tabId)
        if (tabToClose && !tabToClose.closable) {
            return // 닫을 수 없는 탭은 닫지 않음
        }

        // 닫을 탭 제외한 새 탭 배열 생성
        const newTabs = openTabs.filter((tab) => tab.id !== tabId)

        // 활성 탭 변경: 닫은 탭이 활성 탭이라면
        let newActiveTab = activeTab
        if (activeTab === tabId) {
            if (newTabs.length > 0) {
                // 닫은 탭 뒤에 탭이 있으면 그 탭을 활성화, 없으면 앞 탭 활성화
                const closedTabIndex = openTabs.findIndex((tab) => tab.id === tabId)

                if (closedTabIndex < newTabs.length) {
                    newActiveTab = newTabs[closedTabIndex].id
                } else {
                    newActiveTab = newTabs[newTabs.length - 1].id
                }
            } else {
                newActiveTab = "dashboard" // 기본 탭으로 변경
            }
        }

        setOpenTabs(newTabs)
        setActiveTab(newActiveTab)
        saveTabsToStorage(newTabs, newActiveTab)
    }

    return (
        <div className={"flex h-screen bg-gray-100"}>
            {/* 사이드 바 */}
            <div className={"hidden lg:block"}>
                <DashboardSidebar
                    user={user}
                    onMenuClick={(menuId, title) => {
                        const component = getComponentForMenu(menuId, title)
                        openTab(menuId, title, component)
                    }}/>
            </div>

            {/* 모바일 사이드바 오버레이 */}
            {isSidebarOpen &&
                <div className={"fixed inset-0 bg-black-30 z-40"} onClick={() => setIsSidebarOpen(false)}/>}

            {/* 모바일 사이드바 */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg -translate-x-full transition-transform duration-300 ease-in-out z-50 ${isSidebarOpen ? "open" : "closed"} lg:hidden`}>
                <DashboardSidebar
                    user={user}
                    onMenuClick={(menuId, title) => {
                        const component = getComponentForMenu(menuId, title)
                        openTab(menuId, title, component)
                    }}
                />
            </div>

            <div className={"flex-1 flex flex-col min-w-0"}>
                {/* 헤더 */}
                <header className={"bg-white shadow-sm border-b px-4 sm:px-6 py-4"}>
                    <div className={"flex items-center justify-between"}>
                        <div className={"flex items-center space-x-4"}>
                            {/* 햄버거 메뉴 (모바일) */}
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className={`flex flex-col justify-center items-center w-6 h-6 cursor-pointer lg:hidden ${isSidebarOpen ? "open" : ""}`}
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>

                            {/* 로고 및 시스템 정보 */}
                            <div className={"flex items-center space-x-3"}>
                                <div
                                    className={"\"w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"}>
                                    <span className={"text-white font-bold text-sm"}>MES</span>
                                </div>
                                <div>
                                    <h1 className={"text-lg sm:text-xl font-bold text-gray-900"}>제조실행시스템</h1>
                                    <div className={"hidden sm:block text-xs text-gray-500"}>Manufacturing Execution
                                        System Web
                                    </div>
                                </div>
                            </div>

                            {/* 현재 탭 정보 */}
                            <div
                                className={"hidden md:flex items-center space-x-2 ml-6 pl-6 border-l border-gray-200"}>
                                <div className={"w-2 h-2 bg-green-500 rounded-full animate-pulse"}></div>
                                <span className={"text-sm text-gray-600"}>
                                     현재:{" "} <span
                                    className={"font-medium text-gray-900"}>{openTabs.find((tab) => tab.id === activeTab)?.title || "대시보드"}</span>
                                    </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {/* 실시간 시간 */}
                            <div className={"hidden lg:block text-right text-xs text-gray-500"}>
                                <div className={"hidden lg:block text-right text-xs text-gray-500"}>
                                    <div className={"font-medium text-gray-700"}>
                                        {currentTime.toLocaleDateString("ko-KR", {
                                            month: "short",
                                            day: "numeric",
                                            weekday: "short",
                                        })}
                                    </div>
                                    <div className={"font-mono text-sm text-blue-600"}>
                                        {currentTime.toLocaleTimeString("ko-KR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* 사용자 정보 */}
                            <div className={"flex items-center space-x-2 sm:space-x-3"}>
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    <span
                                        className={`px-1.5 py-0.5 rounded text-xs font-medium ${user.role === "admin" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                                        {user.role === "admin" ? "Manager" : "User"}
                                    </span>
                                    </div>
                                </div>

                                {/* 사용자 아바타 */}
                                <div
                                    className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">{user.name.charAt(0)}</span>
                                </div>
                            </div>

                            <button
                                onClick={onLogout}
                                className="text-xs sm:text-sm px-3 py-1 min-h-[36px] rounded-md font-medium transition-all cursor-pointer border border-gray-300 bg-transparent hover:bg-gray-50 flex items-center justify-center">
                                로그아웃
                            </button>
                        </div>
                    </div>
                </header>

                {/* 메인 콘텐츠 */}
                <main className={"flex-1 p-4 sm:p-6 overflow-hidden"}>
                    <div className={"h-full flex flex-col"}>
                        <div className={"mb-4 flex border-b border-gray-200 overflow-x-auto pb-3"}>
                            {openTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap min-w-max
                                        ${activeTab === tab.id
                                        ? "text-blue-600 border-blue-600"
                                        : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                                    }`} onClick={() => {
                                    setActiveTab(tab.id)
                                    saveTabsToStorage(openTabs, tab.id)
                                }}
                                >
                                    <span className="truncate max-w-[120px] sm:max-w-none">{tab.title}</span>
                                    {tab.closable && (
                                        <span
                                            className="mr-3 ml-1 text-gray-400 hover:text-gray-600 text-lg leading-none"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                closeTab(tab.id)
                                            }}
                                        >
                                            ×
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {openTabs.map((tab) => (
                            <div key={tab.id}
                                 className={`flex-1 overflow-hidden ${activeTab === tab.id ? "block" : "hidden"}`}>
                                <div
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
                                    <div className="flex-1 overflow-y-auto">{tab.component}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    )
}