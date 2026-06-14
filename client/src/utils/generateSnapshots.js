/**
 * Pre-generates 288 historical mock snapshots on app load.
 * One snapshot per 5 minutes covering the past 24 hours.
 * Each snapshot varies volumes by ±20% to simulate live data history.
 */
const generateSnapshots = (baseTrendData) => {
  const SNAPSHOT_COUNT = 288            // 24h × 60min / 5min
  const INTERVAL_MS = 5 * 60 * 1000    // 5 minutes in ms
  const now = Date.now()

  return Array.from({ length: SNAPSHOT_COUNT }, (_, i) => {
    // i=0 is oldest (24h ago), i=287 is most recent (5min ago)
    const timestamp = new Date(now - (SNAPSHOT_COUNT - i) * INTERVAL_MS).toISOString()

    const data = baseTrendData.map((item) => ({
      ...item,
      // Vary volume ±20% — multiplier between 0.8 and 1.2
      volume: Math.min(100, Math.round(item.volume * (Math.random() * 0.4 + 0.8))),
      timestamp,
    }))

    return { timestamp, data }
  })
}

export default generateSnapshots
