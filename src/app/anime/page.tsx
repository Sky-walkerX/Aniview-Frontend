"use client"

import Link from "next/link"
import Image from "next/image"
import { Play, AlertCircle, RefreshCw } from "lucide-react"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { LoadingIndicator } from "@/components/ui/loading-indicator"
import { useAnimeList, usePrefetchAnime } from "@/hooks/use-anime"
import { type Anime } from "@/lib/api"

// Remove the old interface since we're importing it from api.ts

const AnimeCard = ({ anime }: { anime: Anime }) => {
  const { prefetchAnime } = usePrefetchAnime()

  return (
    <Link 
      href={`/anime/${anime.id}`} 
      className="group block h-full"
      onMouseEnter={() => prefetchAnime(anime.id.toString())}
    >
      <div className="relative bg-card rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 overflow-hidden h-full flex flex-col">
        <div className="relative aspect-[3/4] overflow-hidden flex-shrink-0">
          <Image
            src={anime.coverImage.large || "/placeholder.svg"}
            alt={"hello"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Play className="w-12 h-12 text-primary" fill="currentColor" />
          </div>

          {/* Bottom overlay with description */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-muted-foreground text-sm line-clamp-3 mb-2">{anime.description}</p>
            <p className="text-primary text-sm font-medium">{anime.episodes} episodes</p>
          </div>
        </div>

        {/* Card content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <h3 className="text-foreground font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">{anime.title.english}</h3>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center space-x-1">
              <span className="text-primary font-bold">★</span>
              <span className="text-muted-foreground text-sm">{anime.averageScore / 10}/10</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {anime.genres.slice(0, 2).map((genre) => (
                <span key={genre} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

const LoadingSkeleton = () => {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse h-full flex flex-col">
      <div className="aspect-[3/4] bg-muted flex-shrink-0"></div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="h-6 bg-muted rounded mb-2 min-h-[3.5rem]"></div>
        <div className="flex justify-between mt-auto">
          <div className="h-4 bg-muted rounded w-16"></div>
          <div className="flex gap-1">
            <div className="h-6 bg-muted rounded w-12"></div>
            <div className="h-6 bg-muted rounded w-12"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ...existing code...

const ErrorMessage = ({ error, retry }: { error: Error; retry: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-foreground mb-2">Error Loading Anime</h2>
      <p className="text-muted-foreground mb-4 text-center max-w-md">
        {error.message || "Something went wrong while fetching the anime list."}
      </p>
      <button
        onClick={retry}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  )
}

export default function AnimePage() {
  const { data: anime = [], isLoading, error, refetch, isFetching } = useAnimeList()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-foreground">Anime Library</h1>
            {isFetching && !isLoading && (
              <LoadingIndicator size="sm" text="Updating..." />
            )}
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover thousands of anime titles with crystal-clear streaming and real-time subtitles
          </p>
        </div>

        {error ? (
          <ErrorMessage error={error as Error} retry={() => refetch()} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => <LoadingSkeleton key={i} />)
              : anime.map((item) => <AnimeCard key={item.id} anime={item} />)}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
