import type {User} from "@/types/user"

export interface AuthToken {
    user: User
    token: string
    expiresAt: number
}

export const AUTH_TOKEN_KEY = "mes_auth_token"

// 사용자 정보를 기반으로 토큰 문자열 생성
export function generateToken(user: User): string {
    /* btoa : 문자열을 Base64로 인코딩
       userId와 현재 시간(timestamp)을 JSON으로 묶어 base64 인코딩
    */
    return btoa(JSON.stringify({userId: user.id, timestamp: Date.now()}))
}

// 사용자 정보를 로컬스토리지에 저장
export function saveAuthToken(user: User): void {
    const token = generateToken(user)
    const authToken: AuthToken = {
        user,
        token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 현재 시간 + 24시간
    }
    // 로컬스토리지에 문자열로 저장
    localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(authToken))
}

// 저장된 인증 토큰을 가져옴
export function getAuthToken(): AuthToken | null {
    try {
        const stored = localStorage.getItem(AUTH_TOKEN_KEY) // 저장된 값 가져오기
        if (!stored) return null

        const authToken: AuthToken = JSON.parse(stored) // JSON 파싱

        // 현재 시간이 만료 시간보다 크면 토큰 삭제 후 null 반환
        if (Date.now() > authToken.expiresAt) {
            removeAuthToken()
            return null
        }

        return authToken // 유효한 토큰 반환
    } catch {
        removeAuthToken()
        return null
    }
}

// 로컬 인증 토큰 삭제
export function removeAuthToken(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY) // 로컬스토리지에서 제거
    localStorage.removeItem("mes-open-tabs")
    localStorage.removeItem("mes-active-tab")
}

// 토큰이 유효한지 확인
export function isTokenValid(): boolean {
    const authToken = getAuthToken() // 토큰 가져오기
    return authToken !== null
}
