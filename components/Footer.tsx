export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-slate-50/80">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-brand/90" />
            <div className="font-semibold">Auspicious Time</div>
            <span className="ml-2 text-xs text-slate-500">Cosmic Guidance</span>
          </div>

          <p className="text-sm text-slate-500 text-center">
            © {new Date().getFullYear()} Auspicious Time • Not medical/financial
            advice
          </p>

          <button
            className="px-4 py-2 rounded-lg border text-rose-600 border-rose-200 hover:bg-rose-50 text-sm font-medium"
            onClick={() => window.open("#donate", "_self")}
          >
            ❤️ Donate
          </button>
        </div>
      </div>
    </footer>
  );
}
