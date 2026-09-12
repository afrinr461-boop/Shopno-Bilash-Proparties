"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe } from "@/lib/savedProperties";

/** Live-updating list of saved unit ids — re-renders any component using it whenever a save/unsave happens anywhere on the page. */
export function useSavedIds(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsSaved(id: string): boolean {
  return useSavedIds().includes(id);
}
