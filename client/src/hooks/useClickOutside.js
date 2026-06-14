import { useEffect } from 'react'

/**
 * Fires callback when a click or touch occurs outside the ref'd element.
 * A short delay before attaching the listener prevents the opening click
 * from immediately triggering the outside-click handler.
 * @param {React.RefObject} ref
 * @param {() => void} callback
 */
const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback()
      }
    }

    // Defer listener registration so the click that opened the panel
    // has fully propagated before we start listening for outside clicks.
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handler)
      document.addEventListener('touchstart', handler)
    }, 10)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [ref, callback])
}

export default useClickOutside
