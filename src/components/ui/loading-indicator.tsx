import { Loader2 } from "lucide-react"

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function LoadingIndicator({ 
  size = "md", 
  text = "Loading...", 
  className = "" 
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && (
        <span className="text-muted-foreground text-sm">{text}</span>
      )}
    </div>
  )
}
