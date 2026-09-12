import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Our custom typography utilities (globals.css) are all named `text-*`,
// which tailwind-merge's default config otherwise misreads as text-color
// utilities — silently dropping the typography class whenever it's
// combined with a real color class (e.g. `cn("text-display-xl", "text-white")`
// resolved to just `text-white`, discarding the size/weight/line-height).
// Registering them under the built-in "font-size" group fixes that while
// keeping correct conflict resolution both within this set and against
// real Tailwind text-size utilities.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-display-xl",
        "text-display-l",
        "text-display-m",
        "text-h1",
        "text-h2",
        "text-h3",
        "text-h4",
        "text-body-lg",
        "text-body",
        "text-body-sm",
        "text-caption",
        "text-label",
        "text-button",
        "text-nav",
        "text-numeric",
        "text-stat-lg",
        "text-stat-xl",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
