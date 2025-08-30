
import { ProtectedRoute } from '@/components/ui/protected-route'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'

export default function FriendsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-8">Friends</h1>
            <div className="bg-card rounded-lg border p-6">
              <p className="text-muted-foreground text-center">
                Friends feature coming soon! 🚀
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
