// API functions for anime data
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

// Create axios instance with default config
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_PREFIX || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle 401 responses
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Only redirect to login on 401 if we're not already on auth pages
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        // Don't redirect if we're already on login/signup or if this is an auth endpoint
        if (!currentPath.includes('/login') && !currentPath.includes('/signup') && 
            !error.config?.url?.includes('/api/auth/')) {
          localStorage.removeItem('accessToken')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export interface Anime {
  id: number
  title: {
    english: string
    native: string
    romaji: string
  }
  description: string
  averageScore: number
  meanScore: number
  season: string
  seasonYear: number
  episodes: number
  status: string
  genres: string[]
  coverImage: {
    large: string
    medium: string
    small: string
  }
  bannerImage: string
  studios: {
    nodes: { name: string }[]
  }
  startDate: { day: number; month: number; year: number }
  endDate: { day: number; month: number; year: number } | null
}

export interface AnimeResponse {
  media: Anime[]
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch {
      // If we can't parse the error response, use the default message
    }
    
    throw new ApiError(errorMessage, response.status, response)
  }
  
  return response.json()
}

export const fetchAnimeList = async (): Promise<Anime[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_PREFIX}/api/anime`
    )
    
    const data: AnimeResponse = await handleApiResponse(response)
    return data.media || []
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(`Failed to fetch anime list: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const fetchAnimeById = async (id: string): Promise<Anime> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_PREFIX}/api/anime/${id}`
    )
    
    const data = await handleApiResponse(response)
    const anime = data.media?.[0] || data
    
    if (!anime) {
      throw new ApiError(`Anime with ID ${id} not found`, 404)
    }
    
    return anime
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(`Failed to fetch anime with id ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
