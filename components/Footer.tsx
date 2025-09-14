/**
 * Renders the footer component with branding and support information.
 */
export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/20 bg-black/20 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500" />
              <div className="absolute inset-0 h-6 w-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse opacity-30" />
            </div>
            <div className="flex items-center gap-2">
              <div className="font-bold text-white">Auspicious Time</div>
              <span className="text-xs text-yellow-300 bg-yellow-400/20 px-2 py-0.5 rounded-full border border-yellow-400/30">
                ✨ Cosmic Guidance
              </span>
            </div>
          </div>

          <p className="text-sm text-white/60 text-center leading-relaxed">
            © {new Date().getFullYear()} Auspicious Time • Guidance for cosmic
            alignment
            <br />
            <span className="text-xs text-white/40">
              Not medical or financial advice • For spiritual guidance only
            </span>
          </p>

          <button
            className="group px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-400/30 text-pink-300 hover:text-pink-200 font-medium hover:bg-gradient-to-r hover:from-pink-500/30 hover:to-rose-500/30 transition-all duration-200 transform hover:scale-105"
            onClick={() => window.open("#donate", "_self")}
          >
            <span className="flex items-center gap-2">
              ❤️ Support Our Mission
            </span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-white/40 leading-relaxed">
            Built with ancient wisdom and modern technology • Powered by Swiss
            Ephemeris
            <br />
            <span className="text-white/30">
              Made with ✨ for seekers of perfect timing
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
