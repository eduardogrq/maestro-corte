/**
 * Cookie name only — no state, no crypto.
 *
 * Lives in its own module because `proxy.ts` needs it too, and the docs warn
 * that Proxy runs separately from render code and must not rely on shared
 * modules with runtime state. A constant is safe to share; the session module
 * (which imports `server-only`) is not.
 */
export const SESSION_COOKIE_NAME = "mc_session"
