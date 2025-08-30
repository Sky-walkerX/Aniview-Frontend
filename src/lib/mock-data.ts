// Mock data for testing video streaming functionality
import { type Episode, type StreamingData, type EpisodesResponse } from '@/lib/api'

// Generate mock video sources for an episode
const generateEpisodeVideoSources = (episodeNumber: number) => [
  {
    url: episodeNumber % 3 === 0 
      ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
      : episodeNumber % 2 === 0
      ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" 
      : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    quality: "1080p (1920x1080) - 1.97 MB/s - HD-2 (Sub)",
    size: "2.1 GB"
  },
  {
    url: episodeNumber % 3 === 0 
      ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
      : episodeNumber % 2 === 0
      ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    quality: "720p (1280x720) - 1.2 MB/s - HD-1 (Sub)",
    size: "1.3 GB"
  },
  {
    url: episodeNumber % 3 === 0 
      ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      : episodeNumber % 2 === 0
      ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    quality: "360p (640x360) - 0.5 MB/s - SD (Sub)",
    size: "540 MB"
  }
]

// Generate mock subtitles for an episode
const generateEpisodeSubtitles = () => [
  {
    file: "/sample-subtitles-en.vtt",
    kind: "captions",
    label: "English"
  },
  {
    file: "/sample-subtitles-ja.vtt", 
    kind: "captions",
    label: "Japanese"
  },
  {
    file: "/sample-subtitles-es.vtt",
    kind: "captions", 
    label: "Spanish"
  }
]

export const mockEpisodes: Episode[] = [
  {
    id: "ep-1",
    number: 1,
    title: "The Beginning",
    description: "The journey starts as our protagonist discovers a new world filled with mystery and adventure.",
    thumbnail: "/placeholder.svg?height=200&width=300&query=episode-1-thumbnail",
    duration: 1440, // 24 minutes in seconds
    sources: generateEpisodeVideoSources(1),
    subtitles: generateEpisodeSubtitles(),
    intro: { start: 10, end: 90 },
    outro: { start: 1350, end: 1440 }
  },
  {
    id: "ep-2", 
    number: 2,
    title: "First Encounters",
    description: "New allies and enemies emerge as the story unfolds with unexpected twists.",
    thumbnail: "/placeholder.svg?height=200&width=300&query=episode-2-thumbnail",
    duration: 1380, // 23 minutes in seconds
    sources: generateEpisodeVideoSources(2),
    subtitles: generateEpisodeSubtitles(),
    intro: { start: 15, end: 95 },
    outro: { start: 1290, end: 1380 }
  },
  {
    id: "ep-3",
    number: 3,
    title: "Rising Tensions",
    description: "The stakes are raised as conflicts begin to surface and choices must be made.",
    thumbnail: "/placeholder.svg?height=200&width=300&query=episode-3-thumbnail", 
    duration: 1500, // 25 minutes in seconds
    sources: generateEpisodeVideoSources(3),
    subtitles: generateEpisodeSubtitles(),
    intro: { start: 12, end: 88 },
    outro: { start: 1410, end: 1500 }
  },
  {
    id: "ep-4",
    number: 4,
    title: "The Challenge",
    description: "A major challenge tests our heroes' resolve and determination.",
    thumbnail: "/placeholder.svg?height=200&width=300&query=episode-4-thumbnail",
    duration: 1440,
    sources: generateEpisodeVideoSources(4),
    subtitles: generateEpisodeSubtitles(),
    intro: { start: 18, end: 92 },
    outro: { start: 1350, end: 1440 }
  },
  {
    id: "ep-5",
    number: 5,
    title: "Secrets Revealed",
    description: "Hidden truths come to light, changing everything our characters thought they knew.",
    thumbnail: "/placeholder.svg?height=200&width=300&query=episode-5-thumbnail",
    duration: 1560, // 26 minutes
    sources: generateEpisodeVideoSources(5),
    subtitles: generateEpisodeSubtitles(),
    intro: { start: 8, end: 85 },
    outro: { start: 1470, end: 1560 }
  },
  {
    id: "ep-6",
    number: 6,
    title: "The Turning Point", 
    description: "A pivotal moment that will alter the course of the entire story.",
    thumbnail: "/placeholder.svg?height=200&width=300&query=episode-6-thumbnail",
    duration: 1620, // 27 minutes
    sources: generateEpisodeVideoSources(6),
    subtitles: generateEpisodeSubtitles(),
    intro: { start: 20, end: 98 },
    outro: { start: 1530, end: 1620 }
  },
  {
    id: "ep-7",
    number: 7,
    title: "New Alliances",
    description: "Unexpected partnerships form as the situation becomes more complex.",
    thumbnail: "/placeholder.svg?height=200&width=300&query=episode-7-thumbnail",
    duration: 1440,
    sources: generateEpisodeVideoSources(7),
    subtitles: generateEpisodeSubtitles(),
    intro: { start: 14, end: 89 },
    outro: { start: 1350, end: 1440 }
  },
  {
    id: "ep-8",
    number: 8,
    title: "The Battle Begins",
    description: "The conflict reaches a boiling point as battle lines are drawn.",
    thumbnail: "/placeholder.svg?height=200&width=300&query=episode-8-thumbnail",
    duration: 1680, // 28 minutes
    sources: generateEpisodeVideoSources(8),
    subtitles: generateEpisodeSubtitles(),
    intro: { start: 16, end: 94 },
    outro: { start: 1590, end: 1680 }
  },
  {
    id: "ep-9",
    number: 9,
    title: "Sacrifice and Honor",
    description: "Characters face difficult choices that test their values and loyalty.",
    thumbnail: "/placeholder.svg?height=200&width=300&query=episode-9-thumbnail",
    duration: 1440,
    sources: generateEpisodeVideoSources(9),
    subtitles: generateEpisodeSubtitles(),
    intro: { start: 11, end: 87 },
    outro: { start: 1350, end: 1440 }
  },
  {
    id: "ep-10",
    number: 10,
    title: "The Resolution",
    description: "The climactic episode where all storylines converge toward an epic conclusion.",
    thumbnail: "/placeholder.svg?height=200&width=300&query=episode-10-thumbnail",
    duration: 1800, // 30 minutes
    sources: generateEpisodeVideoSources(10),
    subtitles: generateEpisodeSubtitles(),
    intro: { start: 25, end: 105 },
    outro: { start: 1710, end: 1800 }
  },
  {
    id: "ep-11",
    number: 11,
    title: "New Beginnings",
    description: "As one chapter ends, another begins with new possibilities and adventures.",
    thumbnail: "/placeholder.svg?height=200&width=300&query=episode-11-thumbnail",
    duration: 1440,
    sources: generateEpisodeVideoSources(11),
    subtitles: generateEpisodeSubtitles(),
    intro: { start: 13, end: 91 },
    outro: { start: 1350, end: 1440 }
  },
  {
    id: "ep-12",
    number: 12,
    title: "The Journey Continues",
    description: "The season finale sets up future adventures while providing satisfying closure.",
    thumbnail: "/placeholder.svg?height=200&width=300&query=episode-12-thumbnail",
    duration: 1740, // 29 minutes
    sources: generateEpisodeVideoSources(12),
    subtitles: generateEpisodeSubtitles(),
    intro: { start: 22, end: 102 },
    outro: { start: 1650, end: 1740 }
  }
]

