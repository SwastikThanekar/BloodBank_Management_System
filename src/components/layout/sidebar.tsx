"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Droplets, 
  Users, 
  FileText, 
  Building2, 
  Calendar, 
  BarChart3, 
  Settings,
  Menu,
  X,
  UserCog
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

const sidebarItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "hospital", "staff"] },
  { name: "Blood Inventory", href: "/inventory", icon: Droplets, roles: ["admin", "hospital", "staff"] },
  { name: "Donors", href: "/donors", icon: Users, roles: ["admin", "staff"] },
  { name: "Blood Requests", href: "/requests", icon: FileText, roles: ["admin", "hospital"] },
  { name: "Hospitals", href: "/hospitals", icon: Building2, roles: ["admin"] },
  { name: "Appointments", href: "/appointments", icon: Calendar, roles: ["admin", "staff"] },
  { name: "Reports", href: "/reports", icon: BarChart3, roles: ["admin", "hospital", "staff"] },
  { name: "User Management", href: "/users", icon: UserCog, roles: ["admin"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["admin", "hospital", "staff"] },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, hasRole } = useAuth()

  const filteredItems = sidebarItems.filter(item => {
    if (!item.roles || !user?.role || !item.roles.includes(user.role)) return false
    return true
  })

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#D32F2F] rounded-lg flex items-center justify-center">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#D32F2F]">Blood Bank</h1>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {filteredItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-[#D32F2F] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <p className="text-xs text-[#D32F2F] font-medium capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
