'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function QuickAuthTestPage() {
  const [token, setToken] = useState('')
  const [testResult, setTestResult] = useState('')

  const handleSetToken = () => {
    if (token.trim()) {
      localStorage.setItem('accessToken', token.trim())
      setTestResult('Token saved to localStorage')
    }
  }

  const handleClearToken = () => {
    localStorage.removeItem('accessToken')
    setTestResult('Token cleared from localStorage')
  }

  const testEpisodesEndpoint = async () => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      const savedToken = localStorage.getItem('accessToken')
      if (savedToken) {
        headers.Authorization = `Bearer ${savedToken}`
      } else {
        headers.Authorization = `Bearer your-test-token-here`
      }

      const response = await fetch('http://localhost:8000/api/anime/1/episodes', {
        headers
      })

      if (response.ok) {
        const data = await response.json()
        setTestResult(`Success! Got ${data.episodes?.length || 0} episodes. First episode: "${data.episodes?.[0]?.title || 'Unknown'}"`)
      } else {
        setTestResult(`Error: ${response.status} - ${response.statusText}`)
      }
    } catch (error) {
      setTestResult(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const testSourcesEndpoint = async () => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      const savedToken = localStorage.getItem('accessToken')
      if (savedToken) {
        headers.Authorization = `Bearer ${savedToken}`
      } else {
        headers.Authorization = `Bearer your-test-token-here`
      }

      const response = await fetch('http://localhost:8000/api/anime/1/episodes/1/sources', {
        headers
      })

      if (response.ok) {
        const data = await response.json()
        setTestResult(`Success! Got ${data.sources?.length || 0} video sources for episode 1`)
      } else {
        setTestResult(`Error: ${response.status} - ${response.statusText}`)
      }
    } catch (error) {
      setTestResult(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const currentToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Quick Auth Test</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">Authentication Token</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Current Token: 
            <span className={currentToken ? 'text-green-600' : 'text-red-600'}>
              {currentToken ? ` ${currentToken.substring(0, 20)}...` : ' None'}
            </span>
          </label>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your auth token here"
            className="w-full px-3 py-2 border rounded-md mb-2"
          />
          <div className="flex gap-2">
            <Button onClick={handleSetToken}>Set Token</Button>
            <Button onClick={handleClearToken} variant="outline">Clear Token</Button>
          </div>
        </div>

        {testResult && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-4">
            <p className="text-sm">{testResult}</p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">API Endpoint Tests</h2>
        
        <div className="flex gap-4">
          <Button onClick={testEpisodesEndpoint}>Test Episodes Endpoint</Button>
          <Button onClick={testSourcesEndpoint}>Test Sources Endpoint</Button>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Episodes:</strong> GET /api/anime/1/episodes</p>
          <p><strong>Sources:</strong> GET /api/anime/1/episodes/1/sources</p>
        </div>
      </div>
    </div>
  )
}
