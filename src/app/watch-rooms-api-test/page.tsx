'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/ui/navbar'

export default function WatchRoomsAPITestPage() {
  const [results, setResults] = useState<any[]>([])
  const [roomName, setRoomName] = useState('Test Watch Party')
  const [animeId, setAnimeId] = useState(16498)
  const [episode, setEpisode] = useState(1)
  const [roomId, setRoomId] = useState('')

  const addResult = (title: string, data: any) => {
    setResults(prev => [...prev, { title, data, timestamp: new Date().toISOString() }])
  }

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('accessToken')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  const testGetRooms = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      console.log('Testing GET rooms with token:', token ? 'Present' : 'Missing')
      
      const headers: Record<string, string> = {}
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      console.log('Request headers:', headers)
      
      const response = await fetch('/api/rooms', {
        headers,
        credentials: 'include'
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      const data = await response.json()
      console.log('Response data:', data)
      
      addResult('GET /api/rooms', { status: response.status, data, token: token ? 'Present' : 'Missing' })
    } catch (error) {
      console.error('Error in testGetRooms:', error)
      addResult('GET /api/rooms', { error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const testCreateRoom = async () => {
    if (!roomName.trim() || !animeId) {
      addResult('Create Room', { error: 'Room name and anime ID required' })
      return
    }

    try {
      const authHeaders = getAuthHeaders()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...authHeaders
      }
      
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          name: roomName.trim(),
          anime_id: animeId,
          episode: episode,
          max_participants: 8,
          is_private: false
        })
      })
      const data = await response.json()
      addResult('POST /api/rooms', { status: response.status, data })
      
      // Auto-set room ID if creation was successful
      if (response.ok && data.id) {
        setRoomId(data.id)
      }
    } catch (error) {
      addResult('POST /api/rooms', { error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const testGetRoomDetails = async () => {
    if (!roomId.trim()) {
      addResult('Get Room Details', { error: 'Room ID required' })
      return
    }

    try {
      const authHeaders = getAuthHeaders()
      const response = await fetch(`/api/rooms/${roomId.trim()}`, {
        headers: authHeaders,
        credentials: 'include'
      })
      const data = await response.json()
      addResult('GET /api/rooms/{room_id}', { status: response.status, data })
    } catch (error) {
      addResult('GET /api/rooms/{room_id}', { error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const testJoinRoom = async () => {
    if (!roomId.trim()) {
      addResult('Join Room', { error: 'Room ID required' })
      return
    }

    try {
      const authHeaders = getAuthHeaders()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...authHeaders
      }
      
      const response = await fetch(`/api/rooms/${roomId.trim()}/join`, {
        method: 'POST',
        headers,
        credentials: 'include'
      })
      const data = await response.json()
      addResult('POST /api/rooms/{room_id}/join', { status: response.status, data })
    } catch (error) {
      addResult('POST /api/rooms/{room_id}/join', { error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const testLeaveRoom = async () => {
    if (!roomId.trim()) {
      addResult('Leave Room', { error: 'Room ID required' })
      return
    }

    try {
      const authHeaders = getAuthHeaders()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...authHeaders
      }
      
      const response = await fetch(`/api/rooms/${roomId.trim()}/leave`, {
        method: 'POST',
        headers,
        credentials: 'include'
      })
      const data = await response.json()
      addResult('POST /api/rooms/{room_id}/leave', { status: response.status, data })
    } catch (error) {
      addResult('POST /api/rooms/{room_id}/leave', { error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const testGetMyRooms = async () => {
    try {
      const authHeaders = getAuthHeaders()
      const response = await fetch('/api/rooms/my-rooms', {
        headers: authHeaders,
        credentials: 'include'
      })
      const data = await response.json()
      addResult('GET /api/rooms/my-rooms', { status: response.status, data })
    } catch (error) {
      addResult('GET /api/rooms/my-rooms', { error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Watch Rooms API Test</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Test Controls */}
            <div className="space-y-6">
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Room Management</h2>
                
                <div className="space-y-4">
                  <Button onClick={testGetRooms} className="w-full">
                    Get All Rooms
                  </Button>
                  <Button onClick={testGetMyRooms} className="w-full">
                    Get My Rooms
                  </Button>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Create Room</h3>
                    <Input
                      placeholder="Room name"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Anime ID"
                        value={animeId || ''}
                        onChange={(e) => setAnimeId(parseInt(e.target.value) || 0)}
                      />
                      <Input
                        type="number"
                        placeholder="Episode"
                        value={episode}
                        onChange={(e) => setEpisode(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <Button onClick={testCreateRoom} className="w-full">
                      Create Room
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Room Actions</h2>
                
                <div className="space-y-4">
                  <div>
                    <Input
                      placeholder="Room ID for actions"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <Button onClick={testGetRoomDetails} disabled={!roomId.trim()}>
                      Get Room Details
                    </Button>
                    <Button onClick={testJoinRoom} disabled={!roomId.trim()}>
                      Join Room
                    </Button>
                    <Button onClick={testLeaveRoom} disabled={!roomId.trim()}>
                      Leave Room
                    </Button>
                    <Button onClick={testGetMyRooms} className="w-full">
                      Get My Rooms
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Results</h2>
              {results.length === 0 ? (
                <p className="text-muted-foreground">No tests run yet</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {results.map((result, index) => (
                    <div key={index} className="bg-card rounded-lg border p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{result.title}</h3>
                        <span className="text-sm text-muted-foreground">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
