"use client"

import { useState } from 'react'
import { VideoPlayer } from '@/components/ui/video-player'
import { EpisodeList, EpisodeGrid } from '@/components/ui/episode-list'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { mockEpisodes, generateMockVideoSources } from '@/lib/mock-data'
import { Grid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function VideoTestPage() {
  const [currentEpisode, setCurrentEpisode] = useState(1)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const videoData = generateMockVideoSources(21, currentEpisode)
  const currentEpisodeData = mockEpisodes.find(ep => ep.number === currentEpisode)

  const handleEpisodeSelect = (episodeNumber: number) => {
    setCurrentEpisode(episodeNumber)
  }

  const handlePreviousEpisode = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode(currentEpisode - 1)
    }
  }

  const handleNextEpisode = () => {
    if (currentEpisode < mockEpisodes.length) {
      setCurrentEpisode(currentEpisode + 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Video Streaming Test</h1>
          <p className="text-muted-foreground mb-8">
            Testing the enhanced video player with multiple quality options, episode navigation, and subtitle support.
          </p>
        </div>

        {/* Video Player */}
        <div className="mb-8">
          <VideoPlayer
            sources={videoData.sources}
            subtitles={videoData.subtitles}
            title="Test Anime Series"
            episodeTitle={currentEpisodeData?.title}
            onPrevious={handlePreviousEpisode}
            onNext={handleNextEpisode}
            hasNext={currentEpisode < mockEpisodes.length}
            hasPrevious={currentEpisode > 1}
            intro={videoData.intro}
            outro={videoData.outro}
            className="aspect-video"
          />
        </div>

        {/* Current Episode Info */}
        <div className="mb-8 p-4 bg-card rounded-lg border border-border">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Episode {currentEpisode}: {currentEpisodeData?.title}
          </h3>
          <p className="text-muted-foreground">
            {currentEpisodeData?.description}
          </p>
          <div className="mt-2 text-sm text-muted-foreground">
            Duration: {currentEpisodeData?.duration ? Math.round(currentEpisodeData.duration / 60) : 0} minutes
          </div>
        </div>

        {/* Episodes Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Episodes ({mockEpisodes.length})
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

          {viewMode === 'list' ? (
            <EpisodeList
              episodes={mockEpisodes}
              currentEpisode={currentEpisode}
              onEpisodeSelect={handleEpisodeSelect}
            />
          ) : (
            <EpisodeGrid
              episodes={mockEpisodes}
              currentEpisode={currentEpisode}
              onEpisodeSelect={handleEpisodeSelect}
            />
          )}
        </div>

        {/* Features Info */}
        <div className="mt-12 p-6 bg-card rounded-lg border border-border">
          <h3 className="text-xl font-semibold text-foreground mb-4">Enhanced Video Features</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">Video Player Features:</h4>
              <ul className="space-y-1">
                <li>• Multiple quality options (1080p, 720p, 360p)</li>
                <li>• Skip intro/outro buttons</li>
                <li>• Episode navigation controls</li>
                <li>• Fullscreen support</li>
                <li>• Volume control with slider</li>
                <li>• Progress bar with seek functionality</li>
                <li>• Auto-hiding controls</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Episode Management:</h4>
              <ul className="space-y-1">
                <li>• Episode list and grid view modes</li>
                <li>• Episode thumbnails and descriptions</li>
                <li>• Current episode highlighting</li>
                <li>• Hover effects and transitions</li>
                <li>• Episode duration display</li>
                <li>• Responsive design</li>
                <li>• Custom scrollbar styling</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
