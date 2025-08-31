import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ room_id: string }> }
) {
  try {
    const { room_id } = await params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token required' },
        { status: 401 }
      )
    }

    // Convert HTTP WebSocket URL to WebSocket URL
    const wsUrl = BACKEND_URL.replace('http://', 'ws://').replace('https://', 'wss://')
    const backendWsUrl = `${wsUrl}/api/rooms/${room_id}/ws?token=${encodeURIComponent(token)}`

    // Since Next.js API routes can't handle WebSocket directly,
    // we'll return the WebSocket URL for the client to connect to
    return NextResponse.json({
      websocket_url: backendWsUrl,
      room_id
    })
  } catch (error) {
    console.error('WebSocket API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
