// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

/**
 * The Midnight SDK is WASM-backed and browser-only. Its packages don't publish
 * `workerd`/`worker` export conditions, so bundling them for the server (SSR /
 * Cloudflare worker) build fails at resolve time. They are only ever loaded
 * behind dynamic `import()` from browser code paths, so we swap them for an
 * inert stub in server builds. The client build keeps the real packages.
 */
const MIDNIGHT_PREFIX = "@midnight-ntwrk/";
const STUB_ID = "\0midnight-browser-only-stub";

function midnightServerStub(): Plugin {
  return {
    name: "midnight-browser-only-stub",
    enforce: "pre",
    resolveId(source, _importer, options) {
      if (options?.ssr && source.startsWith(MIDNIGHT_PREFIX)) return STUB_ID;
      if (source === STUB_ID) return STUB_ID;
      return null;
    },
    load(id) {
      if (id !== STUB_ID) return null;
      return `const err = () => { throw new Error("Midnight SDK is browser-only and cannot run on the server."); };
export default new Proxy({}, { get: err });
export const __midnightBrowserOnly = true;`;
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [midnightServerStub()],
  },
});
