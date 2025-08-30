"use client"

import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { ProtectedRoute } from "@/components/ui/protected-route"
import { useIsAuthenticated } from "@/hooks/use-auth"
import { User, Mail, Calendar, Settings } from "lucide-react"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-20">
          <ProfileContent />
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const { user } = useIsAuthenticated()

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{user.username}</h1>
            <p className="text-muted-foreground">Anime enthusiast since {new Date(user.createdAt).getFullYear()}</p>
          </div>
        </div>

        {/* User Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">Account Information</h2>
            
            <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg">
              <User className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="font-medium text-foreground">{user.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Member since</p>
                <p className="font-medium text-foreground">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
            
            <button className="w-full flex items-center gap-3 p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-left">
              <Settings className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Account Settings</p>
                <p className="text-sm text-muted-foreground">Manage your account preferences</p>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 p-4 bg-muted/10 hover:bg-muted/20 rounded-lg transition-colors text-left">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Edit Profile</p>
                <p className="text-sm text-muted-foreground">Update your profile information</p>
              </div>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-6 bg-primary/10 rounded-lg">
            <div className="text-2xl font-bold text-primary mb-2">0</div>
            <div className="text-sm text-muted-foreground">Anime Watched</div>
          </div>
          <div className="text-center p-6 bg-secondary/10 rounded-lg">
            <div className="text-2xl font-bold text-secondary mb-2">0</div>
            <div className="text-sm text-muted-foreground">Hours Watched</div>
          </div>
          <div className="text-center p-6 bg-muted/20 rounded-lg">
            <div className="text-2xl font-bold text-foreground mb-2">0</div>
            <div className="text-sm text-muted-foreground">Favorites</div>
          </div>
        </div>
      </div>
    </div>
  )
}
