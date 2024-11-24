"use client"
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) return null

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background w-full">
        <div className="flex h-[calc(100vh-4rem)]">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="flex gap-4 mb-6">
              <SidebarTrigger>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </SidebarTrigger>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}