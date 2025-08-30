// Token validation and management utilities

/**
 * Decode JWT payload without verification (for client-side inspection only)
 * WARNING: Never trust this data for security decisions
 */
export const decodeJwtPayload = (token: string) => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format')
    }
    
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

/**
 * Check if a token is expired (client-side check only)
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwtPayload(token)
  if (!payload || !payload.exp) {
    return true
  }
  
  return Date.now() >= payload.exp * 1000
}

/**
 * Get user ID from token (if available in payload)
 */
export const getUserIdFromToken = (token: string): string | null => {
  const payload = decodeJwtPayload(token)
  return payload?.sub || payload?.userId || payload?.user_id || null
}

/**
 * Validate if the stored token belongs to the expected user
 */
export const validateTokenForUser = (token: string, expectedUserId: string): boolean => {
  const tokenUserId = getUserIdFromToken(token)
  return tokenUserId === expectedUserId
}

/**
 * Get token expiration time
 */
export const getTokenExpiration = (token: string): number | null => {
  const payload = decodeJwtPayload(token)
  return payload?.exp ? payload.exp * 1000 : null
}
