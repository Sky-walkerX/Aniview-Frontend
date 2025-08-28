import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchAnimeList, fetchAnimeById, type Anime } from "@/lib/api"

// Query keys for better organization
export const animeKeys = {
  all: ['anime'] as const,
  lists: () => [...animeKeys.all, 'list'] as const,
  list: (filters: string) => [...animeKeys.lists(), { filters }] as const,
  details: () => [...animeKeys.all, 'detail'] as const,
  detail: (id: string) => [...animeKeys.details(), id] as const,
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
