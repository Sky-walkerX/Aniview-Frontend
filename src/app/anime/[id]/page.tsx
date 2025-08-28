"use client"

import { useParams } from "next/navigation"
import Image from "next/image"
import { Play, Calendar, Star, Users, AlertCircle, RefreshCw } from "lucide-react"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { LoadingIndicator } from "@/components/ui/loading-indicator"
import { useAnimeById } from "@/hooks/use-anime"
import { type Anime } from "@/lib/api"

// Remove the old interface since we're importing it from api.ts

const VideoPlayer = () => {
  return (
    <div className="relative aspect-video bg-card rounded-xl overflow-hidden border border-border">
      <video className="w-full h-full object-cover" controls autoPlay muted poster="/anime-video-thumbnail.png">
        <source src="/placeholder-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

const EpisodeItem = ({ episode, thumbnail }: { episode: number; thumbnail: string }) => {
  return (
    <div className="flex-shrink-0 w-48 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group">
      <div className="relative aspect-video overflow-hidden rounded-t-lg">
        <Image
          src={thumbnail || "/placeholder.svg"}
          alt={`Episode ${episode}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Play className="w-8 h-8 text-primary" fill="currentColor" />
        </div>
      </div>
      <div className="p-3">
        <h4 className="text-foreground font-medium text-sm">Episode {episode}</h4>
        <p className="text-muted-foreground text-xs mt-1">24 min</p>
      </div>
    </div>
  )
}

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
  
  const { data: anime, isLoading, error, refetch, isFetching } = useAnimeById(animeId)

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorMessage error={error as Error} retry={() => refetch()} />
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-20">
        {/* Video Player */}
        <VideoPlayer />

        {/* Anime Details */}
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold text-foreground">{anime.title.english}</h1>
              {isFetching && (
                <LoadingIndicator size="sm" text="Updating..." />
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
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  anime.status === "RELEASING" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}
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
              alt={anime.title.english || "test"}
              width={300}
              height={400}
              className="w-full rounded-xl border border-border"
            />
          </div>
        </div>

        {/* Episodes List */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Episodes</h2>
          <div className="relative">
            {/* Gradient fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
            
            <div className="flex space-x-4 overflow-x-auto pb-6 pt-2 episodes-scrollbar scroll-smooth">
              {Array.from({ length: Math.min(anime.episodes, 12) }, (_, i) => (
                <EpisodeItem
                  key={i + 1}
                  episode={i + 1}
                  thumbnail={`/placeholder.svg?height=200&width=300&query=${anime.title.english} episode ${i + 1} thumbnail`}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
