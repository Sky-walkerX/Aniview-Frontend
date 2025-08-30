
import { ProtectedRoute } from '@/components/ui/protected-route'
import { FriendsList } from '@/components/ui/friends-list'
import { AuthDebug } from '@/components/auth-debug'
import { ApiTest } from '@/components/api-test'
import { FriendsDebug } from '@/components/friends-debug'
import { QuickLogin } from '@/components/quick-login'

export default function FriendsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-8">Friends</h1>
            <div className="space-y-4 mb-8">
              <QuickLogin />
              <AuthDebug />
              <ApiTest />
              <FriendsDebug />
            </div>
            <FriendsList />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
