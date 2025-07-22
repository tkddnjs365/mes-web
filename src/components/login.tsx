"use client"

import {useState} from "react";
import {useAppContext} from "@/contexts/app-context";

export default function Login() {
    const {login} = useAppContext()

    const [companyCode, setCompanyCode] = useState("") //회사코드
    const [userId, setUserId] = useState("") //로그인ID
    const [password, setPassword] = useState("") //로그인PW
    const [isLoading, setIsLoading] = useState(false)
    const [isSignupOpen, setIsSignupOpen] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true)

        try {
            // 슈퍼유저 로그인 체크 (회사코드가 0000인 경우)
            if (companyCode == "0000") {
            } else {
                // 일반 사용자 로그인
                const success = await login(companyCode, userId, password)
                if (!success) {
                    alert("로그인 정보가 올바르지 않거나 승인되지 않은 계정입니다.")
                }
            }
        } catch {

        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4 mx-auto">
            <div className={"bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-md"}>
                <div className={"p-4 border-b border-gray-200 text-center"}>
                    <h1 className={"text-2xl font-bold"}>MES 시스템</h1>
                </div>
                <div className="p-4">
                    <form onSubmit={handleLogin} className={"space-y-4"}>
                        <div className={"space-y-2"}>
                            <label htmlFor={"companyCode"}
                                   className={"block text-sm font-medium text-gray-700"}>회사코드</label>
                            <input
                                id="companyCode"
                                type="text"
                                placeholder={"회사코드를 입력하세요."}
                                value={companyCode}
                                onChange={(e) => setCompanyCode(e.target.value)}
                                className={"w-full px-3 py2- border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"}
                                required={true}
                                disabled={isLoading}
                            />
                        </div>
                        <div className={"space-y-2"}>
                            <label htmlFor={"userId"}
                                   className={"block text-sm font-medium text-gray-700"}>사용자 ID</label>
                            <input
                                id="userId"
                                type="text"
                                placeholder={"사용자 ID를 입력하세요"}
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className={"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"}
                                required={true}
                                disabled={isLoading}
                            />
                        </div>
                        <div className={"space-y-2"}>
                            <label htmlFor={"password"}
                                   className={"block text-sm font-medium text-gray-700"}>비밀번호</label>
                            <input
                                id="password"
                                type="password"
                                placeholder={"비밀번호를 입력하세요."}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"}
                                required={true}
                                disabled={isLoading}
                            />
                        </div>
                        <button type="submit"
                                className="w-full px-4 py-4 rounded-md font-medium transition-all cursor-pointer border min-h-[44px] flex items-center justify-center bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                disabled={isLoading}>
                            {isLoading ? "로그인 중..." : "로그인"}
                        </button>
                    </form>

                    <div className="mt-4">
                        <button onClick={() => setIsSignupOpen(true)}
                                className={"w-full px-4 py-4 rounded-md font-medium transition-all cursor-pointer border border-gray-300 min-h-[44px] flex items-center justify-center bg-transparent hover:bg-gray-50"}
                                disabled={isLoading}>
                            회원가입
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}