import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const per_page = searchParams.get('per_page') || '20'

    const response = await fetch(`${BACKEND_URL}/api/rooms?page=${page}&per_page=${per_page}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend rooms API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to fetch rooms' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Rooms API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, anime_id, episode, max_participants, is_private } = body

    if (!name || !anime_id || episode === undefined) {
      return NextResponse.json(
        { error: 'name, anime_id, and episode are required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/api/rooms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, anime_id, episode, max_participants, is_private }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend create room API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to create room' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Create room API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
