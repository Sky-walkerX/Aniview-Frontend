// API functions for anime data
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { mockEpisodesResponse, generateMockVideoSources } from './mock-data'

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

export interface Episode {
  id: string
  number: number
  title: string
  description?: string | null
  thumbnail?: string | null
  duration?: number | null
  air_date?: string | null
  still_image?: string | null
  tmdb_rating?: number | null
  // Sources will be fetched separately from the sources endpoint
  sources?: VideoSource[] | null
  subtitles?: Subtitle[] | null
  intro?: {
    start: number
    end: number
  } | null
  outro?: {
    start: number
    end: number
  } | null
}

export interface VideoSource {
  url: string
  quality: string
  size?: string | null
}

export interface Subtitle {
  file: string
  kind: string
  label: string
}

export interface StreamingData {
  success: boolean
  anime_id: number
  episode_number: number
  episode_id?: string
  cached?: boolean
  sources: VideoSource[]
  subtitles: Subtitle[]
  intro?: {
    start: number
    end: number
  } | null
  outro?: {
    start: number
    end: number
  } | null
}

// Response when fetching episodes (your backend structure)
export interface EpisodesResponse {
  success: boolean
  anime_id: number
  episodes: Episode[]
}

// Response for episode sources endpoint (matches your backend exactly)
export interface EpisodeSourcesResponse {
  success: boolean
  anime_id: number
  episode_id: string
  episode_number: number
  cached: boolean
  sources: VideoSource[]
  subtitles: Subtitle[]
  intro?: {
    start: number
    end: number
  } | null
  outro?: {
    start: number
    end: number
  } | null
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

const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) {
      headers.Authorization = `Bearer ${token}`
    } else {
      // For testing purposes, use a test token if no real token is available
      headers.Authorization = `Bearer your-test-token-here`
    }
  }
  
  return headers
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
      `${process.env.NEXT_PUBLIC_API_PREFIX}/api/anime`,
      {
        headers: getAuthHeaders()
      }
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
      `${process.env.NEXT_PUBLIC_API_PREFIX}/api/anime/${id}`,
      {
        headers: getAuthHeaders()
      }
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

// Fetch episodes for a specific anime (includes real episode titles from backend)
export const fetchAnimeEpisodes = async (animeId: string): Promise<EpisodesResponse> => {
  try {
    console.log(`Fetching episodes for anime ${animeId} from backend...`)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_PREFIX}/api/anime/${animeId}/episodes`,
      {
        headers: getAuthHeaders()
      }
    )
    
    const data = await handleApiResponse(response)
    console.log(`Successfully fetched ${data.episodes?.length || 0} episodes from backend`)
    return data
  } catch (error) {
    // Fallback to mock data for development
    console.warn('Backend unavailable, using mock episodes data:', error instanceof Error ? error.message : 'Unknown error')
    return {
      ...mockEpisodesResponse,
      anime_id: parseInt(animeId)
    }
  }
}

// Fetch specific episode sources data
export const fetchEpisodeSourcesData = async (animeId: string, episodeNumber: number): Promise<EpisodeSourcesResponse> => {
  try {
    console.log(`Fetching sources for anime ${animeId}, episode ${episodeNumber} from backend...`)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_PREFIX}/api/anime/${animeId}/episodes/${episodeNumber}/sources`,
      {
        headers: getAuthHeaders()
      }
    )
    
    const data = await handleApiResponse(response)
    console.log(`Successfully fetched sources for episode ${episodeNumber}`)
    return data
  } catch (error) {
    // Fallback to mock data for development
    console.warn('Backend unavailable, using mock episode sources data:', error instanceof Error ? error.message : 'Unknown error')
    const mockData = generateMockVideoSources(parseInt(animeId), episodeNumber)
    return {
      success: true,
      anime_id: parseInt(animeId),
      episode_id: `ep-${episodeNumber}`,
      episode_number: episodeNumber,
      cached: false,
      sources: mockData.sources,
      subtitles: mockData.subtitles,
      intro: mockData.intro,
      outro: mockData.outro
    }
  }
}

// Enhanced function to get video sources - uses the new backend structure
export const fetchVideoSources = async (animeId: string, episodeNumber: number): Promise<StreamingData> => {
  try {
    console.log(`Fetching video sources for anime ${animeId}, episode ${episodeNumber}...`)
    
    // Use the sources endpoint directly since episodes don't include sources
    const sourcesData = await fetchEpisodeSourcesData(animeId, episodeNumber)
    
    // Convert to StreamingData format for compatibility
    return {
      success: sourcesData.success,
      anime_id: sourcesData.anime_id,
      episode_number: sourcesData.episode_number,
      episode_id: sourcesData.episode_id,
      cached: sourcesData.cached,
      sources: sourcesData.sources,
      subtitles: sourcesData.subtitles,
      intro: sourcesData.intro,
      outro: sourcesData.outro
    }
    
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API unavailable, using mock video sources:', error instanceof Error ? error.message : 'Unknown error')
    return generateMockVideoSources(parseInt(animeId), episodeNumber)
  }
}

// Search for anime episodes with video sources
export const searchAnimeWithSources = async (query: string): Promise<Anime[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_PREFIX}/api/anime/search?q=${encodeURIComponent(query)}&with_sources=true`,
      {
        headers: getAuthHeaders()
      }
    )
    
    const data: AnimeResponse = await handleApiResponse(response)
    return data.media || []
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(`Failed to search anime with sources: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
