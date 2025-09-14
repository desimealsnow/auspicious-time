import { cls } from "@/lib/fmt";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-black/20 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg" />
            <div className="absolute inset-0 h-8 w-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 animate-ping opacity-20" />
          </div>
          <div className="flex items-center gap-2">
            <div className="font-bold text-white text-lg">Auspicious Time</div>
            <span className="text-xs text-yellow-300 bg-yellow-400/20 px-2 py-0.5 rounded-full border border-yellow-400/30">
              ✨ Cosmic Guidance
            </span>
          </div>
        </div>
        <nav className="flex items-center gap-8 text-sm">
          <a
            className={cls(
              "text-white/80 hover:text-yellow-300 transition-colors duration-200 font-medium"
            )}
            href="#about"
          >
            About
          </a>
          <a
            className={cls(
              "text-white/80 hover:text-blue-300 transition-colors duration-200 font-medium"
            )}
            href="#docs"
          >
            Docs
          </a>
          <a
            className="text-pink-300 hover:text-pink-200 transition-colors duration-200 font-medium bg-pink-500/20 px-4 py-2 rounded-full border border-pink-400/30 hover:bg-pink-500/30"
            href="#donate"
          >
            ❤️ Donate
          </a>
        </nav>
      </div>
    </header>
  );
}
