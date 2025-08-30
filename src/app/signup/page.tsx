"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { Input } from "@/components/ui/input"
import { useRegister } from "@/hooks/use-auth"
import { type RegisterRequest } from "@/lib/auth"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const registerMutation = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<RegisterRequest>()

  const password = watch("password")

  const onSubmit = async (data: RegisterRequest) => {
    try {
      await registerMutation.mutateAsync(data)
    } catch (error: any) {
      if (error.field) {
        setError(error.field as keyof RegisterRequest, {
          type: "server",
          message: error.message,
        })
      } else {
        setError("root", {
          type: "server",
          message: error.message || "Registration failed. Please try again.",
        })
      }
    }
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "" }
    
    let strength = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    strength = Object.values(checks).filter(Boolean).length
    
    const labels = ["", "Very Weak", "Weak", "Fair", "Good", "Strong"]
    const colors = ["", "text-red-500", "text-orange-500", "text-yellow-500", "text-blue-500", "text-green-500"]
    
    return { 
      strength, 
      label: labels[strength], 
      color: colors[strength],
      checks 
    }
  }

  const passwordStrength = getPasswordStrength(password || "")

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
              <p className="text-muted-foreground">
                Join AniView and start your anime journey
              </p>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Username Field */}
              <div className="relative">
                <Input
                  type="text"
                  label="Username"
                  placeholder="Choose a username"
                  error={errors.username?.message}
                  {...register("username", {
                    required: "Username is required",
                    minLength: {
                      value: 3,
                      message: "Username must be at least 3 characters",
                    },
                    maxLength: {
                      value: 50,
                      message: "Username must be less than 50 characters",
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: "Username can only contain letters, numbers, and underscores",
                    },
                  })}
                />
                <User className="absolute right-3 top-9 h-5 w-5 text-muted-foreground" />
              </div>

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
                  placeholder="Create a password"
                  error={errors.password?.message}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                    validate: {
                      hasUppercase: value => 
                        /[A-Z]/.test(value) || "Password must contain at least one uppercase letter",
                      hasLowercase: value => 
                        /[a-z]/.test(value) || "Password must contain at least one lowercase letter",
                      hasDigit: value => 
                        /\d/.test(value) || "Password must contain at least one digit",
                      hasSpecialChar: value => 
                        /[!@#$%^&*(),.?":{}|<>]/.test(value) || "Password must contain at least one special character",
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
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.strength >= 1 ? 'bg-red-500' : ''
                          } ${
                            passwordStrength.strength >= 2 ? 'bg-orange-500' : ''
                          } ${
                            passwordStrength.strength >= 3 ? 'bg-yellow-500' : ''
                          } ${
                            passwordStrength.strength >= 4 ? 'bg-blue-500' : ''
                          } ${
                            passwordStrength.strength >= 5 ? 'bg-green-500' : ''
                          }`}
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className={`flex items-center gap-1 ${passwordStrength.checks?.length ? 'text-green-500' : 'text-muted-foreground'}`}>
                        <CheckCircle className="h-3 w-3" />
                        8+ characters
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.checks?.uppercase ? 'text-green-500' : 'text-muted-foreground'}`}>
                        <CheckCircle className="h-3 w-3" />
                        Uppercase
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.checks?.lowercase ? 'text-green-500' : 'text-muted-foreground'}`}>
                        <CheckCircle className="h-3 w-3" />
                        Lowercase
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.checks?.number ? 'text-green-500' : 'text-muted-foreground'}`}>
                        <CheckCircle className="h-3 w-3" />
                        Number
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {/* Server Error */}
              {errors.root && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-500">{errors.root.message}</p>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="text-sm text-muted-foreground">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors">
                  Privacy Policy
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || registerMutation.isPending}
                className="w-full bg-primary text-primary-foreground rounded-lg py-3 px-4 font-medium transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(isSubmitting || registerMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {(isSubmitting || registerMutation.isPending) ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-border"></div>
              <span className="px-4 text-sm text-muted-foreground">or</span>
              <div className="flex-1 border-t border-border"></div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link 
                  href="/login" 
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Sign in
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
