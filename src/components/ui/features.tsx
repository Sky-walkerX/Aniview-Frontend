export const Features = () => {
  const featureCards = [
    {
      title: "Lightning Fast Streaming",
      description:
        "Crystal-clear 4K quality with zero buffering. Our advanced CDN ensures smooth playback worldwide.",
      iconBg: "bg-primary",
      iconColor: "text-primary-foreground",
      hoverBorder: "hover:border-primary/50",
      iconPath: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      ),
    },
    {
      title: "Smart Recommendations",
      description:
        "Discover your next favorite anime with our AI-powered recommendation engine based on your viewing habits.",
      iconBg: "bg-secondary",
      iconColor: "text-secondary-foreground",
      hoverBorder: "hover:border-secondary/50",
      iconPath: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      ),
    },
    {
      title: "Real-time Subtitles",
      description:
        "Professional translations in 20+ languages with perfect timing and customizable styling.",
      iconBg: "bg-blue",
      iconColor: "text-primary-foreground",
      hoverBorder: "hover:border-blue/50",
      iconPath: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
    {
      title: "Personalized Lists",
      description:
        "Track your progress, create custom lists, and get AI-powered recommendations based on your taste.",
      iconBg: "bg-primary",
      iconColor: "text-primary-foreground",
      hoverBorder: "hover:border-primary/50",
      iconPath: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      ),
    },
    {
      title: "Ad-Free Experience",
      description:
        "Enjoy uninterrupted viewing with our premium ad-free experience. No distractions, just pure anime.",
      iconBg: "bg-red",
      iconColor: "text-primary-foreground",
      hoverBorder: "hover:border-red/50",
      iconPath: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      ),
    },
    {
      title: "Massive Library",
      description:
        "10,000+ anime titles from classic series to the latest releases. New episodes added within hours of airing.",
      iconBg: "bg-accent",
      iconColor: "text-accent-foreground",
      hoverBorder: "hover:border-accent/50",
      iconPath: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 000-6h-1m4 6V4a3 3 0 000 6M9 10v8a3 3 0 001.5 2.598L12 22l1.5-1.402A3 3 0 0015 18v-8"
        />
      ),
    },
  ];

  return (
    <>
      {/* Why Choose AniView Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose AniView?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience anime like never before with our cutting-edge features designed for true fans
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCards.map((feature, idx) => (
              <div
                key={idx}
                className={`bg-background p-8 rounded-xl border border-border ${feature.hoverBorder} transition-colors`}
              >
                <div
                  className={`w-12 h-12 ${feature.iconBg} rounded-lg flex items-center justify-center mb-4`}
                >
                  <svg
                    className={`w-6 h-6 ${feature.iconColor}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {feature.iconPath}
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <Stat number="10K+" label="Anime Titles" color="text-primary" />
            <Stat number="2M+" label="Active Users" color="text-secondary" />
            <Stat number="50M+" label="Episodes Watched" color="text-blue" />
            <Stat number="99.9%" label="Uptime" color="text-red" />
          </div>
        </div>
      </section>
    </>
  );
};

const Stat = ({ number, label, color }: { number: string; label: string; color: string }) => (
  <div>
    <div className={`text-4xl font-bold ${color} mb-2`}>{number}</div>
    <div className="text-muted-foreground">{label}</div>
  </div>
);
