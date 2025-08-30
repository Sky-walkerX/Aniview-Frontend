"use client"

import { useState } from 'react'
import { VideoPlayer } from '@/components/ui/video-player'
import { EpisodeList, EpisodeGrid } from '@/components/ui/episode-list'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { mockEpisodes } from '@/lib/mock-data'
import { Grid, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type StreamingData } from '@/lib/api'

// Real API response example
const realApiResponse: StreamingData = {
  "anime_id": 177709,
  "cached": true,
  "episode_number": 1,
  "intro": null,
  "outro": null,
  "sources": [
    {
      "quality": "1080p (1920x1080) - 1.97 MB/s - HD-2 (Sub)",
      "size": null,
      "url": "https://dc.netmagcdn.com:2228/hls-playback/0eea409b5b5047dbadd55d897a55dc3337fa1a12814591cf368f159964d083012a7ba5b0d1e049ec8c9a5b33a78f13eea4101533bf0497e59dee0387cb08d0b6ad5ceb647cab9af90aa4112aceada2d0a2661f765834f5fdaa3eaae7a8f58991e39be2bf04c7000b000591c8f9f4bb9a32692981d08e33a92685754368637fff615b334b07937c69c49ca135b9b8555530ca4bf0a2e11b824a9d095ab7b1402b3d2d6f91b910102f45a6c20b31fa1200/index-f1-v1-a1.m3u8"
    },
    {
      "quality": "720p (1280x720) - 1.03 MB/s - HD-2 (Sub)",
      "size": null,
      "url": "https://dc.netmagcdn.com:2228/hls-playback/0eea409b5b5047dbadd55d897a55dc3337fa1a12814591cf368f159964d083012a7ba5b0d1e049ec8c9a5b33a78f13eea4101533bf0497e59dee0387cb08d0b6ad5ceb647cab9af90aa4112aceada2d0a2661f765834f5fdaa3eaae7a8f58991e39be2bf04c7000b000591c8f9f4bb9a32692981d08e33a92685754368637fff615b334b07937c69c49ca135b9b8555530ca4bf0a2e11b824a9d095ab7b1402b3d2d6f91b910102f45a6c20b31fa1200/index-f2-v1-a1.m3u8"
    },
    {
      "quality": "360p (640x360) - 551.70 KB/s - HD-2 (Sub)",
      "size": null,
      "url": "https://dc.netmagcdn.com:2228/hls-playback/0eea409b5b5047dbadd55d897a55dc3337fa1a12814591cf368f159964d083012a7ba5b0d1e049ec8c9a5b33a78f13eea4101533bf0497e59dee0387cb08d0b6ad5ceb647cab9af90aa4112aceada2d0a2661f765834f5fdaa3eaae7a8f58991e39be2bf04c7000b000591c8f9f4bb9a32692981d08e33a92685754368637fff615b334b07937c69c49ca135b9b8555530ca4bf0a2e11b824a9d095ab7b1402b3d2d6f91b910102f45a6c20b31fa1200/index-f3-v1-a1.m3u8"
    }
  ],
  "subtitles": [
    {
      "file": "https://mgstatics.xyz/subtitle/fc0baa245084b4db12bc60b56ce4c296/eng-4.vtt",
      "kind": "captions",
      "label": "English"
    },
    {
      "file": "https://mgstatics.xyz/subtitle/fc0baa245084b4db12bc60b56ce4c296/jpn-7.vtt",
      "kind": "captions",
      "label": "Japanese"
    },
    {
      "file": "https://mgstatics.xyz/subtitle/fc0baa245084b4db12bc60b56ce4c296/spa-15.vtt",
      "kind": "captions",
      "label": "Spanish - Latin American"
    },
    {
      "file": "https://mgstatics.xyz/subtitle/fc0baa245084b4db12bc60b56ce4c296/fre-21.vtt",
      "kind": "captions",
      "label": "French"
    },
    {
      "file": "https://mgstatics.xyz/subtitle/fc0baa245084b4db12bc60b56ce4c296/ger-12.vtt",
      "kind": "captions",
      "label": "German"
    }
  ],
  "success": true
}

export default function RealApiTestPage() {
  const [currentEpisode, setCurrentEpisode] = useState(1)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

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
          <h1 className="text-3xl font-bold text-foreground mb-4">Real API Format Test</h1>
          <p className="text-muted-foreground mb-4">
            Testing the video player with the actual API response format you provided.
          </p>
          <div className="bg-card p-4 rounded-lg border border-border">
            <h3 className="font-semibold text-foreground mb-2">API Response Features:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• HLS (.m3u8) video streaming support</li>
              <li>• Multiple quality options with detailed descriptions</li>
              <li>• Extensive subtitle language support (5+ languages)</li>
              <li>• Real streaming URLs for production use</li>
              <li>• Cached response optimization</li>
            </ul>
          </div>
        </div>

        {/* Video Player with Real API Data */}
        <div className="mb-8">
          <VideoPlayer
            sources={realApiResponse.sources}
            subtitles={realApiResponse.subtitles}
            title="Anime with Real Streaming Sources"
            episodeTitle={currentEpisodeData?.title}
            onPrevious={handlePreviousEpisode}
            onNext={handleNextEpisode}
            hasNext={currentEpisode < mockEpisodes.length}
            hasPrevious={currentEpisode > 1}
            intro={realApiResponse.intro || undefined}
            outro={realApiResponse.outro || undefined}
            className="aspect-video"
          />
        </div>

        {/* Current Episode Info */}
        <div className="mb-8 p-4 bg-card rounded-lg border border-border">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Episode {currentEpisode}: {currentEpisodeData?.title}
          </h3>
          <p className="text-muted-foreground mb-3">
            {currentEpisodeData?.description}
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-foreground mb-2">Video Sources:</h4>
              <ul className="space-y-1 text-muted-foreground">
                {realApiResponse.sources.map((source, index) => (
                  <li key={index}>• {source.quality}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Available Subtitles:</h4>
              <ul className="space-y-1 text-muted-foreground">
                {realApiResponse.subtitles.slice(0, 5).map((subtitle, index) => (
                  <li key={index}>• {subtitle.label}</li>
                ))}
                {realApiResponse.subtitles.length > 5 && (
                  <li className="font-medium">+ {realApiResponse.subtitles.length - 5} more languages</li>
                )}
              </ul>
            </div>
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

        {/* Technical Implementation Details */}
        <div className="mt-12 p-6 bg-card rounded-lg border border-border">
          <h3 className="text-xl font-semibold text-foreground mb-4">Technical Implementation</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-3">Quality Parsing:</h4>
              <ul className="space-y-2">
                <li>• Extracts resolution (1080p, 720p, 360p) from complex quality strings</li>
                <li>• Handles bandwidth information and server details</li>
                <li>• Provides clean quality options in dropdown</li>
                <li>• Maintains original URL mapping for video switching</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Subtitle Handling:</h4>
              <ul className="space-y-2">
                <li>• Supports VTT subtitle format</li>
                <li>• Handles multiple language tracks</li>
                <li>• Removes duplicate entries automatically</li>
                <li>• Sets English as default when available</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted/20 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">HLS Streaming Support:</h4>
            <p className="text-muted-foreground">
              The video player now supports HTTP Live Streaming (HLS) with .m3u8 playlists for adaptive bitrate streaming, 
              providing optimal video quality based on network conditions and device capabilities.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
