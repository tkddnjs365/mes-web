"use client"

import {useState} from "react";
import {useAppContext} from "@/contexts/app-context";

export default function Login() {
    const {login, loginSuperUser, addPendingUser} = useAppContext()

    const [companyCode, setCompanyCode] = useState("") //회사코드
    const [userId, setUserId] = useState("") //로그인ID
    const [password, setPassword] = useState("") //로그인PW
    const [isLoading, setIsLoading] = useState(false)
    const [isSignupOpen, setIsSignupOpen] = useState(false)

    // 회원가입용 데이터
    const [signupData, setSignupData] = useState({
        companyCode: "",
        userId: "",
        password: "",
        name: "",
    })

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true)

        try {
            // 슈퍼유저 로그인 체크 (회사코드가 super인 경우)
            if (companyCode == "super") {
                const success = await loginSuperUser(userId, password)
                if (!success) {
                    alert("슈퍼관리자 로그인 정보가 올바르지 않습니다.")
                }
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

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const success = await addPendingUser(signupData)
            if (success) {
                alert("회원가입 요청이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.")
                setIsSignupOpen(false)
                setSignupData({companyCode: "", userId: "", password: "", name: ""})
            } else {
                alert("회원가입 요청 중 오류가 발생했습니다. 이미 존재하는 사용자 ID일 수 있습니다.")
            }
        } catch {
            alert("회원가입 요청 중 오류가 발생했습니다.")
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

                    <div className="mt-4 text-center text-sm text-gray-600">
                        <p>테스트 계정:</p>
                        <p>회사코드 : 1000, ID : admin, PW : admin</p>
                    </div>
                </div>
            </div>

            {/* 회원가입 모달 창 */}
            {isSignupOpen && (
                <div className={"fixed inset-0 bg-black-30 flex items-center justify-center z-50 p-4"}>
                    <div className={"bg-white rounded-lg shadow-xl w-full mx-4 max-h-[90vh] overflow-y-auto max-w-md"}
                         onClick={(e) => e.stopPropagation()}>
                        <div className={"p-4 border-b border-gray-200"}>
                            <h2 className={"text-xl font-bold"}>회원가입</h2>
                            <p className={"text-gray-600 mt-1"}>새 계정을 생성합니다. 관리자 승인 후 로그인이 가능합니다.</p>
                        </div>
                        <div className={"p-4"}>
                            <form onSubmit={handleSignup} className={"space-y-4"}>
                                <div className={"space-y-2"}>
                                    <label htmlFor="signup-companyCode" className="block text-sm font-medium text-gray-700">
                                        회사코드
                                    </label>
                                    <input
                                        id="signup-companyCode"
                                        type="text"
                                        placeholder="회사코드를 입력하세요"
                                        value={signupData.companyCode}
                                        onChange={(e) => setSignupData({...signupData, companyCode: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="signup-userId" className="block text-sm font-medium text-gray-700">
                                        사용자 ID
                                    </label>
                                    <input
                                        id="signup-userId"
                                        type="text"
                                        placeholder="사용자 ID를 입력하세요"
                                        value={signupData.userId}
                                        onChange={(e) => setSignupData({...signupData, userId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="signup-password"
                                           className="block text-sm font-medium text-gray-700">
                                        비밀번호
                                    </label>
                                    <input
                                        id="signup-password"
                                        type="password"
                                        placeholder="비밀번호를 입력하세요"
                                        value={signupData.password}
                                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700">
                                        이름
                                    </label>
                                    <input
                                        id="signup-name"
                                        type="text"
                                        placeholder="이름을 입력하세요"
                                        value={signupData.name}
                                        onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsSignupOpen(false)}
                                        className="px-4 py-4 min-h-[44px] rounded-md font-medium transition-all cursor-pointer border border-gray-300 bg-transparent hover:bg-gray-50 flex items-center justify-center flex-1"
                                        disabled={isLoading}
                                    >
                                        취소
                                    </button>
                                    <button type="submit" className="flex-1 px-4 py-4 min-h-[44px] rounded-md font-medium transition-all cursor-pointer border flex items-center justify-center bg-blue-600 text-white border-blue-600 hover:bg-blue-700" disabled={isLoading}>
                                        {isLoading ? "요청 중..." : "가입요청"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
