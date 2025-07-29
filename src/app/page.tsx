"use client"

import {useAppContext} from "@/contexts/app-context"
import Login from "@/components/login"
import SuperuserDashboard from "@/components/superuser-dashboard";
import Dashboard from "@/components/dashboard";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Page() {
    const {currentUser, currentSuperUser, logout, isLoading} = useAppContext()

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">로딩 중...</p>
                </div>
            </div>
        )
    }

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