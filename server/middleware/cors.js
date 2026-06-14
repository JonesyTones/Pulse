import cors from 'cors'

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true)
    // In development allow any localhost port; in production enforce ALLOWED_ORIGIN
    const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin)
    if (isLocalhost && process.env.NODE_ENV !== 'production') return callback(null, true)
    if (origin === process.env.ALLOWED_ORIGIN) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}

export default cors(corsOptions)
