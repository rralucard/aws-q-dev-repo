import '../styles/globals.css'
import type { AppProps } from 'next/app'
import MouseFollower from '../components/MouseFollower'
import { useEffect, useState } from 'react'

function MyApp({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false)

  // Only render MouseFollower on client side to avoid hydration errors
  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <>
      <Component {...pageProps} />
      {isClient && <MouseFollower />}
    </>
  )
}

export default MyApp