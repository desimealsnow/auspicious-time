/**
 * Renders the Hero section with a cosmic theme and enhanced glassmorphism.
 */
export default function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-16 pb-12 text-center relative">
      {/* Hero Card with Enhanced Glassmorphism */}
      <div className="mx-auto max-w-4xl backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
        {/* Background Glow Effect */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/30 to-pink-500/30 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Main Title with Enhanced Typography */}
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-[1px] bg-gradient-to-r from-transparent to-yellow-400/50"></div>
              <span className="mx-4 text-yellow-300 text-sm font-medium tracking-widest uppercase">
                ✨ Cosmic Guidance ✨
              </span>
              <div className="w-20 h-[1px] bg-gradient-to-l from-transparent to-yellow-400/50"></div>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent leading-tight mb-4">
              Find Your Perfect
            </h1>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif bg-gradient-to-r from-purple-200 via-blue-200 to-teal-200 bg-clip-text text-transparent leading-tight">
              Moment
            </h2>
          </div>

          {/* Enhanced Description */}
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8 font-light">
            Discover the most auspicious times for your important activities
            using ancient
            <span className="text-yellow-300 font-medium">
              {" "}
              Vedic wisdom
            </span>{" "}
            combined with modern
            <span className="text-blue-300 font-medium"> precision</span>. Let
            the cosmos guide your most important decisions.
          </p>

          {/* Enhanced Feature Pills */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <div className="group flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"></span>
              <span className="text-white/90 font-medium">
                Vedic Calculations
              </span>
            </div>
            <div className="group flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 animate-pulse"></span>
              <span className="text-white/90 font-medium">
                Personalized Results
              </span>
            </div>
            <div className="group flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-teal-400 animate-pulse"></span>
              <span className="text-white/90 font-medium">Precise Timing</span>
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-bounce mr-3"></div>
            <span className="text-white/70 text-sm font-medium">
              Scroll down to begin your cosmic journey
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
