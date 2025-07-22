"use client"

import {useAppContext} from "@/contexts/app-context"
import Login from "@/components/login"

export default function Page() {
    const {currentUser} = useAppContext()

    return (
        <div className="min-h-screen bg-gray-50">
            {currentUser ? (
                /* <Dashboard user={currentUser} onLogout={logout}/>*/
                <div>
                    test
                </div>
            ) : (
                <Login/>
            )}
        </div>
    )
}