export const mockEpisodesResponse: EpisodesResponse = {
  success: true,
  anime_id: 21,
  episodes: mockEpisodes
}

export const mockVideoSources: StreamingData = {
  success: true,
  anime_id: 21,
  episode_number: 1,
  sources: [
    {
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      quality: "1080p (1920x1080) - Sample HD",
      size: null
    },
    {
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", 
      quality: "720p (1280x720) - Sample HD",
      size: null
    },
    {
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      quality: "360p (640x360) - Sample SD", 
      size: null
    }
  ],
  subtitles: [
    {
      file: "/sample-subtitles-en.vtt",
      kind: "captions",
      label: "English"
    },
    {
      file: "/sample-subtitles-ja.vtt", 
      kind: "captions",
      label: "Japanese"
    },
    {
      file: "/sample-subtitles-es.vtt",
      kind: "captions", 
      label: "Spanish"
    }
  ],
  intro: {
    start: 10,
    end: 90
  },
  outro: {
    start: 1350,
    end: 1440
  },
  cached: false
}

// Generate mock video sources for different episodes
export const generateMockVideoSources = (animeId: number, episodeNumber: number): StreamingData => {
  return {
    ...mockVideoSources,
    anime_id: animeId,
    episode_number: episodeNumber,
    sources: mockVideoSources.sources.map(source => ({
      ...source,
      // Use different sample videos for variety
      url: episodeNumber % 3 === 0 
        ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
        : episodeNumber % 2 === 0
        ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" 
        : source.url
    }))
  }
}
