"use client"

import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import type {SuperUser, User} from "@/types/user"
import {getAuthToken, removeAuthToken, saveAuthToken} from "@/lib/auth";
import {UserService} from "@/services/user-service";
import {SuperUserService} from "@/services/super-user-service";

interface AppContextType {
    currentUser: User | null
    currentSuperUser: SuperUser | null
    isLoading: boolean
    isSupabaseConfigured: boolean
    login: (companyCode: string, userId: string, password: string) => Promise<boolean>
    loginSuperUser: (userId: string, password: string) => Promise<boolean>
    logout: () => void
    addPendingUser: (signupData: {
        companyCode: string
        userId: string
        password: string
        name: string
    }) => Promise<boolean>
    setCurrentUser: (user: User | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({children}: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [currentSuperUser, setCurrentSuperUser] = useState<SuperUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSupabaseConfigured] = useState(true) // Supabase 설정 상태

    // 초기 로드 시 저장된 인증 정보 확인
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const authToken = getAuthToken() //토큰 가져오기

                if (authToken) {
                    if (authToken.user.role === "super") {
                        setCurrentSuperUser(authToken.user as SuperUser)
                    } else {
                        setCurrentUser(authToken.user)
                    }
                }
            } catch (error) {
                console.error("인증 초기화 오류:", error)
                removeAuthToken()
            } finally {
                setIsLoading(false)
            }
        }

        initializeAuth()
    }, [])

    // 일반 사용자 로그인
    const login = async (companyCode: string, userId: string, password: string): Promise<boolean> => {
        try {
            setIsLoading(true)
            const user = await UserService.login(companyCode, userId, password)

            if (user) {
                setCurrentUser(user)
                saveAuthToken(user)
                return true
            }
            return false
        } catch (error) {
            console.error("로그인 오류:", error)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    // 슈퍼유저 로그인
    const loginSuperUser = async (userId: string, password: string): Promise<boolean> => {
        try {
            setIsLoading(true)
            const superUser = await SuperUserService.loginSuperUser(userId, password)

            if (superUser) {
                setCurrentSuperUser(superUser)
                saveAuthToken(superUser as User) // SuperUser를 User 타입으로 캐스팅
                return true
            }
            return false
        } catch (error) {
            console.error("슈퍼유저 로그인 오류:", error)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    // 로그아웃
    const logout = () => {
        setCurrentUser(null)
        setCurrentSuperUser(null)
        removeAuthToken()
    }

    // 회원가입 요청
    const addPendingUser = async (signupData: {
        companyCode: string
        userId: string
        password: string
        name: string
    }): Promise<boolean> => {
        try {
             return await UserService.requestSignup(signupData)
        } catch (error) {
            console.error("회원가입 요청 오류:", error)
            return false
        }
    }

    const value: AppContextType = {
        currentUser,
        currentSuperUser,
        isLoading,
        isSupabaseConfigured,
        login,
        loginSuperUser,
        logout,
        addPendingUser,
        setCurrentUser,
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error("useAppContext must be used within an AppProvider")
    }
    return context
}