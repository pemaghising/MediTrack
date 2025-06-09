interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-1/2 h-1/2"
        >
          {/* Medical cross */}
          <path d="M12 2v20M2 12h20" />
          {/* Pill shape overlay */}
          <rect x="8" y="8" width="8" height="8" rx="4" fill="white" fillOpacity="0.2" />
        </svg>
      </div>

      {/* App Name */}
      {showText && <span className={`font-bold text-blue-600 ${textSizeClasses[size]}`}>MediTrack</span>}
    </div>
  )
}
