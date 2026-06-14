const TREND_MAX_AGE_MS = 65_000

const store = new Map()

const cache = {
  get: (key) => store.get(key) ?? null,

  set: (key, data) => {
    store.set(key, { data, timestamp: new Date().toISOString() })
  },

  // Alias kept for backwards compatibility with existing route code
  getWithMeta: (key) => store.get(key) ?? null,

  clear: (key) => {
    if (key) store.delete(key)
    else store.clear()
  },

  isStale: (key, maxAgeMs = TREND_MAX_AGE_MS) => {
    const entry = store.get(key)
    if (!entry) return true
    return Date.now() - new Date(entry.timestamp).getTime() > maxAgeMs
  },
}

export default cache
