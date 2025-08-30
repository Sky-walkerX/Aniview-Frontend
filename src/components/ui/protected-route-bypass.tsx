"use client"

import { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

// Temporary bypass for testing - REMOVE IN PRODUCTION
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // For now, just render children without auth check
  // TODO: Re-enable auth when you have a working login
  return <>{children}</>
}

/*
// Original protected route - uncomment when you have auth working
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
    return null
  }

  return <>{children}</>
}
*/
