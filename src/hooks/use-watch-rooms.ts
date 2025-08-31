import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface WatchRoom {
  id: string
  name: string
  anime_id: number
  episode: number
  current_time: number
  is_playing: boolean
  owner_id: string
  owner_username: string
  max_participants: number
  is_private: boolean
  participant_count: number
  created_at: string
  updated_at: string
}

export interface RoomParticipant {
  user_id: string
  username: string
  joined_at: string
  last_seen_at: string
  is_online: boolean
}

export interface ChatMessage {
  id: string
  room_id: string
  user_id: string
  username: string
  content: string
  message_type: 'text'
  created_at: string
  edited_at: string | null
}

export interface RoomDetails {
  room: WatchRoom
  participants: RoomParticipant[]
  recent_messages: ChatMessage[]
}

export interface CreateRoomData {
  name: string
  anime_id: number
  episode: number
  max_participants?: number
  is_private?: boolean
}

export interface SendMessageData {
  room_id: string
  content: string
  message_type?: 'text'
}

export interface PlaybackControlData {
  room_id: string
  action: 'play' | 'pause' | 'seek'
  current_time?: number
}

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem('accessToken')
  return token?.trim() || null
}
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage: string
    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const errorJson = await response.json()
        // Try to extract a meaningful error message
        errorMessage = errorJson.error || errorJson.message || JSON.stringify(errorJson)
      } else {
        errorMessage = await response.text()
      }
    } catch (e) {
      errorMessage = `Unable to parse error response: ${e}`
    }
    throw new Error(`${errorMessage} (HTTP ${response.status})`)
  }
  return response.json()
}

export const useWatchRooms = (page = 1, per_page = 20) => {
  return useQuery<WatchRoom[]>({
    queryKey: ['watch-rooms', page, per_page],
    queryFn: async () => {
      const token = getAuthToken()
      if (!token) throw new Error('No auth token available')

      const response = await fetch(`/api/rooms?page=${page}&per_page=${per_page}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
      return handleApiResponse(response)
    },
    retry: 1,
  })
}

export const useCreateWatchRoom = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (roomData: CreateRoomData) => {
      const token = getAuthToken()
      if (!token) throw new Error('No auth token available')

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(roomData),
      })
      return handleApiResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch-rooms'] })
    },
  })
}

export const useWatchRoomDetails = (roomId: string) => {
  return useQuery<RoomDetails>({
    queryKey: ['watch-room', roomId],
    queryFn: async () => {
      const token = getAuthToken()
      if (!token) throw new Error('No auth token available')

      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
      return handleApiResponse(response)
    },
    retry: 1,
    enabled: !!roomId,
  })
}

export const useJoinWatchRoom = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ roomId }: { roomId: string }) => {
      const token = getAuthToken()
      if (!token) throw new Error('No auth token available')

      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
      return handleApiResponse(response)
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ['watch-rooms'] })
      queryClient.invalidateQueries({ queryKey: ['watch-room', roomId] })
      queryClient.invalidateQueries({ queryKey: ['my-watch-rooms'] })
    },
  })
}

export const useLeaveWatchRoom = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ roomId }: { roomId: string }) => {
      const token = getAuthToken()
      if (!token) throw new Error('No auth token available')

      const response = await fetch(`/api/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
      return handleApiResponse(response)
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ['watch-rooms'] })
      queryClient.invalidateQueries({ queryKey: ['watch-room', roomId] })
      queryClient.invalidateQueries({ queryKey: ['my-watch-rooms'] })
    },
  })
}

export const useSendChatMessage = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ room_id, content, message_type = 'text' }: SendMessageData) => {
      const token = getAuthToken()
      if (!token) throw new Error('No auth token available')

      const response = await fetch(`/api/rooms/${room_id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ content, message_type }),
      })
      return handleApiResponse(response)
    },
    onSuccess: (_, { room_id }) => {
      queryClient.invalidateQueries({ queryKey: ['watch-room', room_id] })
    },
  })
}

export const usePlaybackControl = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ room_id, action, current_time }: PlaybackControlData) => {
      const token = getAuthToken()
      if (!token) throw new Error('No auth token available')

      const body: any = { action }
      if (current_time !== undefined) {
        body.current_time = current_time
      }

      const response = await fetch(`/api/rooms/${room_id}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      return handleApiResponse(response)
    },
    onSuccess: (_, { room_id }) => {
      queryClient.invalidateQueries({ queryKey: ['watch-room', room_id] })
    },
  })
}

export const useMyWatchRooms = () => {
  return useQuery<WatchRoom[]>({
    queryKey: ['my-watch-rooms'],
    queryFn: async () => {
      const token = getAuthToken()
      if (!token) throw new Error('No auth token available')

      const response = await fetch('/api/rooms/my-rooms', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
      return handleApiResponse(response)
    },
    retry: 1,
  })
}
