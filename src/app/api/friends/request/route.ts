import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

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
    const { receiver_username } = body

    if (!receiver_username) {
      return NextResponse.json(
        { error: 'receiver_username is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/api/friends/request`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ receiver_username }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend friend request API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to send friend request' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Friend request API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
