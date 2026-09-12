/**
 * A one-shot signal from <SitePageLoader> to <PageTransition>: when
 * the branded overlay ceremony handles a navigation, its own wipe already
 * *is* the destination's reveal moment. Letting <PageTransition>'s
 * independent `page-enter` fade also play right after was the real bug
 * reported here — the page visibly settling a second time, reading as a
 * flash/re-appearance rather than one continuous movement. Not React state
 * on purpose: this is a plain one-shot flag consumed synchronously during
 * the next render, not something that should itself trigger a re-render.
 */
let skipNextEntrance = false;

export function markCeremonyHandledNextEntrance() {
  skipNextEntrance = true;
}

export function consumeSkipNextEntrance(): boolean {
  if (skipNextEntrance) {
    skipNextEntrance = false;
    return true;
  }
  return false;
}
