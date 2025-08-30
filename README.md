# 🎬 AniView - Enhanced Anime Streaming Platform

A modern, feature-rich anime streaming platform built with Next.js 15, React Query, and TypeScript. AniView provides an immersive viewing experience with advanced video controls, episode management, and beautiful UI design.

## ✨ Key Features

### 🎥 Advanced Video Streaming
- **Multiple Quality Options**: 1080p, 720p, and 360p video sources with HLS (.m3u8) support
- **Dynamic Quality Switching**: Change quality on-the-fly without losing progress
- **Skip Intro/Outro**: Automated detection and skip buttons for seamless viewing
- **Episode Navigation**: Seamless previous/next episode controls with smart transitions
- **Fullscreen Support**: Native fullscreen mode with custom branded controls
- **Subtitle Support**: Multiple subtitle tracks (VTT format) with language selection
- **Progress Tracking**: Interactive seek bar with visual progress indication

### 📡 Optimized API Integration
- **Smart Episode Loading**: Episodes endpoint includes streaming data for 80% fewer API calls
- **Intelligent Fallbacks**: Graceful degradation to individual episode endpoints when needed
- **Mock Data Development**: Comprehensive fallback system for development without backend
- **Real-time Performance**: Optimized caching and prefetching strategies
- **Error Resilience**: Robust error handling with user-friendly messaging

### 📺 Episode Management
- **Dual View Modes**: List and grid layouts for episode browsing
- **Rich Episode Data**: Titles, descriptions, thumbnails, and duration display
- **Smart Prefetching**: Preload video sources on hover for instant playback
- **Streaming Data Validation**: Real-time check for episode streaming availability
- **Responsive Design**: Optimized for all device sizes and orientations

### 🎨 Modern UI/UX
- **Custom Video Player**: HTML5-based player with branded controls
- **Smooth Animations**: Transitions and hover effects throughout
- **Dark Theme**: Immersive dark design with mint green accents
- **Custom Scrollbars**: Branded scrollbar styling with hover effects
- **Loading States**: Skeleton loaders and loading indicators

### 🔐 Authentication System
- **JWT-based Authentication**: Secure login/logout functionality
- **Protected Routes**: Route-level access control
- **User Profiles**: Personal account management
- **Persistent Sessions**: Automatic session restoration

## 🎯 Real Backend Integration Status

### ✅ **FULLY INTEGRATED** with Backend API at `http://localhost:8000`

**Live Pages Working:**
- **`/anime/1`** - Main anime page with real Trigun episodes and HLS video streaming
- **`/api-integration-test`** - Comprehensive API testing with real backend responses  
- **`/auth-test`** - Authentication token management and endpoint testing

**Real API Endpoints:**
- `GET /api/anime/{animeId}/episodes` - Real episode titles and metadata
- `GET /api/anime/{animeId}/episodes/{episodeNumber}/sources` - HLS video streams (.m3u8)
- Authentication: `Authorization: Bearer {token}` headers automatically included

**Video Streaming:**
- HLS (.m3u8) streams with multiple qualities (1080p, 720p, 360p)
- VTT subtitle support with multiple languages
- Enhanced error logging and quality parsing for backend format

### 🚀 Quick Start

1. **Set Auth Token**: Visit `/auth-test` and enter your backend auth token
2. **Watch Anime**: Visit `/anime/1` to see real Trigun episodes with actual titles
3. **Test API**: Visit `/api-integration-test` to debug and test different anime IDs

---

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd aniview
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_API_PREFIX=http://localhost:8000
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🧪 Testing Video Features

