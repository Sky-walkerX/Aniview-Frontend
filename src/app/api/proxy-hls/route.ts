import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  try {
    console.log('Proxying HLS request to:', url)
    
    // Determine content type based on file extension
    const isManifest = url.includes('.m3u8')
    const isSegment = url.includes('.ts') || url.includes('.m4s') || url.includes('.mp4')
    
    let acceptHeader = '*/*'
    let contentTypeDefault = 'application/octet-stream'
    
    if (isManifest) {
      acceptHeader = 'application/vnd.apple.mpegurl, application/x-mpegurl, */*'
      contentTypeDefault = 'application/vnd.apple.mpegurl'
    } else if (isSegment) {
      acceptHeader = 'video/mp2t, video/mp4, application/octet-stream, */*'
      contentTypeDefault = 'video/mp2t'
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': acceptHeader,
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': new URL(url).origin,
        'Origin': new URL(url).origin
      }
    })

    if (!response.ok) {
      console.error('HLS proxy failed:', response.status, response.statusText, 'for URL:', url)
      return NextResponse.json(
        { error: `Failed to fetch HLS resource: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type') || contentTypeDefault
    
    if (isManifest) {
      // For manifest files, we need to rewrite URLs to go through our proxy
      const text = await response.text()
      const modifiedManifest = text.replace(
        /(https?:\/\/[^\s]+)/g,
        (match) => `/api/proxy-hls?url=${encodeURIComponent(match)}`
      ).replace(
        /^(?!https?:\/\/)([^\s#]+\.(?:ts|m4s|mp4|m3u8))$/gm,
        (match) => {
          // Handle relative URLs by resolving them against the base URL
          const baseUrl = url.substring(0, url.lastIndexOf('/') + 1)
          const fullUrl = new URL(match, baseUrl).href
          return `/api/proxy-hls?url=${encodeURIComponent(fullUrl)}`
        }
      )
      
      console.log('HLS manifest proxy successful, original size:', text.length, 'modified size:', modifiedManifest.length)
      
      return new NextResponse(modifiedManifest, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Range',
          'Cache-Control': 'public, max-age=300', // Shorter cache for manifests
          'Content-Length': Buffer.byteLength(modifiedManifest).toString()
        }
      })
    } else {
      // For segment files, pass through as binary
      const data = await response.arrayBuffer()
      
      console.log('HLS segment proxy successful, content-type:', contentType, 'size:', data.byteLength)
      
      return new NextResponse(data, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Range',
          'Cache-Control': 'public, max-age=3600', // Longer cache for segments
          'Content-Length': data.byteLength.toString(),
          'Accept-Ranges': 'bytes'
        }
      })
    }

  } catch (error) {
    console.error('HLS proxy error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to proxy HLS stream',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    }
  })
}
