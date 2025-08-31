import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ friendship_id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { friendship_id } = await params

    const response = await fetch(`${BACKEND_URL}/api/friends/accept/${friendship_id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend accept friend API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to accept friend request' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Accept friend API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
