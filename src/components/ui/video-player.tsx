"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward, RotateCcw, Captions, Minimize } from 'lucide-react'
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
  const [showQualitySettings, setShowQualitySettings] = useState(false)
  const [showSubtitleSettings, setShowSubtitleSettings] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSkipIntro, setShowSkipIntro] = useState(false)
  const [showSkipOutro, setShowSkipOutro] = useState(false)
  const [hlsLoading, setHlsLoading] = useState(false)
  const [hlsError, setHlsError] = useState<string | null>(null)
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null)

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
  
  // Deduplicate subtitles
  const uniqueSubtitles = subtitles.reduce((acc, subtitle) => {
    if (!acc.some(s => s.label === subtitle.label)) {
      acc.push(subtitle)
    }
    return acc
  }, [] as Subtitle[])

  // Calculate selected source
  const selectedSource = qualityOptions.find(([quality]) => quality === selectedQuality)?.[1] || qualityOptions[0]?.[1]

  // Set default quality to highest available
  useEffect(() => {
    if (qualityOptions.length > 0 && !selectedQuality) {
      setSelectedQuality(qualityOptions[0][0])
    }
  }, [qualityOptions, selectedQuality])

  // Set default subtitle to English if available
  useEffect(() => {
    const englishSubtitle = uniqueSubtitles.find(s => s.label === 'English')
    if (englishSubtitle) {
      setSelectedSubtitle(englishSubtitle.label)
    }
  }, [subtitles])

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
            fetchSetup: (context: any, initParams: RequestInit) => {
              // You can modify headers here if needed
              return new Request(context.url, initParams)
            }
          })

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (!hls) return

            console.error('HLS.js Error:', data)
            setHlsLoading(false)

            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error('Fatal network error encountered, trying to recover...', data)
                  setHlsError(`Network error: ${data.details}`)
                  hls.startLoad()
                  break
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('Fatal media error encountered, trying to recover...', data)
                  setHlsError(`Media error: ${data.details}`)
                  hls.recoverMediaError()
                  break
                default:
                  console.error('An unrecoverable error occurred', data)
                  setHlsError(`An unrecoverable error occurred: ${data.details}`)
                  hls.destroy()
                  break
              }
            } else {
              setHlsError(`A non-fatal error occurred: ${data.details}`)
            }
          })

          // Always use proxy for HLS streams to handle CORS and ensure all segments are proxied
          const proxiedUrl = `/api/proxy-hls?url=${encodeURIComponent(videoUrl)}`
          console.log('Using HLS proxy for all requests:', proxiedUrl)
          console.log('Original video URL:', videoUrl)
          
          hls.loadSource(proxiedUrl)
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

    const handleTextTrackChange = () => {
      const tracks = video.textTracks
      let activeTrack = null
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].mode === 'showing') {
          activeTrack = tracks[i].label
          break
        }
      }
      setSelectedSubtitle(activeTrack)
    }

    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('error', handleError)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('durationchange', handleDurationChange)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('volumechange', handleVolumeChange)
    video.textTracks.addEventListener('change', handleTextTrackChange)

    return () => {
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('error', handleError)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('durationchange', handleDurationChange)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('volumechange', handleVolumeChange)
      video.textTracks.removeEventListener('change', handleTextTrackChange)
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

  const handleSubtitleChange = (label: string | null) => {
    const video = videoRef.current
    if (!video) return

    for (let i = 0; i < video.textTracks.length; i++) {
      const track = video.textTracks[i]
      if (track.label === label) {
        track.mode = 'showing'
      } else {
        track.mode = 'hidden'
      }
    }
    setSelectedSubtitle(label)
    setShowSubtitleSettings(false)
  }

  const handleQualityChange = (quality: string) => {
    const video = videoRef.current
    if (!video) return

    const currentTime = video.currentTime
    const isPlaying = !video.paused
    
    setSelectedQuality(quality)
    setShowQualitySettings(false)
    
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

  const toggleQualitySettings = () => {
    setShowSubtitleSettings(false)
    setShowQualitySettings(s => !s)
  }

  const toggleSubtitleSettings = () => {
    setShowQualitySettings(false)
    setShowSubtitleSettings(s => !s)
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
        {uniqueSubtitles.map((subtitle, index) => (
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
        {/* Top controls */}
        {(title || episodeTitle) && (
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
            <h1 className="text-white text-xl font-bold">{title}</h1>
            <h2 className="text-white text-lg">{episodeTitle}</h2>
          </div>
        )}

        {/* Center controls */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button onClick={togglePlay} className="p-4 bg-black/50 rounded-full">
            {isPlaying ? <Pause size={48} className="text-white" /> : <Play size={48} className="text-white" />}
          </button>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={(currentTime / duration) * 100 || 0}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-500/50 rounded-full appearance-none cursor-pointer accent-primary"
            />
            <span className="text-white text-sm">{formatTime(duration)}</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="text-white">
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              {hasPrevious && (
                <button onClick={onPrevious} className="text-white">
                  <SkipBack size={24} />
                </button>
              )}
              {hasNext && (
                <button onClick={onNext} className="text-white">
                  <SkipForward size={24} />
                </button>
              )}
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="text-white">
                  {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1 bg-gray-500/50 rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Subtitles Button */}
              {uniqueSubtitles.length > 0 && (
                <div className="relative">
                  <button onClick={toggleSubtitleSettings} className="text-white">
                    <Captions size={24} />
                  </button>
                  {showSubtitleSettings && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/80 rounded-lg p-2 min-w-[120px]">
                      <h3 className="text-white text-sm font-bold px-2 py-1">Subtitles</h3>
                      <ul>
                        <li
                          onClick={() => handleSubtitleChange(null)}
                          className={`cursor-pointer px-2 py-1 rounded ${
                            !selectedSubtitle ? 'bg-primary' : ''
                          }`}
                        >
                          Off
                        </li>
                        {uniqueSubtitles.map(subtitle => (
                          <li
                            key={subtitle.label}
                            onClick={() => handleSubtitleChange(subtitle.label)}
                            className={`cursor-pointer px-2 py-1 rounded ${
                              selectedSubtitle === subtitle.label ? 'bg-primary' : ''
                            }`}
                          >
                            {subtitle.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Button */}
              <div className="relative">
                <button onClick={toggleQualitySettings} className="text-white">
                  <Settings size={24} />
                </button>
                {showQualitySettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/80 rounded-lg p-2 min-w-[120px]">
                    <h3 className="text-white text-sm font-bold px-2 py-1">Quality</h3>
                    <ul>
                      {qualityOptions.map(([quality]) => (
                        <li
                          key={quality}
                          onClick={() => handleQualityChange(quality)}
                          className={`cursor-pointer px-2 py-1 rounded ${
                            selectedQuality === quality ? 'bg-primary' : ''
                          }`}
                        >
                          {quality}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button onClick={toggleFullscreen} className="text-white">
                {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
