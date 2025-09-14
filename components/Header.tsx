import { cls } from "@/lib/fmt";

/**
 * Renders the header component with navigation links and branding.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-brand/90" />
          <div className="font-semibold">Auspicious Time</div>
          <span className="ml-2 text-xs text-slate-500">Cosmic Guidance</span>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <a className={cls("hover:text-brand")} href="#about">
            About
          </a>
          <a className={cls("hover:text-brand")} href="#docs">
            Docs
          </a>
          <a className="text-rose-500 hover:text-rose-600" href="#donate">
            Donate
          </a>
        </nav>
      </div>
    </header>
  );
}
