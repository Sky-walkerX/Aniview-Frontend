"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Mail, AlertCircle, Loader2 } from "lucide-react"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { Input } from "@/components/ui/input"
import { useLogin } from "@/hooks/use-auth"
import { type LoginRequest } from "@/lib/auth"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginRequest>()

  const onSubmit = async (data: LoginRequest) => {
    try {
      await loginMutation.mutateAsync(data)
    } catch (error: unknown) {
      const authError = error as { field?: string; message?: string }
      if (authError.field) {
        setError(authError.field as keyof LoginRequest, {
          type: "server",
          message: authError.message || "An error occurred",
        })
      } else {
        setError("root", {
          type: "server",
          message: authError.message || "Login failed. Please try again.",
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">
                Sign in to continue watching your favorite anime
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <Input
                  type="email"
                  label="Email"
                  placeholder="Enter your email"
                  error={errors.email?.message}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                <Mail className="absolute right-3 top-9 h-5 w-5 text-muted-foreground" />
              </div>

              {/* Password Field */}
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {/* Server Error */}
              {errors.root && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-500">{errors.root.message}</p>
                </div>
              )}

              {/* Password Requirements Help */}
              {errors.root?.message?.includes("Invalid") && (
                <div className="text-xs text-muted-foreground p-3 bg-muted/20 rounded-lg">
                  <p className="font-medium mb-1">Password Requirements:</p>
                  <ul className="space-y-1">
                    <li>• At least 6 characters</li>
                    <li>• One lowercase letter</li>
                    <li>• One uppercase letter</li>
                    <li>• One digit</li>
                    <li>• One special character</li>
                  </ul>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || loginMutation.isPending}
                className="w-full bg-primary text-primary-foreground rounded-lg py-3 px-4 font-medium transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(isSubmitting || loginMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {(isSubmitting || loginMutation.isPending) ? "Signing in..." : "Sign In"}
              </button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-border"></div>
              <span className="px-4 text-sm text-muted-foreground">or</span>
              <div className="flex-1 border-t border-border"></div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link 
                  href="/signup" 
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
