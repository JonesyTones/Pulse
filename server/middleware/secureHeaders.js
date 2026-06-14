import helmet from 'helmet'

export const applySecureHeaders = (app) => {
  app.use(helmet())
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https://*.carto.com'],
        connectSrc: ["'self'"],
      },
    })
  )
}
