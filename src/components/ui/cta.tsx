"use client"

import Link from "next/link"
import { useIsAuthenticated } from "@/hooks/use-auth"

export const CTA = () => {
  const { isAuthenticated, isLoading } = useIsAuthenticated()

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 text-center">
        {!isLoading && !isAuthenticated ? (
          <>
            <h2 className="text-4xl font-bold text-primary mb-4">Start Your Anime Journey</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of anime fans and discover your next favorite series with crystal-clear streaming and real-time subtitles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-sm mx-auto">
              <Link
                href="/signup"
                className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 ring-offset-background"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 ring-offset-background"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-4xl font-bold text-primary mb-4">Stay Updated</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get notified about new anime releases, exclusive content, and special
              features before anyone else.
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary ring-offset-2 ring-offset-background"
              />
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 ring-offset-background">
                Subscribe
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
