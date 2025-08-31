'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { ProtectedRoute } from '@/components/ui/protected-route'
import { Navbar } from '@/components/ui/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingIndicator } from '@/components/ui/loading-indicator'
import { VideoPlayer } from '@/components/ui/video-player'
import { useCurrentUser } from '@/hooks/use-auth'
import { useVideoSources } from '@/hooks/use-anime'
import { useRoomWebSocket } from '@/hooks/use-room-websocket'
import { 
  useWatchRoomDetails, 
  useJoinWatchRoom,
  useLeaveWatchRoom,
  useSendChatMessage,
  usePlaybackControl,
  type ChatMessage,
  type RoomParticipant 
} from '@/hooks/use-watch-rooms'
import { 
  Play, 
  Pause, 
  Users, 
  Send,
  LogOut,
  Settings,
  MessageCircle,
  Volume2,
  Maximize,
  SkipForward,
  SkipBack,
  Wifi,
  WifiOff
} from 'lucide-react'

function ChatPanel({ 
  messages, 
  participants, 
  onSendMessage 
}: { 
  messages: ChatMessage[]
  participants: RoomParticipant[]
  onSendMessage: (message: string) => void 
}) {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    onSendMessage(newMessage.trim())
    setNewMessage('')
  }

  return (
    <div className="bg-card rounded-lg border h-96 flex flex-col">
      {/* Participants Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-foreground flex items-center">
          <Users className="w-4 h-4 mr-2" />
          Participants ({participants.length})
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {participants.map((participant) => (
            <span
              key={participant.user_id}
              className={`text-xs px-2 py-1 rounded-full ${
                participant.is_online 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {participant.username}
            </span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-foreground">
                {message.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(message.created_at).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground bg-muted rounded p-2">
              {message.content}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Send Message */}
      <form onSubmit={handleSendMessage} className="p-4 border-t flex space-x-2">
        <Input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={!newMessage.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}

function RoomVideoPlayer({ 
  animeId,
  episode,
  isOwner,
  onEpisodeChange 
}: {
  animeId: number
  episode: number
  isOwner: boolean
  onEpisodeChange: (episode: number) => void
}) {
  // Fetch video sources for the current episode
  const { data: videoData, isLoading: videoLoading, error: videoError } = useVideoSources(
    animeId.toString(), 
    episode
  )

  const videoSources = videoData?.sources || []
  const subtitles = videoData?.subtitles || []

  if (videoLoading) {
    return (
      <div className="bg-card rounded-lg border p-4">
        <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
          <div className="text-white text-center">
            <LoadingIndicator />
            <p className="mt-4">Loading Episode {episode}...</p>
          </div>
        </div>
      </div>
    )
  }

  if (videoError || videoSources.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-4">
        <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
          <div className="text-white text-center">
            <Play className="w-16 h-16 mx-auto mb-2 opacity-50" />
            <p>Video not available for Episode {episode}</p>
            <p className="text-sm opacity-75 mt-1">
              {videoError?.message || 'No video sources found'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Episode {episode}</h3>
        {isOwner && (
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEpisodeChange(Math.max(1, episode - 1))}
              disabled={episode <= 1}
            >
              <SkipBack className="w-4 h-4" />
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEpisodeChange(episode + 1)}
            >
              <SkipForward className="w-4 h-4" />
              Next
            </Button>
          </div>
        )}
      </div>

      <VideoPlayer
        sources={videoSources}
        subtitles={subtitles}
        title={`Episode ${episode}`}
        episodeTitle={`Episode ${episode}`}
        onPrevious={isOwner ? () => onEpisodeChange(Math.max(1, episode - 1)) : undefined}
        onNext={isOwner ? () => onEpisodeChange(episode + 1) : undefined}
        hasPrevious={isOwner && episode > 1}
        hasNext={isOwner}
        className="rounded-lg overflow-hidden"
      />

      {!isOwner && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Only the room owner can control episode navigation
        </p>
      )}
    </div>
  )
}

