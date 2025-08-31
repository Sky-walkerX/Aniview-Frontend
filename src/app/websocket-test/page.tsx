'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/ui/navbar'
import { getAuthToken } from '@/lib/auth'

export default function WebSocketTestPage() {
  const [results, setResults] = useState<any[]>([])
  const [roomId, setRoomId] = useState('e07be428-ffd2-46fb-b8db-1ba1ef7bd3a1')
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [message, setMessage] = useState('Hello from WebSocket test!')

  const addResult = (title: string, data: any) => {
    setResults(prev => [...prev, { title, data, timestamp: new Date().toISOString() }])
  }

  const testWebSocketURL = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No auth token available')
      }

      const response = await fetch(`/api/rooms/${roomId}/ws?token=${encodeURIComponent(token)}`)
      const data = await response.json()
      
      addResult('WebSocket URL API', { 
        status: response.status, 
        data,
        token: token ? 'Present' : 'Missing'
      })
    } catch (error) {
      addResult('WebSocket URL API', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  const connectWebSocket = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No auth token available')
      }

      // Get WebSocket URL
      const response = await fetch(`/api/rooms/${roomId}/ws?token=${encodeURIComponent(token)}`)
      if (!response.ok) {
        throw new Error(`Failed to get WebSocket URL: ${response.status}`)
      }

      const { websocket_url } = await response.json()
      
      // Connect to WebSocket
      const websocket = new WebSocket(websocket_url)
      
      websocket.onopen = () => {
        console.log('WebSocket connected')
        setConnected(true)
        addResult('WebSocket Connect', { status: 'Connected', url: websocket_url })
      }

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('WebSocket message:', data)
        addResult('WebSocket Message', data)
      }

      websocket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        setConnected(false)
        addResult('WebSocket Close', { code: event.code, reason: event.reason })
      }

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
        addResult('WebSocket Error', { error: error.toString() })
      }

      setWs(websocket)
    } catch (error) {
      addResult('WebSocket Connect', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  const sendTestMessage = () => {
    if (ws && connected) {
      const msg = {
        type: 'send_message',
        content: message,
        message_type: 'text'
      }
      ws.send(JSON.stringify(msg))
      addResult('WebSocket Send', msg)
    }
  }

  const disconnectWebSocket = () => {
    if (ws) {
      ws.close()
      setWs(null)
      setConnected(false)
    }
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">WebSocket Test</h1>
          
          <div className="space-y-6">
            {/* Test Controls */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">WebSocket Tests</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Room ID</label>
                  <Input
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Room ID"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={testWebSocketURL}>
                    Test WebSocket URL API
                  </Button>
                  <Button onClick={connectWebSocket} disabled={connected}>
                    Connect WebSocket
                  </Button>
                  <Button onClick={disconnectWebSocket} disabled={!connected}>
                    Disconnect
                  </Button>
                  <Button onClick={clearResults} variant="outline">
                    Clear Results
                  </Button>
                </div>

                {/* Send Message */}
                {connected && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Send Test Message</h3>
                    <div className="flex space-x-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Test message"
                        className="flex-1"
                      />
                      <Button onClick={sendTestMessage}>
                        Send Message
                      </Button>
                    </div>
                  </div>
                )}

                {/* Connection Status */}
                <div className="bg-muted rounded p-3">
                  <div className="text-sm">
                    <strong>Status:</strong> {connected ? 
                      <span className="text-green-600">Connected</span> : 
                      <span className="text-red-600">Disconnected</span>
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Test Results</h2>
              
              {results.length === 0 ? (
                <p className="text-muted-foreground">No test results yet. Run some tests above.</p>
              ) : (
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-foreground">{result.title}</h3>
                        <span className="text-xs text-muted-foreground">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <pre className="bg-muted rounded p-3 text-sm overflow-auto">
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