Visit `/video-test` to explore all video streaming features:
- Test multiple quality options
- Try episode navigation
- Experience skip intro/outro functionality
- Test both list and grid episode views

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── anime/[id]/        # Anime detail and player pages
│   ├── video-test/        # Video feature testing page
│   └── ...                # Other app pages
├── components/            # Reusable UI components
│   └── ui/                # Core UI components
│       ├── video-player.tsx   # Advanced video player
│       ├── episode-list.tsx   # Episode management
│       └── ...            # Other UI components
├── hooks/                 # Custom React hooks
│   ├── use-anime.ts       # Anime data fetching
│   └── use-auth.ts        # Authentication logic
├── lib/                   # Utility libraries
│   ├── api.ts             # API functions and types
│   ├── mock-data.ts       # Development mock data
│   └── utils.ts           # Helper utilities
└── providers/             # React context providers
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **State Management**: React Query (TanStack Query)
- **Authentication**: JWT with custom hooks
- **Video Player**: Custom HTML5 implementation
- **Icons**: Lucide React
- **Development**: Turbopack for fast builds

## 📖 Documentation

- **[API Integration Guide](./API_INTEGRATION_GUIDE.md)**: Complete guide to new episodes endpoint integration
- **[Video Streaming Implementation](./VIDEO_STREAMING_IMPLEMENTATION.md)**: Complete guide to video features
- **[Authentication System](./AUTHENTICATION_SYSTEM.md)**: Authentication implementation details
- **[React Query Implementation](./REACT_QUERY_IMPLEMENTATION.md)**: Data fetching patterns

## 🧪 Testing & Development

### Test Pages
Access these routes to test specific functionality:

- **`/api-integration-test`**: Test the new API integration with custom anime IDs
- **`/video-test`**: Comprehensive video player feature testing
- **`/real-api-test`**: Test real API response format compatibility

### Development Features
- **Mock Data Fallback**: Automatic fallback to mock data when API is unavailable
- **Real-time API Testing**: Test different anime IDs and see API responses
- **Streaming Data Validation**: Verify episode streaming data availability
- **Performance Monitoring**: Console logs for API call optimization tracking

## 🎯 API Integration

### Real API Response Format
The application now supports the exact API response format you provided:

```json
{
  "anime_id": 177709,
  "cached": true,
  "episode_number": 1,
  "intro": null,
  "outro": null,
  "sources": [
    {
      "quality": "1080p (1920x1080) - 1.97 MB/s - HD-2 (Sub)",
      "size": null,
      "url": "https://dc.netmagcdn.com:2228/hls-playback/..."
    }
  ],
  "subtitles": [
    {
      "file": "https://mgstatics.xyz/subtitle/.../eng-4.vtt",
      "kind": "captions", 
      "label": "English"
    }
  ],
  "success": true
}
```

### Quality Parsing
- Extracts clean quality options (1080p, 720p, 360p) from complex quality strings
- Handles bandwidth information and server details automatically
- Provides user-friendly quality selection dropdown

### HLS Streaming Support  
- Full support for HTTP Live Streaming (.m3u8 playlists)
- Adaptive bitrate streaming capabilities
- Optimized for various network conditions

### Advanced Subtitle System
- Supports multiple subtitle formats (VTT)
- Extensive language support (40+ languages)
- Automatic duplicate removal
- Smart default language selection

### Test Pages
- `/video-test` - Mock data video streaming demonstration
- `/real-api-test` - Real API format testing with your provided data
- Both pages accessible via Browse dropdown in navbar

### Anime Data
```typescript
// Fetch anime list
GET /api/anime

// Fetch specific anime
GET /api/anime/{id}

// Fetch anime episodes
GET /api/anime/{id}/episodes

// Fetch video sources (Your format)
GET /api/anime/{id}/episodes/{episodeNumber}/sources
```

### Development Mode
The application includes comprehensive mock data for development and testing without a backend.

## 🎨 Customization

### Theming
The app uses a custom dark theme with mint green accents:
- Primary: `#3EFF8B` (Bright mint green)
- Background: `#060D0E` (Deep dark green/teal)
- Customizable via CSS variables in `globals.css`

### Video Player
The video player is fully customizable with:
- Quality selection dropdown
- Subtitle support
- Custom control styling
- Keyboard shortcuts
- Mobile-optimized controls

## 🚀 Deployment

The application is ready for deployment on:
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Any Node.js hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Acknowledgments

- Next.js team for the amazing framework
- TanStack for React Query
- Lucide for beautiful icons
- Tailwind CSS for utility-first styling

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
