import type React from "react"
import type {Metadata} from "next"
import {AppProvider} from "@/contexts/app-context"
import "./globals.css"

export const metadata: Metadata = {
    title: "MES 시스템",
    description: "제조실행시스템",
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="ko">
        <body>
        <AppProvider>{children}</AppProvider>
        </body>
        </html>
    )
}
