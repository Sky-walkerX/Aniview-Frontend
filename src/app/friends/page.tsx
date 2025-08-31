
'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/ui/protected-route'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingIndicator } from '@/components/ui/loading-indicator'
import { 
  useFriends, 
  useSendFriendRequest, 
  useAcceptFriendRequest, 
  useRejectFriendRequest, 
  useRemoveFriend,
  type Friend,
  type FriendRequest
} from '@/hooks/use-friends'
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  UserMinus, 
  Send,
  Circle,
  Clock
} from 'lucide-react'

function FriendCard({ friend, onRemove }: { friend: Friend; onRemove: (id: string) => void }) {
  return (
    <div className="bg-card rounded-lg border p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
          {friend.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{friend.username}</h3>
          <p className="text-sm text-muted-foreground">{friend.email}</p>
          <div className="flex items-center space-x-1 mt-1">
            <Circle className={`w-2 h-2 ${friend.is_online ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'}`} />
            <span className="text-xs text-muted-foreground">
              {friend.is_online ? 'Online' : `Last seen ${new Date(friend.last_seen).toLocaleDateString()}`}
            </span>
          </div>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onRemove(friend.user_id)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <UserMinus className="w-4 h-4" />
      </Button>
    </div>
  )
}

function FriendRequestCard({ 
  request, 
  type,
  onAccept, 
  onReject 
}: { 
  request: FriendRequest
  type: 'incoming' | 'outgoing'
  onAccept?: (id: string) => void
  onReject: (id: string) => void
}) {
  const displayName = type === 'incoming' ? request.requester_username : request.receiver_username
  
  return (
    <div className="bg-card rounded-lg border p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
          {displayName?.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{displayName}</h3>
          <div className="flex items-center space-x-1 mt-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {new Date(request.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        {type === 'incoming' && onAccept && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAccept(request.id)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <Check className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onReject(request.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default function FriendsPage() {
  const [newFriendUsername, setNewFriendUsername] = useState('')
  const [sendError, setSendError] = useState('')

  const { data: friendsData, isLoading, error, refetch } = useFriends()
  const sendFriendRequest = useSendFriendRequest()
  const acceptFriendRequest = useAcceptFriendRequest()
  const rejectFriendRequest = useRejectFriendRequest()
  const removeFriend = useRemoveFriend()

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFriendUsername.trim()) return

    setSendError('')
    try {
      await sendFriendRequest.mutateAsync({ receiver_username: newFriendUsername.trim() })
      setNewFriendUsername('')
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Failed to send friend request')
    }
  }

  const handleAccept = async (friendshipId: string) => {
    try {
      await acceptFriendRequest.mutateAsync({ friendship_id: friendshipId })
    } catch (error) {
      console.error('Failed to accept friend request:', error)
    }
  }

  const handleReject = async (friendshipId: string) => {
    try {
      await rejectFriendRequest.mutateAsync({ friendship_id: friendshipId })
    } catch (error) {
      console.error('Failed to reject friend request:', error)
    }
  }

  const handleRemove = async (friendId: string) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      try {
        await removeFriend.mutateAsync({ friend_id: friendId })
      } catch (error) {
        console.error('Failed to remove friend:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <LoadingIndicator />
            </div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Failed to load friends: {error.message}</p>
                <Button onClick={() => refetch()} className="mt-2">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    )
  }

  const friends = friendsData?.friends || []
  const pendingRequests = friendsData?.pending_requests || []
  const sentRequests = friendsData?.sent_requests || []

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Friends</h1>
              <p className="text-muted-foreground">
                Connect with other anime enthusiasts and share your watching experience!
              </p>
            </div>

            {/* Add Friend Form */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                Add Friend
              </h2>
              <form onSubmit={handleSendRequest} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Enter username"
                  value={newFriendUsername}
                  onChange={(e) => setNewFriendUsername(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={sendFriendRequest.isPending || !newFriendUsername.trim()}
                >
                  {sendFriendRequest.isPending ? (
                    <LoadingIndicator size="sm" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Request
                    </>
                  )}
                </Button>
              </form>
              {sendError && (
                <p className="text-red-600 text-sm mt-2">{sendError}</p>
              )}
            </div>

            {/* Friends List */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                My Friends ({friends.length})
              </h2>
              {friends.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No friends yet. Start by adding some friends above!
                </p>
              ) : (
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <FriendCard
                      key={friend.friendship_id}
                      friend={friend}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pending Friend Requests */}
            {pendingRequests.length > 0 && (
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Pending Requests ({pendingRequests.length})
                </h2>
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <FriendRequestCard
                      key={request.id}
                      request={request}
                      type="incoming"
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sent Friend Requests */}
            {sentRequests.length > 0 && (
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <Send className="w-5 h-5 mr-2" />
                  Sent Requests ({sentRequests.length})
                </h2>
                <div className="space-y-3">
                  {sentRequests.map((request) => (
                    <FriendRequestCard
                      key={request.id}
                      request={request}
                      type="outgoing"
                      onReject={handleReject}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
