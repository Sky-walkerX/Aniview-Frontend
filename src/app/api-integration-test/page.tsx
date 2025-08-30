'use client'

import { useState } from 'react'
import { useAnimeEpisodes, useVideoSources, useAnimeById } from '@/hooks/use-anime'
import { Button } from '@/components/ui/button'
import { VideoPlayer } from '@/components/ui/video-player'

export default function ApiIntegrationTestPage() {
  const [selectedAnimeId, setSelectedAnimeId] = useState('1')
  const [selectedEpisode, setSelectedEpisode] = useState(1)
  const [customAnimeId, setCustomAnimeId] = useState('')

  // Test the real backend endpoints
  const { data: animeData, isLoading: animeLoading } = useAnimeById(selectedAnimeId)
  const { data: episodesData, isLoading: episodesLoading, error: episodesError } = useAnimeEpisodes(selectedAnimeId)
  
  // Test the video sources hook (uses /sources endpoint)
  const { data: videoData, isLoading: videoLoading, error: videoError } = useVideoSources(selectedAnimeId, selectedEpisode)

  const handleCustomIdSubmit = () => {
    if (customAnimeId.trim()) {
      setSelectedAnimeId(customAnimeId.trim())
    }
  }

  const selectedEpisodeData = episodesData?.episodes.find(ep => ep.number === selectedEpisode)

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">API Integration Test</h1>
      
      {/* API Configuration */}
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          <strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_PREFIX || 'http://localhost:8000'}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <strong>Episodes Endpoint:</strong> <code>/api/anime/{selectedAnimeId}/episodes</code><br/>
          <strong>Sources Endpoint:</strong> <code>/api/anime/{selectedAnimeId}/episodes/{selectedEpisode}/sources</code>
        </p>
        
        <div className="mb-4">
          <h3 className="font-medium mb-2">Authentication Status</h3>
          <p className="text-sm">
            <strong>Token Available:</strong> 
            <span className={typeof window !== 'undefined' && localStorage.getItem('accessToken') ? 'text-green-600' : 'text-orange-600'}>
              {typeof window !== 'undefined' && localStorage.getItem('accessToken') ? ' Yes' : ' Using test token'}
            </span>
          </p>
        </div>
        
        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={customAnimeId}
            onChange={(e) => setCustomAnimeId(e.target.value)}
            placeholder="Enter anime ID to test"
            className="px-3 py-2 border rounded-md"
          />
          <Button onClick={handleCustomIdSubmit}>Test Custom ID</Button>
          <span className="text-sm text-gray-500">Current ID: {selectedAnimeId}</span>
        </div>
      </div>

      {/* Episodes Data Test */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">Episodes Endpoint Test</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Testing: <code>GET /api/anime/{selectedAnimeId}/episodes</code>
        </p>
        
        {episodesLoading && (
          <div className="text-blue-600">Loading episodes...</div>
        )}
        
        {episodesError && (
          <div className="text-red-600 mb-4">
            <strong>Error:</strong> {episodesError.message}
            <div className="text-sm mt-2">Falling back to mock data...</div>
          </div>
        )}
        
        {episodesData && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-medium text-green-600">✓ Episodes Response</h3>
                <p className="text-sm">Success: {episodesData.success ? 'Yes' : 'No'}</p>
                <p className="text-sm">Anime ID: {episodesData.anime_id}</p>
                <p className="text-sm">Episodes Count: {episodesData.episodes.length}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Real Episode Titles</h3>
                <p className="text-sm">
                  Episodes have real titles: {episodesData.episodes.filter(ep => ep.title && ep.title !== `Episode ${ep.number}`).length}/{episodesData.episodes.length}
                </p>
                <p className="text-sm">
                  Sources fetched separately via sources endpoint
                </p>
              </div>
            </div>
            
            {/* Episode Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Episode:</label>
              <select
                value={selectedEpisode}
                onChange={(e) => setSelectedEpisode(parseInt(e.target.value))}
                className="px-3 py-2 border rounded-md"
              >
                {episodesData.episodes.map(episode => (
                  <option key={episode.id} value={episode.number}>
                    Episode {episode.number}: {episode.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Selected Episode Details */}
      {selectedEpisodeData && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Episode {selectedEpisode} Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Episode Info</h3>
              <p className="text-sm mb-1"><strong>Title:</strong> {selectedEpisodeData.title}</p>
              <p className="text-sm mb-1"><strong>Duration:</strong> {selectedEpisodeData.duration ? `${Math.floor(selectedEpisodeData.duration / 60)}m ${selectedEpisodeData.duration % 60}s` : 'Unknown'}</p>
              <p className="text-sm mb-1"><strong>Description:</strong> {selectedEpisodeData.description || 'No description'}</p>
              <p className="text-sm mb-1"><strong>Air Date:</strong> {selectedEpisodeData.air_date || 'Unknown'}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Sources Data</h3>
              <p className="text-sm mb-1">
                <strong>Sources Endpoint:</strong> 
                <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">
                  /api/anime/{selectedAnimeId}/episodes/{selectedEpisode}/sources
                </code>
              </p>
              <p className="text-sm mb-1">
                <strong>Sources Available:</strong> 
                <span className={videoData?.sources && videoData.sources.length > 0 ? 'text-green-600' : 'text-red-600'}>
                  {videoData?.sources ? ` ${videoData.sources.length} sources` : ' No sources loaded'}
                </span>
              </p>
            </div>
          </div>

          {/* Video Sources Details */}
          {videoData?.sources && videoData.sources.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Available Video Sources (from sources endpoint)</h3>
              <div className="space-y-3">
                {videoData.sources.map((source, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm"><strong>Quality:</strong> {source.quality}</p>
                        <p className="text-sm"><strong>Size:</strong> {source.size || 'Unknown'}</p>
                        <p className="text-sm">
                          <strong>Type:</strong> 
                          <span className={source.url.includes('.m3u8') ? 'text-green-600' : 'text-blue-600'}>
                            {source.url.includes('.m3u8') ? ' HLS (.m3u8)' : ' Direct Video'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
                          <strong>URL:</strong> {source.url.substring(0, 100)}...
                        </p>
                        <button
                          onClick={() => navigator.clipboard.writeText(source.url)}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded mt-1 hover:bg-blue-600"
                        >
                          Copy Full URL
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Subtitles Info */}
              {videoData.subtitles && videoData.subtitles.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Available Subtitles</h3>
                  <div className="space-y-2">
                    {videoData.subtitles.map((subtitle, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        <p className="text-sm"><strong>Language:</strong> {subtitle.label}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
                          <strong>VTT URL:</strong> {subtitle.file}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Episode Metadata */}
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                <h3 className="font-medium mb-2">Episode Metadata</h3>
                <p className="text-sm"><strong>Episode ID:</strong> {videoData.episode_id || 'Unknown'}</p>
                <p className="text-sm"><strong>Cached:</strong> {videoData.cached ? 'Yes' : 'No'}</p>
                <p className="text-sm"><strong>Intro/Outro:</strong> {videoData.intro || videoData.outro ? 'Available' : 'Not set'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Sources Hook Test */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">Sources Endpoint Test</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Testing: <code>GET /api/anime/{selectedAnimeId}/episodes/{selectedEpisode}/sources</code>
        </p>
        
        {videoLoading && (
          <div className="text-blue-600">Loading video sources...</div>
        )}
        
        {videoError && (
          <div className="text-red-600 mb-4">
            <strong>Error:</strong> {videoError.message}
          </div>
        )}
        
        {videoData && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-medium text-green-600">✓ Sources Response</h3>
                <p className="text-sm">Success: {videoData.success ? 'Yes' : 'No'}</p>
                <p className="text-sm">Anime ID: {videoData.anime_id}</p>
                <p className="text-sm">Episode: {videoData.episode_number}</p>
                <p className="text-sm">Sources: {videoData.sources.length}</p>
                <p className="text-sm">Cached: {videoData.cached ? 'Yes' : 'No'}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Backend Integration</h3>
                <p className="text-sm">
                  ✓ Real episode titles from episodes endpoint
                </p>
                <p className="text-sm">
                  ✓ Real video sources from sources endpoint
                </p>
                <p className="text-sm">
                  ✓ Separate API calls for episodes and sources
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Player Test */}
      {videoData && videoData.sources.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Video Player Test</h2>
          <VideoPlayer
            sources={videoData.sources}
            subtitles={videoData.subtitles}
            intro={videoData.intro || undefined}
            outro={videoData.outro || undefined}
            title={animeData?.title.english}
            episodeTitle={selectedEpisodeData?.title || `Episode ${selectedEpisode}`}
            onNext={() => {
              if (selectedEpisode < (episodesData?.episodes.length || 0)) {
                setSelectedEpisode(selectedEpisode + 1)
              }
            }}
            onPrevious={() => {
              if (selectedEpisode > 1) {
                setSelectedEpisode(selectedEpisode - 1)
              }
            }}
            hasNext={selectedEpisode < (episodesData?.episodes.length || 0)}
            hasPrevious={selectedEpisode > 1}
          />
        </div>
      )}
    </div>
  )
}
