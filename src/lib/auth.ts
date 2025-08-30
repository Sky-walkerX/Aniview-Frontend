// Authentication API functions and types

export interface User {
  id: string
  email: string
  username: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  confirmPassword?: string // Optional for frontend validation only
}

// Response from register/login endpoints (matches Rust backend exactly)
export interface AuthResponse {
  user: User
  token: string  // Access token from backend
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status?: number,
    public field?: string
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

const handleAuthResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    let field: string | undefined
    
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
      field = errorData.field
    } catch {
      // If we can't parse the error response, use the default message
    }
    
    throw new AuthError(errorMessage, response.status, field)
  }
  
  return response.json()
}

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  try {
    // Remove confirmPassword from the request body as backend doesn't expect it
    const { confirmPassword, ...requestData } = data
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_PREFIX}/api/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      }
    )
    
    return await handleAuthResponse(response)
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_PREFIX}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    )
    
    return await handleAuthResponse(response)
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const logout = async (accessToken: string): Promise<void> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_PREFIX}/api/auth/logout`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new AuthError('Logout failed')
    }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const getCurrentUser = async (accessToken: string): Promise<User> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_PREFIX}/api/auth/me`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    return await handleAuthResponse(response)
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError(`Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
