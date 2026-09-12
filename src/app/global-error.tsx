"use client";

/**
 * Catches an error thrown by the root layout itself (fonts, providers) —
 * an extreme edge case, but Next.js requires this file to exist with its
 * own <html>/<body> since it replaces the root layout entirely when it
 * fires. Kept minimal and self-contained rather than importing the design
 * system, in case that's what failed.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          background: "#faf8f4",
          color: "#1c1b19",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Something went wrong.</p>
        <p style={{ color: "#6b6660", maxWidth: "28rem", margin: 0 }}>
          Please try again, or return to the homepage.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.625rem 1.25rem",
              borderRadius: "0.375rem",
              background: "#1f3d33",
              color: "#f7faf8",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- deliberately a plain <a>, not <Link>: this page replaces the root layout when the app itself has failed, so it must not depend on Next's router context. */}
          <a
            href="/"
            style={{
              padding: "0.625rem 1.25rem",
              borderRadius: "0.375rem",
              border: "1px solid #cfc7b7",
              color: "#1c1b19",
              textDecoration: "none",
            }}
          >
            Return Home
          </a>
        </div>
      </body>
    </html>
  );
}
