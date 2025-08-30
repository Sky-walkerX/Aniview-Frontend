"use client"

import { useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useIsAuthenticated } from "@/hooks/use-auth"
import { LoadingIndicator } from "@/components/ui/loading-indicator"

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = "/login" }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useIsAuthenticated()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingIndicator size="lg" text="Checking authentication..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingIndicator size="lg" text="Redirecting to login..." />
      </div>
    )
  }

  return <>{children}</>
}
