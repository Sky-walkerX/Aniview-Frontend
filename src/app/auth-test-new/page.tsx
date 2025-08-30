"use client"

import { useState } from "react"
import { useLogin, useRegister, useLogout, useIsAuthenticated } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AuthTestPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  
  const loginMutation = useLogin()
  const registerMutation = useRegister()
  const logoutMutation = useLogout()
  const { isAuthenticated, user, isLoading } = useIsAuthenticated()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ email, password })
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    registerMutation.mutate({ email, username, password })
  }

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  const handleTestAPI = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Include cookies
      })
      const data = await response.json()
      console.log('Direct API test:', data)
    } catch (error) {
      console.error('Direct API test failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-foreground">New Authentication Test</h1>
        
        {/* Status */}
        <div className="bg-card p-6 rounded-lg border space-y-4">
          <h2 className="text-xl font-semibold">Authentication Status</h2>
          <div className="space-y-2">
            <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
            <p>User: {user ? JSON.stringify(user, null, 2) : 'None'}</p>
            <p>Token: httpOnly cookie (not accessible via JavaScript)</p>
            <p>API URL: {process.env.NEXT_PUBLIC_API_PREFIX}</p>
          </div>
          <Button onClick={handleTestAPI} variant="outline">
            Test Direct API Call
          </Button>
        </div>

        {/* Login */}
        {!isAuthenticated && (
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                disabled={loginMutation.isPending}
                className="w-full"
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
            {loginMutation.error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded">
                <p className="text-red-500 text-sm">
                  {loginMutation.error instanceof Error ? loginMutation.error.message : "Login failed"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Register */}
        {!isAuthenticated && (
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Register</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                disabled={registerMutation.isPending}
                className="w-full"
              >
                {registerMutation.isPending ? "Registering..." : "Register"}
              </Button>
            </form>
            {registerMutation.error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded">
                <p className="text-red-500 text-sm">
                  {registerMutation.error instanceof Error ? registerMutation.error.message : "Registration failed"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        {isAuthenticated && (
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Logout</h2>
            <Button 
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              variant="destructive"
            >
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
