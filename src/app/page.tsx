"use client"

import {useAppContext} from "@/contexts/app-context"
import Login from "@/components/login"
import SuperuserDashboard from "@/components/superuser-dashboard";
import Dashboard from "@/components/dashboard";

export default function Page() {
    const {currentUser, currentSuperUser, logout} = useAppContext()

    return (
        <div className="min-h-screen bg-gray-50">
            {currentSuperUser ? (
                <SuperuserDashboard/>
            ) : currentUser ? (
                <Dashboard user={currentUser} onLogout={logout}/>
            ) : (
                <Login/>
            )}
        </div>
    )
}