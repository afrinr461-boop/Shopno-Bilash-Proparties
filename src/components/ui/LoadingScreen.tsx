/**
 * The global branded loading state (brief: logo + thin progress line, not a
 * spinner or a blank screen) — shown by Next.js only for as long as a route
 * segment actually takes to stream in, never held open artificially.
 */
export function LoadingScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6" role="status" aria-label="Loading">
      <p className="text-h4 text-fg tracking-tight">Shopno Bilash</p>
      <div className="bg-border relative h-px w-32 overflow-hidden">
        <span className="loading-bar bg-accent absolute inset-y-0 left-0 w-1/3" />
      </div>
    </div>
  );
}
