"use client"

import {User} from "@/types/user";

interface SidebarProps {
  user: User
  onMenuClick: (menuId: string, title: string) => void
}

export default function DashboardSidebar({ user, onMenuClick }: SidebarProps) {
  return(
      <div className={"w-64 bg-white shadow-lg h-full flex flex-col"}>
sidebadsr
      </div>
  )
}