"use client"

import { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Navbar } from "./navbar"
import { Toaster } from "sonner"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Sidebar />
      <div className="lg:ml-64">
        <Navbar />
        <main className="p-6">
          {children}
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}
