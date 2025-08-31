import { useEffect, useRef, useState, useCallback } from 'react'
import { type ChatMessage, type RoomParticipant } from './use-watch-rooms'

export type WebSocketMessage = 
  | { type: 'send_message'; content: string; message_type: 'text' }
  | { type: 'edit_message'; message_id: string; new_content: string }
  | { type: 'play'; current_time: number }
  | { type: 'pause'; current_time: number }
  | { type: 'seek'; current_time: number }
  | { type: 'change_episode'; episode: number }
  | { type: 'heartbeat' }
  | { type: 'get_participants' }
  | { type: 'get_messages'; limit?: number; offset?: number }

export type ServerMessage = 
  | { type: 'chat_message'; message: ChatMessage }
  | { type: 'message_edited'; message_id: string; new_content: string; edited_at: string }
  | { type: 'play'; current_time: number }
  | { type: 'pause'; current_time: number }
  | { type: 'seek'; current_time: number }
  | { type: 'episode_change'; episode: number; current_time: number }
  | { type: 'user_joined'; user: RoomParticipant }
  | { type: 'user_left'; user_id: string; username: string }
  | { type: 'error'; message: string; code?: string }
  | { type: 'participants_list'; participants: RoomParticipant[] }
  | { type: 'message_history'; messages: ChatMessage[]; total: number; limit: number; offset: number }

export interface UseRoomWebSocketOptions {
  roomId: string
  onMessage?: (message: ChatMessage) => void
  onMessageEdited?: (messageId: string, newContent: string, editedAt: string) => void
  onPlay?: (currentTime: number) => void
  onPause?: (currentTime: number) => void
  onSeek?: (currentTime: number) => void
  onEpisodeChange?: (episode: number, currentTime: number) => void
  onUserJoined?: (user: RoomParticipant) => void
  onUserLeft?: (userId: string, username: string) => void
  onParticipantsUpdate?: (participants: RoomParticipant[]) => void
  onMessageHistory?: (messages: ChatMessage[], total: number) => void
  onError?: (message: string, code?: string) => void
}

export const useRoomWebSocket = (options: UseRoomWebSocketOptions) => {
  const {
    roomId,
    onMessage,
    onMessageEdited,
    onPlay,
    onPause,
    onSeek,
    onEpisodeChange,
    onUserJoined,
    onUserLeft,
    onParticipantsUpdate,
    onMessageHistory,
    onError
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [useHttpFallback, setUseHttpFallback] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const httpPollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 3 // Reduced attempts before fallback

  const connect = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token available')
      }

      // Get WebSocket URL from our API route
      const response = await fetch(`/api/rooms/${roomId}/ws?token=${encodeURIComponent(token)}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to get WebSocket URL: ${response.status} ${errorData.error || ''}`)
      }

      const { websocket_url } = await response.json()
      
      // Close existing connection
      if (wsRef.current) {
        wsRef.current.close()
      }

      console.log('Connecting to WebSocket:', websocket_url)
      const ws = new WebSocket(websocket_url)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected to room:', roomId)
        setIsConnected(true)
        setConnectionError(null)
        reconnectAttempts.current = 0

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          sendMessage({ type: 'heartbeat' })
        }, 30000) // Send heartbeat every 30 seconds

        // Request initial data
        sendMessage({ type: 'get_participants' })
        sendMessage({ type: 'get_messages', limit: 50, offset: 0 })
      }

      ws.onmessage = (event) => {
        try {
          const message: ServerMessage = JSON.parse(event.data)
          console.log('WebSocket message received:', message)

          switch (message.type) {
            case 'chat_message':
              onMessage?.(message.message)
              break
            case 'message_edited':
              onMessageEdited?.(message.message_id, message.new_content, message.edited_at)
              break
            case 'play':
              onPlay?.(message.current_time)
              break
            case 'pause':
              onPause?.(message.current_time)
              break
            case 'seek':
              onSeek?.(message.current_time)
              break
            case 'episode_change':
              onEpisodeChange?.(message.episode, message.current_time)
              break
            case 'user_joined':
              onUserJoined?.(message.user)
              break
            case 'user_left':
              onUserLeft?.(message.user_id, message.username)
              break
            case 'participants_list':
              onParticipantsUpdate?.(message.participants)
              break
            case 'message_history':
              onMessageHistory?.(message.messages, message.total)
              break
            case 'error':
              console.error('WebSocket error from server:', message.message, message.code)
              onError?.(message.message, message.code)
              setConnectionError(message.message)
              break
            default:
              console.log('Unknown WebSocket message type:', message)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)

        // Clear heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current)
          heartbeatIntervalRef.current = null
        }

        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          console.log(`WebSocket reconnect attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts} in ${delay}ms`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.log('WebSocket max reconnection attempts reached')
          setConnectionError('Unable to connect to real-time features')
        }
      }

      ws.onerror = (error) => {
        console.warn('WebSocket connection failed - this is expected if backend WebSocket is not ready')
        setConnectionError('WebSocket connection failed')
      }

    } catch (error) {
      console.log('WebSocket connection failed:', error instanceof Error ? error.message : 'Connection failed')
      setConnectionError('Real-time features unavailable')
    }
  }, [roomId, onMessage, onMessageEdited, onPlay, onPause, onSeek, onEpisodeChange, onUserJoined, onUserLeft, onParticipantsUpdate, onMessageHistory, onError])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close(1000) // Normal closure
      wsRef.current = null
    }

    setIsConnected(false)
    setConnectionError(null)
  }, [])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      console.log('WebSocket message sent:', message)
    } else {
      console.warn('WebSocket not connected, cannot send message:', message)
    }
  }, [])

  // Connection management
  useEffect(() => {
    connect()
    return disconnect
  }, [connect, disconnect])

  return {
    isConnected,
    connectionError,
    sendMessage,
    connect,
    disconnect
  }
}
