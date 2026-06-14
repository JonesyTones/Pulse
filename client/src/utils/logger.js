const isDev = import.meta.env.DEV

const logger = {
  log: (...args) => { if (isDev) console.log('[PULSE]', ...args) },
  warn: (...args) => { if (isDev) console.warn('[PULSE]', ...args) },
  error: (...args) => { if (isDev) console.error('[PULSE]', ...args) },
  info: (...args) => { if (isDev) console.info('[PULSE]', ...args) },
}

export default logger
