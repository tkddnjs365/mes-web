"use client"

import {useEffect, useState} from "react"
import {useAppContext} from "@/contexts/app-context"
import {UserService} from "@/services/user-service"
import type {PendingUser, User} from "@/types/user"
import {ProgramService} from "@/services/program-service";
import {Prog_Menu_Company} from "@/types/program";
import {LoadingSpinner} from "@/components/loading-spiner";

export default function UserMng() {
    const {currentUser, currentSuperUser} = useAppContext()
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]) // 대기중인 사용자 목록
    const [approvedUsers, setApprovedUsers] = useState<User[]>([]) // 승인된 사용자 목록
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending")
    const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Prog_Menu_Company[]>>({});

    const user = currentUser || currentSuperUser

    // 데이터 로드
    useEffect(() => {
        loadData()
    }, [])

    // 카테고리별 권한 그룹화
    useEffect(() => {
        const fetchPermissions = async () => {
            if (selectedUser) {
                const permissions = await ProgramService.getProgMenuCompany(selectedUser?.companyIdx);

                const grouped = permissions.reduce(
                    (acc, permission) => {
                        if (!acc[permission.menuName]) {
                            acc[permission.menuName] = [];
                        }
                        acc[permission.menuName].push(permission);
                        return acc;
                    },
                    {} as Record<string, typeof permissions>
                );
                setGroupedPermissions(grouped);
            }
        };

        fetchPermissions();
    }, [selectedUser]);

    /* 사용자 목록 가져오기 */
    const loadData = async () => {
        setIsLoading(true)
        try {
            const [pending, approved] = await Promise.all([
                UserService.getPendingUsers(currentUser?.companyIdx),
                UserService.getApprovedUsers(currentUser?.companyIdx),
            ])
            setPendingUsers(pending)

            console.log(approved)
            setApprovedUsers(approved.filter((user) => user.role !== "admin"))
        } catch (error) {
            console.error("데이터 로드 오류:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // 사용자 승인
    const handleApproveUser = async (pendingUserId: string) => {
        try {
            if (!confirm("사용자를 승인 하시겠습니까?")) return

            const success = await UserService.approveUser(pendingUserId)
            if (success) {
                await loadData()
                alert("사용자가 승인되었습니다.")
            } else {
                alert("사용자 승인에 실패했습니다.")
            }
        } catch (error) {
            console.error("사용자 승인 오류:", error)
            alert("사용자 승인 중 오류가 발생했습니다.")
        }
    }

    // 사용자 거부
    const handleRejectUser = async (pendingUserId: string) => {
        if (!confirm("정말로 이 사용자를 거부하시겠습니까?")) return

        try {
            const success = await UserService.rejectUser(pendingUserId)
            if (success) {
                await loadData()
                alert("사용자가 거부되었습니다.")
            } else {
                alert("사용자 거부에 실패했습니다.")
            }
        } catch (error) {
            console.error("사용자 거부 오류:", error)
            alert("사용자 거부 중 오류가 발생했습니다.")
        }
    }

    // 권한 수정 모달 열기
    const openPermissionModal = (user: User) => {
        setSelectedUser(user)
        setSelectedPermissions(user.permissions || [])
    }

    // 권한 수정 저장
    const handleSavePermissions = async () => {
        if (!selectedUser) return

        try {
            const success = await UserService.updateUserPermissions(selectedUser.id, selectedPermissions)
            if (success) {
                await loadData()
                setSelectedUser(null)
                setSelectedPermissions([])
                alert("권한이 업데이트되었습니다.")
            } else {
                alert("권한 업데이트에 실패했습니다.")
            }
        } catch (error) {
            console.error("권한 업데이트 오류:", error)
            alert("권한 업데이트 중 오류가 발생했습니다.")
        }
    }

    // 권한 토글
    const togglePermission = (permissionId: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permissionId) ? prev.filter((p) => p !== permissionId) : [...prev, permissionId],
        )
    }


    if (!user || (user.role !== "admin" && user.role !== "super")) {
        return (
            <div className="p-6">
                <div className="text-center text-gray-500">사용자 관리 권한이 없습니다.</div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* 탭 */}
            <div className="border-b border-gray-200">
                <nav className="mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "pending"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        승인 대기 ({pendingUsers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("approved")}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "approved"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        승인된 사용자 ({approvedUsers.length})
                    </button>
                </nav>
            </div>

            {/* 로딩 상태 */}
            {isLoading && <LoadingSpinner/>}

            {/* 승인 대기 탭 */}
            {activeTab === "pending" && !isLoading && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold">승인 대기 사용자</h2>
                    </div>

                    <div className="p-4">
                        {pendingUsers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">승인 대기 중인 사용자가 없습니다.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                {/* divide-y : 수직방향 경계선 */}
                                <table className="min-w-full divide-y divide-gray-400">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            사용자 정보
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            회사코드
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            신청일
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            작업
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {pendingUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.userId}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.company_code}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className={"flex  space-x-2"}>
                                                    <button onClick={() => handleApproveUser(user.id)}
                                                            className="px-3 py-1 text-sm min-h-[36px] rounded-md font-medium transition-all cursor-pointer border flex items-center justify-center bg-blue-600 text-white border-blue-600 hover:bg-blue-700">
                                                        승인
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectUser(user.id)}
                                                        className="px-3 py-1 text-sm min-h-[36px] rounded-md font-medium transition-all cursor-pointer border  bg-transparent flex items-center justify-center text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                                                    >
                                                        거부
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 승인된 사용자 탭 */}
            {activeTab === "approved" && !isLoading && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold">승인된 사용자</h2>
                    </div>
                    <div className="p-4">
                        {approvedUsers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">승인된 사용자가 없습니다.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            사용자 정보
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            역할
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            권한
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            가입일
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            작업
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {approvedUsers.filter((user) => user.role !== "admin").map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.userId}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                                                }`}
                                            >
                                              {user.role === "admin" ? "관리자" : "사용자"}
                                            </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {(Array.isArray(user.permissions)
                                                        ? user.permissions
                                                        : JSON.parse(user.permissions || "[]")
                                                ).length}개 권한
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button onClick={() => openPermissionModal(user)}
                                                        className="px-3 py-1 text-sm min-h-[36px] rounded-md font-medium transition-all cursor-pointer border border-gray-300 bg-transparent hover:bg-gray-50 flex items-center justify-center">
                                                    권한 수정
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 권한 수정 모달 */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black-30 flex items-center justify-center z-50 p-4"
                     onClick={() => setSelectedUser(null)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full mx-4 max-h-[90vh] overflow-y-auto max-w-4xl"
                         onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold">권한 수정 - [ {selectedUser.name} ]</h2>
                            <p className="text-gray-600 mt-1">사용자의 시스템 접근 권한을 설정합니다.</p>
                        </div>
                        <div className="p-4 max-h-96 overflow-y-auto">
                            <div className="space-y-6">
                                {Object.entries(groupedPermissions).map(([category, permissions]) => {
                                    console.log("groupedPermissions:", groupedPermissions);
                                    console.log("카테고리:", category);
                                    console.log("권한 목록:", permissions);

                                    return (
                                        <div key={category} className="border rounded-lg p-4">
                                            <h3 className="font-semibold text-gray-900 mb-3">{category}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {permissions.map((permission) => (
                                                    <label key={permission.progIdx}
                                                           className="flex items-center space-x-3 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPermissions.includes(permission.progIdx)}
                                                            onChange={() => togglePermission(permission.progIdx)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span
                                                            className="text-sm text-gray-700">{permission.progName}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                            <button onClick={() => setSelectedUser(null)}
                                    className="px-4 py-4 min-h-[44px] rounded-md font-medium transition-all cursor-pointer border border-gray-300 bg-transparent hover:bg-gray-50 flex items-center justify-center">
                                취소
                            </button>
                            <button onClick={handleSavePermissions}
                                    className="px-4 py-4 min-h-[44px] rounded-md font-medium transition-all cursor-pointer border flex items-center justify-center bg-blue-600 text-white border-blue-600 hover:bg-blue-700">
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
