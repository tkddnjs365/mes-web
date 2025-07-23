"use client"

import {useAppContext} from "@/contexts/app-context"
import Login from "@/components/login"
import SuperuserDashboard from "@/components/superuser-dashboard";

export default function Page() {
    const {currentUser, currentSuperUser} = useAppContext()

    return (
        <div className="min-h-screen bg-gray-50">
            {currentSuperUser ? (
                <SuperuserDashboard />
            ) : currentUser ? (
                <div>
                    asdsadsadsad
                    test
                </div>
            ) : (
                <Login/>
            )}
        </div>
    )
}