/**
 * Minimal stub for the Antigravity browser integration.
 *
 * This file is only used when the project is built/run outside of the
 * Antigravity IDE. It provides a very simple implementation that opens
 * the requested URL in a new browser tab.
 *
 * When running inside the real Antigravity environment, the actual
 * `@antigravity/browser` package will be injected, and this stub will be
 * ignored.
 */

export interface AntigravityOptions {
    /** Whether to run the browser head‑less. Ignored in the stub. */
    headless?: boolean;
}

/**
 * Simple Antigravity class with a `launch` method.
 */
export class Antigravity {
    constructor(_options: AntigravityOptions = {}) {
        // No‑op – the stub does not need any configuration.
    }

    /**
     * Launches a URL in a new tab/window.
     *
     * @param param0 Object containing the `url` to open.
     */
    async launch({ url }: { url: string }): Promise<void> {
        // `window.open` works in the browser; in a Node environment it will be a no‑op.
        if (typeof window !== "undefined" && typeof window.open === "function") {
            window.open(url, "_blank");
        } else {
            // Fallback for non‑browser environments (e.g., during SSR tests)
            console.warn("Antigravity stub: cannot open URL because `window` is undefined.");
        }
    }
}
