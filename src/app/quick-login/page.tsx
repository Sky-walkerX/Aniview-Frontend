"use client"

import { useState } from "react"
import { useLogin } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function QuickLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const login = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Quick Login Test</h1>
          <p className="text-gray-400 mt-2">Quick login for testing purposes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full"
            disabled={login.isPending}
          >
            {login.isPending ? "Logging in..." : "Login"}
          </Button>
        </form>

        {login.error && (
          <div className="text-red-400 text-center">
            {login.error instanceof Error ? login.error.message : "Login failed"}
          </div>
        )}

        <div className="text-center text-sm text-gray-400">
          <p>Don't have an account? <a href="/signup" className="text-accent hover:underline">Sign up</a></p>
          <p className="mt-2">Or go back to <a href="/" className="text-accent hover:underline">home</a></p>
        </div>
      </div>
    </div>
  )
}
