import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { 
  login, 
  register, 
  logout, 
  getCurrentUser,
  type LoginRequest, 
  type RegisterRequest, 
  type User
} from "@/lib/auth"

// Query keys for authentication
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  tokens: () => [...authKeys.all, 'tokens'] as const,
}

// Token management  
export const getStoredTokens = () => {
  if (typeof window === 'undefined') return null
  
  const accessToken = localStorage.getItem('accessToken')
  
  if (accessToken) {
    return { accessToken }
  }
  
  return null
}

export const setStoredTokens = (accessToken: string) => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('accessToken', accessToken)
}

export const clearStoredTokens = () => {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('accessToken')
}

// Login mutation
export const useLogin = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setStoredTokens(data.token)
      queryClient.setQueryData(authKeys.user(), data.user)
      router.push('/anime')
    },
    onError: (error) => {
      console.error('Login failed:', error)
    }
  })
}

// Register mutation
export const useRegister = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      // Store the token
      setStoredTokens(data.token)
      
      // Update the user cache
      queryClient.setQueryData(authKeys.user(), data.user)
      
      // Redirect to home page
      router.push('/')
    },
    onError: (error) => {
      console.error('Registration failed:', error)
    }
  })
}

// Logout mutation
export const useLogout = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const tokens = getStoredTokens()
      if (tokens) {
        await logout(tokens.accessToken)
      }
    },
    onSuccess: () => {
      clearStoredTokens()
      queryClient.removeQueries({ queryKey: authKeys.all })
      router.push('/login')
    },
    onError: (error) => {
      // Even if logout fails, clear local tokens
      clearStoredTokens()
      queryClient.removeQueries({ queryKey: authKeys.all })
      router.push('/login')
      console.error('Logout failed:', error)
    }
  })
}

// Get current user query
export const useCurrentUser = () => {
  const tokens = getStoredTokens()
  
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      // Token is checked inside getStoredTokens and enabled flag
      return getCurrentUser(tokens!.accessToken) 
    },
    enabled: !!tokens?.accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.status === 401 || error?.status === 403) {
        return false
      }
      return failureCount < 2
    }
  })
}

// NOTE: Refresh token functionality removed since backend handles refresh tokens server-side
// and doesn't provide them to the client. Access tokens should be long-lived or 
// the backend should implement automatic refresh.

// Check if user is authenticated
export const useIsAuthenticated = () => {
  const { isAuthenticated, isLoading, user } = useAuth()
  
  return {
    isAuthenticated,
    isLoading,
    user
  }
}

// Export a simple useAuth hook for compatibility
export const useAuth = () => {
  const tokens = getStoredTokens()
  const { data: user, isLoading, isError, error } = useCurrentUser()

  // 1. No token = not authenticated
  if (!tokens?.accessToken) {
    return {
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    }
  }

  // 2. Token exists, but we are fetching the user data
  if (isLoading) {
    return {
      user: null,
      token: tokens.accessToken,
      isLoading: true,
      isAuthenticated: false, // Not confirmed yet
    }
  }

  // 3. Fetching is done, but there was an error
  if (isError) {
    // If auth error, the token is bad, so clear it
    if (error && 'status' in error && (error.status === 401 || error.status === 403)) {
      clearStoredTokens()
    }
    return {
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    }
  }
  
  // 4. Fetching is done, no error, and we have a user
  return {
    user,
    token: tokens.accessToken,
    isLoading: false,
    isAuthenticated: !!user,
  }
}
