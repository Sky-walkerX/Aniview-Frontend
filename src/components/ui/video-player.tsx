"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type VideoSource, type Subtitle } from '@/lib/api'
import Hls from 'hls.js'

interface VideoPlayerProps {
  sources: VideoSource[]
  subtitles?: Subtitle[]
  title?: string
  episodeTitle?: string
  onPrevious?: () => void
  onNext?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
  intro?: { start: number; end: number }
  outro?: { start: number; end: number }
  className?: string
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  sources,
  subtitles = [],
  title,
  episodeTitle,
  onPrevious,
  onNext,
  hasNext = false,
  hasPrevious = false,
  intro,
  outro,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [selectedQuality, setSelectedQuality] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSkipIntro, setShowSkipIntro] = useState(false)
  const [showSkipOutro, setShowSkipOutro] = useState(false)
  const [hlsLoading, setHlsLoading] = useState(false)
  const [hlsError, setHlsError] = useState<string | null>(null)

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Parse quality from quality string (e.g., "1080p (1920x1080) - 1.97 MB/s - HD-2 (Sub)")
  const parseQuality = (qualityString: string): string => {
    // Extract resolution like "1080p", "720p", "360p"
    const match = qualityString.match(/(\d+p)/i)
    return match ? match[1] : qualityString
  }

  // Get clean quality options
  const getQualityOptions = () => {
    const uniqueQualities = new Map<string, VideoSource>()
    
    sources.forEach(source => {
      const cleanQuality = parseQuality(source.quality)
      if (!uniqueQualities.has(cleanQuality)) {
        uniqueQualities.set(cleanQuality, source)
      }
    })
    
    return Array.from(uniqueQualities.entries()).sort(([a], [b]) => {
      const qualityOrder = { '1080p': 3, '720p': 2, '360p': 1 }
      const aValue = qualityOrder[a as keyof typeof qualityOrder] || 0
      const bValue = qualityOrder[b as keyof typeof qualityOrder] || 0
      return bValue - aValue
    })
  }

  const qualityOptions = getQualityOptions()
  
  // Calculate selected source
  const selectedSource = qualityOptions.find(([quality]) => quality === selectedQuality)?.[1] || qualityOptions[0]?.[1]

  // Set default quality to highest available
  useEffect(() => {
    if (qualityOptions.length > 0 && !selectedQuality) {
      setSelectedQuality(qualityOptions[0][0])
    }
  }, [qualityOptions, selectedQuality])

  // HLS.js integration for .m3u8 streams
  useEffect(() => {
    const video = videoRef.current
    if (!video || !selectedSource) return

    let hls: Hls | null = null

    const setupVideo = () => {
      const videoUrl = selectedSource.url
      console.log('Setting up video with URL:', videoUrl)
      console.log('Selected source full object:', selectedSource)
      
      // Reset states
      setHlsLoading(false)
      setHlsError(null)

      // Check if the URL is an HLS stream (.m3u8)
      if (videoUrl.includes('.m3u8')) {
        console.log('Detected HLS stream, initializing HLS.js...')
        
        if (Hls.isSupported()) {
          console.log('HLS.js is supported in this browser')
          setHlsLoading(true)
          
          // Destroy any existing HLS instance first
          if (hls) {
            try {
              console.log('Destroying previous HLS instance')
              hls.destroy()
            } catch (e) {
              console.warn('Error destroying previous HLS instance:', e)
            }
          }

          console.log('Creating new HLS instance with configuration...')
          hls = new Hls({
            debug: true, // Enable debug for troubleshooting
            enableWorker: true,
            lowLatencyMode: false,
            autoStartLoad: true,
            startLevel: -1,
            capLevelToPlayerSize: true,
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
            liveSyncDurationCount: 3,
            liveMaxLatencyDurationCount: 10,
            // Enhanced network settings for better reliability through proxy
            manifestLoadingTimeOut: 20000,
            manifestLoadingMaxRetry: 3,
            manifestLoadingRetryDelay: 2000,
            levelLoadingTimeOut: 20000,
            levelLoadingMaxRetry: 6,
            levelLoadingRetryDelay: 2000,
            fragLoadingTimeOut: 30000,
            fragLoadingMaxRetry: 10,
            fragLoadingRetryDelay: 2000,
            // Since we're using proxy, we can use simple fetch setup
            fetchSetup: (context: any, initParams: RequestInit) => {
              console.log('HLS.js fetch request to:', context.url)
              return new Request(context.url, {
                ...initParams,
                mode: 'cors',
                credentials: 'omit'
              })
            }
          })

          // Always use proxy for HLS streams to handle CORS and ensure all segments are proxied
          const proxyUrl = `/api/proxy-hls?url=${encodeURIComponent(videoUrl)}`
          console.log('Using HLS proxy for all requests:', proxyUrl)
          console.log('Original video URL:', videoUrl)
          
          hls.loadSource(proxyUrl)
          hls.attachMedia(video)

          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            console.log('✅ HLS media attached successfully')
          })

          hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            console.log('✅ HLS manifest parsed successfully')
            console.log('Available levels:', data.levels?.map(l => ({ 
              width: l.width, 
              height: l.height, 
              bitrate: l.bitrate,
              url: l.url?.[0]?.split('/').pop() 
            })))
            setHlsLoading(false)
            setHlsError(null)
          })

          hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
            console.log('✅ HLS level loaded:', {
              level: data.level,
              duration: data.details?.totalduration,
              fragments: data.details?.fragments?.length
            })
          })

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS.js error event:', event)
            console.error('Raw HLS.js error data:', data)
            
            // Handle case where data might be undefined or empty
            if (!data || typeof data !== 'object') {
              console.warn('HLS error with invalid data object:', data)
              setHlsError('HLS stream error - invalid error data')
              setHlsLoading(false)
              return
            }
            
            const errorInfo = {
              type: data.type,
              details: data.details,
              fatal: data.fatal,
              reason: data.reason,
              response: data.response,
              context: data.context,
              networkDetails: data.networkDetails,
              frag: data.frag,
              level: data.level,
              url: data.url || selectedSource?.url,
              // Add more debugging info
              loader: data.loader,
              responseText: data.responseText,
              responseCode: data.code
            }
            
            console.error('HLS.js detailed error data:', errorInfo)
            
            setHlsLoading(false)

            // Check for specific error types
            if (data.details === 'manifestLoadError') {
              console.error('Manifest load error through proxy for URL:', selectedSource?.url)
              setHlsError('Failed to load HLS manifest through proxy - the stream may be unavailable')
              return
            }

            if (data.details === 'fragLoadError') {
              console.error('Fragment load error through proxy for URL:', selectedSource?.url)
              setHlsError('Video segment load error - stream may be corrupted or CDN issues')
              return
            }

            if (data.details === 'networkError') {
              setHlsError('Network error - check your connection')
              console.error('Network error for URL:', selectedSource?.url)
              return
            }

            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('Fatal network error encountered, trying to recover...')
                  setHlsError('Network error - attempting recovery')
                  setTimeout(() => {
                    if (hls) {
                      try {
                        console.log('Attempting HLS recovery via startLoad()')
                        hls.startLoad()
                        setHlsError(null)
                      } catch (e) {
                        console.error('Failed to restart HLS load:', e)
                        setHlsError('Failed to recover from network error')
                      }
                    }
                  }, 2000)
                  break
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('Fatal media error encountered, trying to recover...')
                  setHlsError('Media error - attempting recovery')
                  setTimeout(() => {
                    if (hls) {
                      try {
                        console.log('Attempting HLS recovery via recoverMediaError()')
                        hls.recoverMediaError()
                        setHlsError(null)
                      } catch (e) {
                        console.error('Failed to recover from media error:', e)
                        setHlsError('Failed to recover from media error')
                      }
                    }
                  }, 2000)
                  break
                default:
                  console.error('Fatal HLS error, cannot recover:', data)
                  setHlsError(`Fatal error: ${data.details || 'Unknown error'}`)
                  if (hls) {
                    try {
                      hls.destroy()
                    } catch (e) {
                      console.error('Error destroying HLS instance:', e)
                    }
                    hls = null
                  }
                  break
              }
            } else {
              console.warn('Non-fatal HLS error:', data)
              setHlsError(`Warning: ${data.details || 'Non-fatal error'}`)
              // Clear non-fatal errors after a delay
              setTimeout(() => setHlsError(null), 8000)
            }
          })

          hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
            console.log('HLS level loaded:', data.level, 'details:', data.details)
          })

        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari has native HLS support
          console.log('Using native HLS support (Safari)')
          video.src = videoUrl
        } else {
          console.error('HLS is not supported in this browser')
          setHlsError('HLS not supported in this browser')
          // Fallback: try loading as regular video
          console.log('Attempting fallback to regular video loading')
          video.src = videoUrl
        }
      } else {
        // Regular video file (MP4, etc.)
        console.log('Loading regular video file (non-HLS)')
        video.src = videoUrl
      }
    }

    // Test HLS URL accessibility first
    const testHlsUrl = async () => {
      if (selectedSource.url.includes('.m3u8')) {
        console.log('Testing HLS URL accessibility:', selectedSource.url)
        try {
          // First try a simple fetch to test accessibility
          const response = await fetch(selectedSource.url, { 
            method: 'GET',
            mode: 'cors',
            credentials: 'omit'
          })
          console.log('HLS URL test result:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            type: response.type,
            headers: Object.fromEntries(response.headers.entries())
          })
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          // Try to read a small portion of the manifest
          const text = await response.text()
          console.log('HLS manifest preview:', text.substring(0, 200))
          
        } catch (error) {
          console.error('HLS URL test failed:', error)
          if (error instanceof TypeError && error.message.includes('CORS')) {
            setHlsError('CORS Error: HLS stream blocked by server policy')
          } else if (error instanceof TypeError && error.message.includes('network')) {
            setHlsError('Network Error: Unable to reach HLS stream')
          } else {
            setHlsError(`HLS stream not accessible: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }
      }
    }

    testHlsUrl()
    setupVideo()

    // Cleanup function
    return () => {
      if (hls) {
        console.log('Destroying HLS instance')
        hls.destroy()
        hls = null
      }
    }
  }, [selectedSource])

  // Handle video events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadStart = () => {
      console.log('Video load started:', selectedSource?.url)
    }

    const handleLoadedData = () => {
      console.log('Video data loaded successfully')
    }

    const handleError = (e: Event) => {
      console.error('Video playback error:', e)
      console.error('Video error details:', video.error)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      
      // Show skip intro button
      if (intro && video.currentTime >= intro.start && video.currentTime <= intro.end) {
        setShowSkipIntro(true)
      } else {
        setShowSkipIntro(false)
      }

      // Show skip outro button
      if (outro && video.currentTime >= outro.start && video.currentTime <= outro.end) {
        setShowSkipOutro(true)
      } else {
        setShowSkipOutro(false)
      }
    }

    const handleDurationChange = () => setDuration(video.duration)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('error', handleError)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('durationchange', handleDurationChange)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('volumechange', handleVolumeChange)

    return () => {
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('error', handleError)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('durationchange', handleDurationChange)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [intro, outro])

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      setShowControls(true)
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 3000)
    }

    const handleMouseMove = () => resetControlsTimeout()
    const handleKeyDown = () => resetControlsTimeout()

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('keydown', handleKeyDown)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying])

  const togglePlay = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (isPlaying) {
        video.pause()
      } else {
        await video.play()
      }
    } catch (error: any) {
      // Handle the AbortError that occurs when play() is interrupted
      if (error.name === 'AbortError') {
        console.log('Play request was interrupted (AbortError) - this is normal when rapidly toggling play/pause')
      } else if (error.name === 'NotAllowedError') {
        console.warn('Autoplay was prevented by browser policy. User interaction required.')
      } else if (error.name === 'NotSupportedError') {
        console.error('Video format not supported:', error)
      } else {
        console.error('Video play error:', error)
      }
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !isMuted
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const newVolume = parseFloat(e.target.value)
    video.volume = newVolume
    setVolume(newVolume)
    if (newVolume === 0) {
      video.muted = true
    } else if (isMuted) {
      video.muted = false
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const seekTime = (parseFloat(e.target.value) / 100) * duration
    video.currentTime = seekTime
  }

  const handleQualityChange = (quality: string) => {
    const video = videoRef.current
    if (!video) return

    const currentTime = video.currentTime
    const isPlaying = !video.paused
    
    setSelectedQuality(quality)
    
    // Wait for video to load new source
    video.addEventListener('loadeddata', () => {
      video.currentTime = currentTime
      if (isPlaying) {
        video.play()
      }
    }, { once: true })
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.parentElement?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const skipIntro = () => {
    const video = videoRef.current
    if (!video || !intro) return
    video.currentTime = intro.end
  }

  const skipOutro = () => {
    const video = videoRef.current
    if (!video || !outro) return
    video.currentTime = outro.end
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={cn("relative bg-black rounded-xl overflow-hidden group", className)}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster="/anime-video-thumbnail.png"
        crossOrigin="anonymous"
      >
        {subtitles.slice(0, 10).map((subtitle, index) => (
          <track
            key={`${subtitle.label}-${index}`}
            kind={subtitle.kind as any}
            src={subtitle.file}
            srcLang={subtitle.label.toLowerCase().replace(/[^a-z]/g, '')}
            label={subtitle.label}
            default={subtitle.label === 'English'}
          />
        ))}
        Your browser does not support the video tag.
      </video>

      {/* Loading overlay */}
      {!selectedSource && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-lg">Loading video...</div>
        </div>
      )}

      {/* HLS Loading overlay */}
      {hlsLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-lg">Initializing HLS stream...</div>
        </div>
      )}

      {/* HLS Error overlay */}
      {hlsError && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600/90 text-white px-4 py-2 rounded-lg">
          <div className="text-sm">{hlsError}</div>
        </div>
      )}

      {/* Skip buttons */}
      {showSkipIntro && (
        <button
          onClick={skipIntro}
          className="absolute top-4 right-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Skip Intro
        </button>
      )}

      {showSkipOutro && (
        <button
          onClick={skipOutro}
          className="absolute top-4 right-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Skip Outro
        </button>
      )}

      {/* Controls overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Title */}
        {(title || episodeTitle) && (
          <div className="absolute top-4 left-4">
            <h3 className="text-white font-semibold text-lg">{title}</h3>
            {episodeTitle && <p className="text-white/80 text-sm">{episodeTitle}</p>}
          </div>
        )}

        {/* Center play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" fill="currentColor" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
            )}
          </button>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
              className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>

              {hasPrevious && (
                <button onClick={onPrevious} className="text-white hover:text-primary transition-colors">
                  <SkipBack className="w-5 h-5" />
                </button>
              )}

              {hasNext && (
                <button onClick={onNext} className="text-white hover:text-primary transition-colors">
                  <SkipForward className="w-5 h-5" />
                </button>
              )}

              <div className="flex items-center space-x-2">
                <button onClick={toggleMute} className="text-white hover:text-primary transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Quality selector */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:text-primary transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {showSettings && (
                  <div className="absolute bottom-8 right-0 bg-black/90 backdrop-blur-sm rounded-lg p-2 min-w-24">
                    <div className="text-white text-xs font-medium mb-2">Quality</div>
                    {qualityOptions.map(([quality, source]) => (
                      <button
                        key={quality}
                        onClick={() => {
                          handleQualityChange(quality)
                          setShowSettings(false)
                        }}
                        className={cn(
                          "block w-full text-left px-2 py-1 text-sm rounded transition-colors",
                          selectedQuality === quality
                            ? "bg-primary text-primary-foreground"
                            : "text-white hover:bg-white/20"
                        )}
                      >
                        {quality}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
