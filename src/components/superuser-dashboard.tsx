"use client"

import {useAppContext} from "@/contexts/app-context";
import {useState} from "react";
import SuperuserCompanyMng from "./superuser-company-mng"
import SuperuserProgMng from "@/components/superuser-prog-mng";
import SuperuserMenuMng from "@/components/superuser-menu-mng";

type SuperMenuItem = "unified-company" | "program" | "menu"

export default function SuperuserDashboard() {
    const {currentSuperUser, logout} = useAppContext()
    const [activeMenu, setActiveMenu] = useState<SuperMenuItem>("unified-company")

    const menuItems = [
        {id: "unified-company" as SuperMenuItem, name: "회사 관리", description: "회사 등록 및 관리자/프로그램 관리"},
        {id: "program" as SuperMenuItem, name: "프로그램 관리", description: "시스템에서 사용할 프로그램 관리"},
        {id: "menu" as SuperMenuItem, name: "메뉴 관리", description: "네비게이션 메뉴 구조 관리"},
    ]

    const renderContent = () => {
        switch (activeMenu) {
            case "unified-company":
                return <SuperuserCompanyMng/>
            case "program":
                return <SuperuserProgMng/>
            case "menu":
                return <SuperuserMenuMng/>
            default:
                return <SuperuserCompanyMng/>
        }
    }
    return (
        <div className={"min-h-screen bg-gray-50"}>
            {/* 헤더 */}
            <header className={"bg-white shadow-sm border-b"}>
                <div className={"px-4 sm:px-6 lg:px-8"}>
                    <div className={"flex justify-between items-center h-16"}>
                        <div className={"flex items-center space-x-4"}>
                            <h1 className={"text-xl font-bold text-gray-900"}>관리자 시스템</h1>
                            <span className={"text-sm text-gray-500"}>환영합니다, {currentSuperUser?.name}님</span>
                        </div>
                        <button onClick={logout}
                                className={"flex items-center justify-center px-3 py-1 text-sm font-medium rounded-md border border-gray-300 min-h-[36px] transition-all cursor-pointer hover:bg-gray-50"}>
                            로그아웃
                        </button>
                    </div>
                </div>
            </header>

            <div className={"flex"}>
                {/* 사이드바 */}
                <nav className={"w-64 gb-white shadow-sm min-h-screen"}>
                    <div className={"p-4"}>
                        <div className={"space-y-2"}>
                            {
                                menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveMenu(item.id)}
                                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                                            activeMenu === item.id ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <div className={"font-medium"}>{item.name}</div>
                                        <div
                                            className={`text-xs mt-1 ${activeMenu === item.id ? "text-blue-100" : "text-gray-500"}`}>
                                            {item.description}
                                        </div>
                                    </button>
                                ))
                            }
                        </div>
                    </div>
                </nav>

                {/* 메인 컨텐츠 */}
                <main className="flex-1">{renderContent()}</main>
            </div>
        </div>
    )
}