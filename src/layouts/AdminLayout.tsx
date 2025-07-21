import { ReactNode } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/AdminSidebar"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { Navigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"

interface AdminLayoutProps {
  children: ReactNode
  title?: string
}

export function AdminLayout({ children, title = "Admin Panel" }: AdminLayoutProps) {
  const { user, isAdmin, loading, displayName, signOut } = useSupabaseAuth()

  // Show loading spinner while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Only redirect after we're sure about auth state
  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/admin" replace />
  }

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <h1 className="text-xl font-semibold">{title}</h1>
                <p className="text-sm text-muted-foreground">Polrydian Group Administration</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{displayName}</span>
                <Badge variant="secondary" className="text-xs">Admin</Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-3 w-3" />
                Sign Out
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}