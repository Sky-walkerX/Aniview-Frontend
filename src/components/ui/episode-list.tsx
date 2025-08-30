"use client"

import React from 'react'
import Image from 'next/image'
import { Play, Clock, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Episode } from '@/lib/api'

interface EpisodeListProps {
  episodes: Episode[]
  currentEpisode?: number
  onEpisodeSelect: (episodeNumber: number) => void
  onEpisodeHover?: (episodeNumber: number) => void
  className?: string
}

interface EpisodeItemProps {
  episode: Episode
  isSelected: boolean
  onClick: () => void
  onHover?: () => void
}

const EpisodeItem: React.FC<EpisodeItemProps> = ({ 
  episode, 
  isSelected, 
  onClick, 
  onHover 
}) => {
  return (
    <div
      className={cn(
        "flex-shrink-0 w-64 bg-card rounded-lg border transition-all duration-200 cursor-pointer group",
        isSelected 
          ? "border-primary shadow-lg shadow-primary/20" 
          : "border-border hover:border-primary/50"
      )}
      onClick={onClick}
      onMouseEnter={onHover}
    >
      <div className="relative aspect-video overflow-hidden rounded-t-lg">
        <Image
          src={episode.thumbnail || "/placeholder.svg"}
          alt={episode.title || `Episode ${episode.number}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div 
          className={cn(
            "absolute inset-0 transition-opacity duration-300 flex items-center justify-center",
            isSelected 
              ? "bg-primary/20" 
              : "bg-background/60 opacity-0 group-hover:opacity-100"
          )}
        >
          <Play 
            className={cn(
              "w-8 h-8 transition-colors",
              isSelected ? "text-primary" : "text-primary"
            )} 
            fill="currentColor" 
          />
        </div>
        
        {/* Episode number badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-black/70 text-white text-xs font-medium rounded">
            EP {episode.number}
          </span>
        </div>

        {/* Duration badge */}
        {episode.duration && (
          <div className="absolute bottom-2 right-2">
            <span className="px-2 py-1 bg-black/70 text-white text-xs font-medium rounded flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {Math.round(episode.duration / 60)}m
            </span>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h4 className={cn(
          "font-medium text-sm mb-1 line-clamp-2 transition-colors",
          isSelected ? "text-primary" : "text-foreground"
        )}>
          {episode.title || `Episode ${episode.number}`}
        </h4>
        
        {episode.description && (
          <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
            {episode.description}
          </p>
        )}
      </div>
    </div>
  )
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  episodes,
  currentEpisode,
  onEpisodeSelect,
  onEpisodeHover,
  className
}) => {
  if (!episodes || episodes.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-muted-foreground">No episodes available</p>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex space-x-4 overflow-x-auto pb-6 pt-2 episodes-scrollbar scroll-smooth">
        {episodes.map((episode) => (
          <EpisodeItem
            key={episode.id}
            episode={episode}
            isSelected={currentEpisode === episode.number}
            onClick={() => onEpisodeSelect(episode.number)}
            onHover={() => onEpisodeHover?.(episode.number)}
          />
        ))}
      </div>
    </div>
  )
}

interface EpisodeGridProps {
  episodes: Episode[]
  currentEpisode?: number
  onEpisodeSelect: (episodeNumber: number) => void
  className?: string
}

export const EpisodeGrid: React.FC<EpisodeGridProps> = ({
  episodes,
  currentEpisode,
  onEpisodeSelect,
  className
}) => {
  if (!episodes || episodes.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-muted-foreground">No episodes available</p>
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", className)}>
      {episodes.map((episode) => (
        <div
          key={episode.id}
          className={cn(
            "bg-card rounded-lg border transition-all duration-200 cursor-pointer group",
            currentEpisode === episode.number 
              ? "border-primary shadow-lg shadow-primary/20" 
              : "border-border hover:border-primary/50"
          )}
          onClick={() => onEpisodeSelect(episode.number)}
        >
          <div className="relative aspect-video overflow-hidden rounded-t-lg">
            <Image
              src={episode.thumbnail || "/placeholder.svg"}
              alt={episode.title || `Episode ${episode.number}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div 
              className={cn(
                "absolute inset-0 transition-opacity duration-300 flex items-center justify-center",
                currentEpisode === episode.number 
                  ? "bg-primary/20" 
                  : "bg-background/60 opacity-0 group-hover:opacity-100"
              )}
            >
              <Play 
                className={cn(
                  "w-6 h-6 transition-colors",
                  currentEpisode === episode.number ? "text-primary" : "text-primary"
                )} 
                fill="currentColor" 
              />
            </div>
            
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 bg-black/70 text-white text-xs font-medium rounded">
                EP {episode.number}
              </span>
            </div>

            {episode.duration && (
              <div className="absolute bottom-2 right-2">
                <span className="px-2 py-1 bg-black/70 text-white text-xs font-medium rounded flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.round(episode.duration / 60)}m
                </span>
              </div>
            )}
          </div>
          
          <div className="p-3">
            <h4 className={cn(
              "font-medium text-sm mb-1 line-clamp-1 transition-colors",
              currentEpisode === episode.number ? "text-primary" : "text-foreground"
            )}>
              {episode.title || `Episode ${episode.number}`}
            </h4>
            
            {episode.description && (
              <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                {episode.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