export default function WatchRoomPage() {
  const params = useParams()
  const roomId = params.room_id as string
  
  const { data: room, isLoading, error, refetch } = useWatchRoomDetails(roomId)
  const { data: currentUser } = useCurrentUser()
  const joinRoom = useJoinWatchRoom()
  const leaveRoom = useLeaveWatchRoom()

  // Real-time state
  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([])
  const [realtimeParticipants, setRealtimeParticipants] = useState<RoomParticipant[]>([])
  const [currentEpisode, setCurrentEpisode] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  // Initialize episode from room data
  useEffect(() => {
    if (room?.room.episode) {
      setCurrentEpisode(room.room.episode)
      setIsPlaying(room.room.is_playing)
      setCurrentTime(room.room.current_time)
    }
  }, [room])

  // WebSocket integration
  const { isConnected, connectionError, sendMessage } = useRoomWebSocket({
    roomId,
    onMessage: (message) => {
      console.log('New chat message received:', message)
      setRealtimeMessages(prev => {
        // Remove any temporary message with same content
        const filtered = prev.filter(m => !m.id.startsWith('temp-') || m.content !== message.content)
        return [...filtered, message]
      })
    },
    onMessageEdited: (messageId, newContent, editedAt) => {
      setRealtimeMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: newContent, edited_at: editedAt }
            : msg
        )
      )
    },
    onPlay: (time) => {
      setIsPlaying(true)
      setCurrentTime(time)
    },
    onPause: (time) => {
      setIsPlaying(false)
      setCurrentTime(time)
    },
    onSeek: (time) => {
      setCurrentTime(time)
    },
    onEpisodeChange: (episode, time) => {
      setCurrentEpisode(episode)
      setCurrentTime(time)
    },
    onUserJoined: (user) => {
      setRealtimeParticipants(prev => [...prev, user])
    },
    onUserLeft: (userId) => {
      setRealtimeParticipants(prev => prev.filter(p => p.user_id !== userId))
    },
    onParticipantsUpdate: (participants) => {
      setRealtimeParticipants(participants)
    },
    onMessageHistory: (messages) => {
      setRealtimeMessages(messages)
    },
    onError: (message, code) => {
      console.error('WebSocket error:', message, code)
    }
  })

  const handleJoinRoom = async () => {
    try {
      await joinRoom.mutateAsync({ roomId })
      // Refetch room data after joining
      refetch()
    } catch (error) {
      console.error('Failed to join room:', error)
    }
  }

  const handleLeaveRoom = async () => {
    if (confirm('Are you sure you want to leave this room?')) {
      try {
        await leaveRoom.mutateAsync({ roomId })
        window.location.href = '/watch-rooms'
      } catch (error) {
        console.error('Failed to leave room:', error)
      }
    }
  }

  const handleSendMessage = (message: string) => {
    console.log('Sending WebSocket message:', message)
    sendMessage({
      type: 'send_message',
      content: message,
      message_type: 'text'
    })
    
    // Show immediate feedback - add a temporary message
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      room_id: roomId,
      user_id: currentUser?.id || '',
      username: currentUser?.username || '',
      content: message,
      message_type: 'text',
      created_at: new Date().toISOString(),
      edited_at: null
    }
    setRealtimeMessages(prev => [...prev, tempMessage])
  }

  const handlePlay = () => {
    sendMessage({
      type: 'play',
      current_time: currentTime
    })
  }

  const handlePause = () => {
    sendMessage({
      type: 'pause',
      current_time: currentTime
    })
  }

  const handleSeek = (time: number) => {
    sendMessage({
      type: 'seek',
      current_time: time
    })
    setCurrentTime(time)
  }

  const handleEpisodeChange = (episode: number) => {
    sendMessage({
      type: 'change_episode',
      episode: episode
    })
    setCurrentEpisode(episode)
  }

  if (isLoading || !currentUser) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <LoadingIndicator />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !room) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Failed to load room: {error?.message}</p>
              <Button onClick={() => window.location.href = '/watch-rooms'} className="mt-2">
                Back to Rooms
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Check if current user is owner and if user is in the room
  const isOwner = room.room.owner_id === currentUser.id
  const isParticipant = room.participants.some(p => p.user_id === currentUser.id)
  const canJoin = !isParticipant && room.participants.length < room.room.max_participants
  
  // Use real-time participant count if available
  const currentParticipants = realtimeParticipants.length > 0 ? realtimeParticipants : room.participants

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Room Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">{room.room.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Hosted by {room.room.owner_username}</span>
                  <span>{currentParticipants.length}/{room.room.max_participants} participants</span>
                  <span className={`flex items-center ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? (
                      <Wifi className="w-4 h-4 mr-1" />
                    ) : (
                      <WifiOff className="w-4 h-4 mr-1" />
                    )}
                    {isConnected ? 'Connected' : (connectionError || 'Connecting...')}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                {!isParticipant && canJoin && (
                  <Button 
                    onClick={handleJoinRoom}
                    disabled={joinRoom.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {joinRoom.isPending ? 'Joining...' : 'Join Room'}
                  </Button>
                )}
                
                {!isParticipant && !canJoin && room.participants.length >= room.room.max_participants && (
                  <Button variant="outline" size="sm" disabled>
                    Room Full
                  </Button>
                )}
                
                {isParticipant && (
                  <>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleLeaveRoom}
                      disabled={leaveRoom.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {leaveRoom.isPending ? 'Leaving...' : 'Leave Room'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* WebSocket Status Debug */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">WebSocket Debug</h4>
                <div className="text-sm space-y-1">
                  <div>Status: <span className={isConnected ? 'text-green-600' : 'text-red-600'}>{isConnected ? 'Connected' : 'Disconnected'}</span></div>
                  {connectionError && <div>Error: <span className="text-red-600">{connectionError}</span></div>}
                  <div>Room ID: {roomId}</div>
                  <div>Real-time Messages: {realtimeMessages.length}</div>
                  <div>Real-time Participants: {realtimeParticipants.length}</div>
                </div>
              </div>
            )}

            {/* Error Messages */}
            {joinRoom.error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">
                  Failed to join room: {joinRoom.error instanceof Error ? joinRoom.error.message : 'Unknown error'}
                </p>
              </div>
            )}
            
            {leaveRoom.error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">
                  Failed to leave room: {leaveRoom.error instanceof Error ? leaveRoom.error.message : 'Unknown error'}
                </p>
              </div>
            )}

            {/* Status Messages */}
            {!isParticipant && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  You are not currently in this room. {canJoin ? 'Click "Join Room" to participate.' : 'This room is full.'}
                </p>
              </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Video Player */}
              <div className="lg:col-span-2">
                {isParticipant ? (
                  <RoomVideoPlayer
                    animeId={room.room.anime_id}
                    episode={currentEpisode || room.room.episode}
                    isOwner={isOwner}
                    onEpisodeChange={handleEpisodeChange}
                  />
                ) : (
                  <div className="bg-card rounded-lg border p-8 text-center">
                    <div className="text-muted-foreground mb-4">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">Join the Room</h3>
                      <p>You need to join this room to watch the video and participate in the chat.</p>
                    </div>
                    {canJoin && (
                      <Button 
                        onClick={handleJoinRoom}
                        disabled={joinRoom.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {joinRoom.isPending ? 'Joining...' : 'Join Room'}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Chat Panel */}
              <div>
                {isParticipant ? (
                  <ChatPanel
                    messages={realtimeMessages.length > 0 ? realtimeMessages : room.recent_messages}
                    participants={realtimeParticipants.length > 0 ? realtimeParticipants : room.participants}
                    onSendMessage={handleSendMessage}
                  />
                ) : (
                  <div className="bg-card rounded-lg border p-6">
                    <div className="flex items-center mb-4">
                      <MessageCircle className="w-5 h-5 mr-2 text-muted-foreground" />
                      <h3 className="font-semibold">Room Chat</h3>
                    </div>
                    <div className="text-center text-muted-foreground">
                      <p className="mb-4">Join the room to participate in the chat.</p>
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Participants ({room.participants.length})</h4>
                        {room.participants.map((participant) => (
                          <div key={participant.user_id} className="flex items-center justify-between text-sm">
                            <span>{participant.username}</span>
                            <span className={`w-2 h-2 rounded-full ${participant.is_online ? 'bg-green-500' : 'bg-gray-400'}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
