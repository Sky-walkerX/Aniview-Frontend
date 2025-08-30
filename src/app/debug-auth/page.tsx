"use client"

import { useEffect, useState } from 'react'
import { useAuth, useIsAuthenticated } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

export default function DebugAuth() {
  const [tokenFromStorage, setTokenFromStorage] = useState<string | null>(null)
  const { isAuthenticated, user, isLoading } = useIsAuthenticated()
  const { token } = useAuth()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTokenFromStorage(localStorage.getItem('accessToken'))
    }
  }, [])

  const handleClearToken = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      setTokenFromStorage(null)
      window.location.reload()
    }
  }

  const handleSetTestToken = () => {
    if (typeof window !== 'undefined') {
      // Set a test token to see what happens
      const testToken = 'test_token_123'
      localStorage.setItem('accessToken', testToken)
      setTokenFromStorage(testToken)
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-8">Authentication Debug</h1>
        
        <div className="space-y-4 bg-card p-6 rounded-lg border border-border">
          <div>
            <h3 className="font-semibold text-card-foreground">Authentication Status:</h3>
            <p className="text-muted-foreground">
              Authenticated: {isAuthenticated ? 'Yes' : 'No'}
            </p>
            <p className="text-muted-foreground">
              Loading: {isLoading ? 'Yes' : 'No'}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground">User Data:</h3>
            <pre className="text-sm text-muted-foreground bg-muted p-2 rounded">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground">Token from Hook:</h3>
            <p className="text-sm text-muted-foreground font-mono break-all">
              {token || 'No token'}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground">Token from Storage:</h3>
            <p className="text-sm text-muted-foreground font-mono break-all">
              {tokenFromStorage || 'No token in storage'}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground">Environment:</h3>
            <p className="text-sm text-muted-foreground">
              API Prefix: {process.env.NEXT_PUBLIC_API_PREFIX || 'Not set'}
            </p>
          </div>

          <div className="flex space-x-4">
            <Button onClick={handleClearToken} variant="outline">
              Clear Token
            </Button>
            <Button onClick={handleSetTestToken} variant="outline">
              Set Test Token
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
