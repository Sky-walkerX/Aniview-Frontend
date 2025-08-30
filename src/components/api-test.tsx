"use client"

import { useState } from 'react'

export function ApiTest() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testAuth = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_PREFIX}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.text()
      setResult(`Status: ${response.status}\nResponse: ${data}`)
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-blue-100 p-4 rounded-lg space-y-4">
      <h3 className="font-bold">API Connection Test</h3>
      <div className="space-x-2">
        <button 
          onClick={testAuth}
          disabled={loading}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Test /auth/me
        </button>
      </div>
      {result && (
        <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto max-h-40">
          {result}
        </pre>
      )}
    </div>
  )
}
