"use client"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { User, LogOut, Settings } from "lucide-react"
import { useIsAuthenticated, useLogout } from "@/hooks/use-auth"

export const Navbar = () => {
  const [isBrowseOpen, setIsBrowseOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const browseRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const browseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const userMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const { isAuthenticated, user, isLoading } = useIsAuthenticated()
  const logoutMutation = useLogout()

  const handleBrowseMouseEnter = () => {
    if (browseTimeoutRef.current) {
      clearTimeout(browseTimeoutRef.current)
      browseTimeoutRef.current = null
    }
    setIsBrowseOpen(true)
  }
  
  const handleBrowseMouseLeave = () => {
    browseTimeoutRef.current = setTimeout(() => {
      setIsBrowseOpen(false)
    }, 150) // 150ms delay
  }
  
  const handleUserMenuEnter = () => {
    if (userMenuTimeoutRef.current) {
      clearTimeout(userMenuTimeoutRef.current)
      userMenuTimeoutRef.current = null
    }
    setIsUserMenuOpen(true)
  }
  
  const handleUserMenuLeave = () => {
    userMenuTimeoutRef.current = setTimeout(() => {
      setIsUserMenuOpen(false)
    }, 150) // 150ms delay
  }
  
  const handleLogout = () => {
    logoutMutation.mutate()
  }

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (browseTimeoutRef.current) {
        clearTimeout(browseTimeoutRef.current)
      }
      if (userMenuTimeoutRef.current) {
        clearTimeout(userMenuTimeoutRef.current)
      }
    }
  }, [])

  return (
    <nav className="sticky top-0 w-full px-4 md:px-8 py-4 z-50 bg-background backdrop-blur-lg border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-wider text-foreground hover:text-primary transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 ring-offset-background rounded-md"
        >
          AniView
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8 text-foreground">
          {/* Browse Menu */}
          <div
            className="relative"
            ref={browseRef}
            onMouseEnter={handleBrowseMouseEnter}
            onMouseLeave={handleBrowseMouseLeave}
          >
            <button className="flex items-center space-x-1 hover:text-primary transition-colors duration-300 py-2 px-3 rounded-md hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 ring-offset-background">
              <span className="font-medium">Browse</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isBrowseOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isBrowseOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-popover/95 text-popover-foreground backdrop-blur-md border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
                <div className="p-2">
                  <Link
                    href="/anime"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red/20 hover:text-red transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 ring-offset-background"
                  >
                    Anime
                  </Link>

                  <Link
                    href="/manga"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue/20 hover:text-blue transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 ring-offset-background"
                  >
                    Manga
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/genres"
            className="font-medium hover:text-primary transition-colors duration-300 py-2 px-3 rounded-md hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 ring-offset-background"
          >
            Genres
          </Link>

          <Link
            href="/mylist"
            className="font-medium hover:text-primary transition-colors duration-300 py-2 px-3 rounded-md hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 ring-offset-background"
          >
            My List
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="w-8 h-8 bg-muted animate-pulse rounded-full"></div>
          ) : isAuthenticated && user ? (
            /* User Menu */
            <div
              className="relative"
              ref={userMenuRef}
              onMouseEnter={handleUserMenuEnter}
              onMouseLeave={handleUserMenuLeave}
            >
              <button className="flex items-center space-x-2 hover:text-primary transition-colors duration-300 py-2 px-3 rounded-md hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 ring-offset-background">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium hidden sm:block">{user.username}</span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-popover/95 text-popover-foreground backdrop-blur-md border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
                  <div className="p-2">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary/20 hover:text-primary transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 ring-offset-background"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    
                    <Link
                      href="/settings"
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary/20 hover:text-primary transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 ring-offset-background"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    
                    <hr className="my-2 border-border" />
                    
                    <button
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-500/20 hover:text-red-500 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 ring-offset-background disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Auth Buttons for Non-authenticated Users */
            <>
              <Link
                href="/login"
                className="text-foreground hover:text-red transition-colors duration-300 font-medium px-4 py-2 rounded-md hover:bg-red/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 ring-offset-background"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 rounded-lg font-semibold text-primary-foreground bg-primary hover:bg-primary/80 hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 ring-offset-background"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
