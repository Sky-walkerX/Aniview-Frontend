import { useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  fetchAnimeList, 
  fetchAnimeById, 
  fetchAnimeEpisodes, 
  fetchVideoSources, 
  fetchEpisodeSourcesData,
  type Anime, 
  type EpisodesResponse, 
  type StreamingData,
  type EpisodeSourcesResponse 
} from "@/lib/api"

// Query keys for better organization
export const animeKeys = {
  all: ['anime'] as const,
  lists: () => [...animeKeys.all, 'list'] as const,
  list: (filters: string) => [...animeKeys.lists(), { filters }] as const,
  details: () => [...animeKeys.all, 'detail'] as const,
  detail: (id: string) => [...animeKeys.details(), id] as const,
  episodes: () => [...animeKeys.all, 'episodes'] as const,
  episodesList: (animeId: string) => [...animeKeys.episodes(), animeId] as const,
  videoSources: () => [...animeKeys.all, 'video-sources'] as const,
  videoSource: (animeId: string, episodeNumber: number) => [...animeKeys.videoSources(), animeId, episodeNumber] as const,
  episodeStreaming: () => [...animeKeys.all, 'episode-streaming'] as const,
  episodeStreamingData: (animeId: string, episodeNumber: number) => [...animeKeys.episodeStreaming(), animeId, episodeNumber] as const,
}

export const useAnimeList = () => {
  return useQuery({
    queryKey: animeKeys.lists(),
    queryFn: fetchAnimeList,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorMessage: "Failed to load anime list"
    }
  })
}

export const useAnimeById = (id: string) => {
  return useQuery({
    queryKey: animeKeys.detail(id),
    queryFn: () => fetchAnimeById(id),
    enabled: !!id, // Only fetch if id is provided
    staleTime: 10 * 60 * 1000, // 10 minutes for individual anime
    meta: {
      errorMessage: `Failed to load anime with ID: ${id}`
    }
  })
}

// Hook for prefetching anime details when hovering over cards
export const usePrefetchAnime = () => {
  const queryClient = useQueryClient()

  const prefetchAnime = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: animeKeys.detail(id),
      queryFn: () => fetchAnimeById(id),
      staleTime: 10 * 60 * 1000,
    })
  }

  return { prefetchAnime }
}

// Hook for invalidating queries (useful for refresh functionality)
export const useInvalidateAnime = () => {
  const queryClient = useQueryClient()

  const invalidateAnimeList = () => {
    queryClient.invalidateQueries({ queryKey: animeKeys.lists() })
  }

  const invalidateAnimeDetail = (id: string) => {
    queryClient.invalidateQueries({ queryKey: animeKeys.detail(id) })
  }

  const invalidateAllAnime = () => {
    queryClient.invalidateQueries({ queryKey: animeKeys.all })
  }

  return {
    invalidateAnimeList,
    invalidateAnimeDetail,
    invalidateAllAnime,
  }
}

// Hook for fetching episodes of an anime
export const useAnimeEpisodes = (animeId: string) => {
  return useQuery({
    queryKey: animeKeys.episodesList(animeId),
    queryFn: () => fetchAnimeEpisodes(animeId),
    enabled: !!animeId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    meta: {
      errorMessage: `Failed to load episodes for anime: ${animeId}`
    }
  })
}

// Hook for fetching video sources for a specific episode
export const useVideoSources = (animeId: string, episodeNumber: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: animeKeys.videoSource(animeId, episodeNumber),
    queryFn: () => fetchVideoSources(animeId, episodeNumber),
    enabled: options?.enabled !== false && !!animeId && !!episodeNumber,
    staleTime: 30 * 60 * 1000, // 30 minutes (video sources change less frequently)
    meta: {
      errorMessage: `Failed to load video sources for anime ${animeId}, episode ${episodeNumber}`
    }
  })
}

// Hook for prefetching episodes when anime page loads
export const usePrefetchEpisodes = () => {
  const queryClient = useQueryClient()

  const prefetchEpisodes = (animeId: string) => {
    queryClient.prefetchQuery({
      queryKey: animeKeys.episodesList(animeId),
      queryFn: () => fetchAnimeEpisodes(animeId),
      staleTime: 15 * 60 * 1000,
    })
  }

  return { prefetchEpisodes }
}

// Hook for prefetching video sources when hovering over episodes
export const usePrefetchVideoSources = () => {
  const queryClient = useQueryClient()

  const prefetchVideoSources = (animeId: string, episodeNumber: number) => {
    queryClient.prefetchQuery({
      queryKey: animeKeys.videoSource(animeId, episodeNumber),
      queryFn: () => fetchVideoSources(animeId, episodeNumber),
      staleTime: 30 * 60 * 1000,
    })
  }

  return { prefetchVideoSources }
}

// Hook for fetching specific episode sources data
export const useEpisodeSourcesData = (animeId: string, episodeNumber: number) => {
  return useQuery({
    queryKey: animeKeys.episodeStreamingData(animeId, episodeNumber),
    queryFn: () => fetchEpisodeSourcesData(animeId, episodeNumber),
    enabled: !!animeId && !!episodeNumber,
    staleTime: 30 * 60 * 1000, // 30 minutes (video sources change less frequently)
    meta: {
      errorMessage: `Failed to load sources for anime ${animeId}, episode ${episodeNumber}`
    }
  })
}
