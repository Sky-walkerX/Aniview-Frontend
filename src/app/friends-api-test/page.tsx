'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/ui/navbar'

export default function FriendsAPITestPage() {
  const [results, setResults] = useState<any[]>([])
  const [username, setUsername] = useState('')

  const addResult = (title: string, data: any) => {
    setResults(prev => [...prev, { title, data, timestamp: new Date().toISOString() }])
  }

  const testGetFriends = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const headers: any = {}
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/friends', {
        headers,
        credentials: 'include'
      })
      const data = await response.json()
      addResult('GET /api/friends', { status: response.status, data })
    } catch (error) {
      addResult('GET /api/friends', { error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const testSendFriendRequest = async () => {
    if (!username.trim()) {
      addResult('Send Friend Request', { error: 'Username required' })
      return
    }

    try {
      const token = localStorage.getItem('accessToken')
      const headers: any = { 'Content-Type': 'application/json' }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ receiver_username: username.trim() })
      })
      const data = await response.json()
      addResult('POST /api/friends/request', { status: response.status, data })
    } catch (error) {
      addResult('POST /api/friends/request', { error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Friends API Test</h1>
          
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold">Test Friends Endpoints</h2>
            
            <div className="flex flex-wrap gap-4">
              <Button onClick={testGetFriends}>
                Test Get Friends
              </Button>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Username for friend request"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-64"
                />
                <Button onClick={testSendFriendRequest} disabled={!username.trim()}>
                  Send Friend Request
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Results</h2>
            {results.length === 0 ? (
              <p className="text-muted-foreground">No tests run yet</p>
            ) : (
              results.map((result, index) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
