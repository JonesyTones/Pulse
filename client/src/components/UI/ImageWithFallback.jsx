import { useState } from 'react'

const ImageWithFallback = ({ src, alt, fallback = null, ...props }) => {
  const [errored, setErrored] = useState(false)

  if (errored) return fallback
  return <img src={src} alt={alt} onError={() => setErrored(true)} {...props} />
}

export default ImageWithFallback
