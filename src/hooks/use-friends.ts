import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface Friend {
  user_id: string
  username: string
  email: string
  friendship_id: string
  is_online: boolean
  last_seen: string
}

export interface FriendRequest {
  id: string
  requester_id: string
  receiver_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
  requester_username: string
  receiver_username: string | null
}

export interface FriendsResponse {
  friends: Friend[]
  pending_requests: FriendRequest[]
  sent_requests: FriendRequest[]
}

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem('accessToken')
  // Ensure token is clean (no extra whitespace or characters)
  return token?.trim() || null
}

// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorText: string
    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const errorJson = await response.json()
        errorText = JSON.stringify(errorJson)
      } else {
        errorText = await response.text()
      }
    } catch (e) {
      errorText = `Unable to parse error response: ${e}`
    }
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }
  return response.json()
}

export const useFriends = () => {
  return useQuery<FriendsResponse>({
    queryKey: ['friends'],
    queryFn: async () => {
      const token = getAuthToken()
      if (!token) throw new Error('No auth token available')

      const response = await fetch('/api/friends', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // Include cookies
      })
      
      return handleApiResponse(response)
    },
    retry: 1,
  })
}

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ receiver_username }: { receiver_username: string }) => {
      const token = getAuthToken()
      if (!token) throw new Error('No auth token available')

      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ receiver_username }),
      })
      return handleApiResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
  })
}

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ friendship_id }: { friendship_id: string }) => {
      const token = getAuthToken()
      if (!token) throw new Error('No auth token available')

      const response = await fetch(`/api/friends/accept/${friendship_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // Include cookies
      })
      return handleApiResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
  })
}

export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ friendship_id }: { friendship_id: string }) => {
      const token = getAuthToken()
      if (!token) throw new Error('No auth token available')

      const response = await fetch(`/api/friends/reject/${friendship_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // Include cookies
      })
      return handleApiResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
  })
}

export const useRemoveFriend = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ friend_id }: { friend_id: string }) => {
      const token = getAuthToken()
      if (!token) throw new Error('No auth token available')

      const response = await fetch(`/api/friends/remove/${friend_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // Include cookies
      })
      return handleApiResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
  })
}
