"use client"

import { useParams } from "next/navigation"
import Image from "next/image"
import { useState } from "react"
import { Play, Calendar, Star, Users, AlertCircle, RefreshCw, Grid, List } from "lucide-react"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { LoadingIndicator } from "@/components/ui/loading-indicator"
import { VideoPlayer } from "@/components/ui/video-player"
import { EpisodeList, EpisodeGrid } from "@/components/ui/episode-list"
import { useAnimeById, useAnimeEpisodes, useVideoSources, usePrefetchVideoSources } from "@/hooks/use-anime"
import { type Anime } from "@/lib/api"
import { cn } from "@/lib/utils"

// Remove the old interface since we're importing it from api.ts

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <div className="animate-pulse">
          <div className="aspect-video bg-muted rounded-xl mb-8"></div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="h-8 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
            <div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// ...existing code...

const ErrorMessage = ({ error, retry }: { error: Error; retry: () => void }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Anime</h1>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            {error.message || "The anime you're looking for doesn't exist or failed to load."}
          </p>
          <button
            onClick={retry}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function AnimePlayerPage() {
  const params = useParams()
  const animeId = params.id as string
  const [currentEpisode, setCurrentEpisode] = useState(1)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  
  const { data: anime, isLoading: animeLoading, error: animeError, refetch: refetchAnime } = useAnimeById(animeId)
  const { data: episodesData, isLoading: episodesLoading, error: episodesError } = useAnimeEpisodes(animeId)
  
  // Fetch video sources for current episode using the sources endpoint
  const { data: videoData, isLoading: videoLoading, error: videoError } = useVideoSources(
    animeId, 
    currentEpisode
  )
  const { prefetchVideoSources } = usePrefetchVideoSources()

  // Use real episode data from backend
  const episodes = episodesData?.episodes || []
  const videoSources = videoData?.sources || []
  const subtitles = videoData?.subtitles || []

  // Prefetch video sources on episode hover
  const handleEpisodeHover = (episodeNumber: number) => {
    prefetchVideoSources(animeId, episodeNumber)
  }

  // Handle episode selection
  const handleEpisodeSelect = (episodeNumber: number) => {
    setCurrentEpisode(episodeNumber)
  }

  // Navigation functions
  const handlePreviousEpisode = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode(currentEpisode - 1)
    }
  }

  const handleNextEpisode = () => {
    if (currentEpisode < episodes.length) {
      setCurrentEpisode(currentEpisode + 1)
    }
  }

  if (animeLoading) {
    return <LoadingSkeleton />
  }

  if (animeError) {
    return <ErrorMessage error={animeError as Error} retry={() => refetchAnime()} />
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Anime Not Found</h1>
          <p className="text-muted-foreground">The anime you're looking for doesn't exist.</p>
        </main>
        <Footer />
      </div>
    )
  }

  const selectedEpisode = episodes.find(ep => ep.number === currentEpisode)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-20">
        {/* Video Player */}
        <div className="mb-8">
          {videoLoading || episodesLoading ? (
            <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
              <LoadingIndicator text="Loading video..." />
            </div>
          ) : videoError ? (
            <div className="aspect-video bg-muted rounded-xl flex items-center justify-center border border-border">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-muted-foreground">Failed to load video sources</p>
              </div>
            </div>
          ) : videoSources.length > 0 ? (
            <VideoPlayer
              sources={videoSources}
              subtitles={subtitles}
              title={anime.title.english}
              episodeTitle={selectedEpisode?.title}
              onPrevious={handlePreviousEpisode}
              onNext={handleNextEpisode}
              hasNext={currentEpisode < episodes.length}
              hasPrevious={currentEpisode > 1}
              intro={videoData?.intro || undefined}
              outro={videoData?.outro || undefined}
              className="aspect-video"
            />
          ) : (
            <div className="aspect-video bg-muted rounded-xl flex items-center justify-center border border-border">
              <div className="text-center">
                <Play className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No video sources available</p>
              </div>
            </div>
          )}
        </div>

        {/* Anime Details */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold text-foreground">{anime.title.english}</h1>
              {episodesLoading && (
                <LoadingIndicator size="sm" text="Loading episodes..." />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-primary" fill="currentColor" />
                <span className="text-foreground font-semibold">{anime.averageScore / 10}/10</span>
              </div>

              <div className="flex items-center space-x-1">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {anime.season} {anime.seasonYear}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <Users className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">{anime.studios.nodes[0]?.name}</span>
              </div>

              <span
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  anime.status === "RELEASING" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {anime.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {anime.genres.map((genre) => (
                <span key={genre} className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm">
                  {genre}
                </span>
              ))}
            </div>

            <div
              className="text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: anime.description }}
            />
          </div>

          <div>
            <Image
              src={anime.coverImage.large || "/placeholder.svg"}
              alt={anime.title.english || "Anime"}
              width={300}
              height={400}
              className="w-full rounded-xl border border-border"
            />
          </div>
        </div>

        {/* Episodes Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Episodes {episodes.length > 0 && `(${episodes.length})`}
            </h2>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === 'list' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === 'grid' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {episodesLoading ? (
            <div className="text-center py-8">
              <LoadingIndicator text="Loading episodes..." />
            </div>
          ) : episodesError ? (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-muted-foreground">Failed to load episodes</p>
            </div>
          ) : episodes.length > 0 ? (
            viewMode === 'list' ? (
              <EpisodeList
                episodes={episodes}
                currentEpisode={currentEpisode}
                onEpisodeSelect={handleEpisodeSelect}
                onEpisodeHover={handleEpisodeHover}
              />
            ) : (
              <EpisodeGrid
                episodes={episodes}
                currentEpisode={currentEpisode}
                onEpisodeSelect={handleEpisodeSelect}
              />
            )
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No episodes available</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
