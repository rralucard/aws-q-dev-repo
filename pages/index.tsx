import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'

const Home: NextPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Interactive Mouse Effects</title>
        <meta name="description" content="Interactive mouse effects with Next.js and TailwindCSS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-grow flex flex-col p-8 lg:p-24">
        <h1 className="text-5xl font-bold mb-8 text-center">
          Interactive <span className="text-blue-400">Mouse</span> Effects
        </h1>
        
        <p className="text-center text-lg mb-16 max-w-2xl mx-auto">
          Move your cursor around to see the custom cursor follow. Hover over the interactive elements below to see different effects.
        </p>

        {/* Interactive Card Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Interactive Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div 
                key={item}
                className="hoverable bg-gray-800 rounded-lg p-6 shadow-lg transform transition-all duration-300 hover:scale-105"
              >
                <h3 className="text-xl font-bold mb-4">Card {item}</h3>
                <p className="text-gray-300">
                  This is an interactive card that responds to your mouse movements. 
                  Hover over it to see the cursor change.
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Button Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Interactive Buttons</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="hoverable bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300">
              Hover Me
            </button>
            <button className="hoverable bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300">
              Click Me
            </button>
            <button className="hoverable bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300">
              Try Me
            </button>
          </div>
        </section>

        {/* Interactive Text Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Interactive Text</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="hoverable text-lg leading-relaxed">
                This paragraph has the <span className="text-yellow-300 font-bold">hoverable</span> class, so the cursor changes when you hover over it. This demonstrates how the custom cursor can work with text elements too.
              </p>
            </div>
            <div>
              <p className="text-lg leading-relaxed">
                This regular paragraph doesn't have the <span className="text-red-300 font-bold">hoverable</span> class, so the custom cursor doesn't change when you hover over it.
              </p>
            </div>
          </div>
        </section>

        {/* Mouse Position Display */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Mouse Position</h2>
          <div className="bg-gray-800 p-6 rounded-lg max-w-md mx-auto">
            <p className="text-center">
              Your mouse is at position: 
              <span className="font-mono ml-2 text-green-400">
                X: {mousePosition.x}, Y: {mousePosition.y}
              </span>
            </p>
          </div>
        </section>
      </main>

      <footer className="p-6 border-t border-gray-700">
        <p className="text-center text-gray-400">
          Built with Next.js, React, and Tailwind CSS
        </p>
      </footer>
    </div>
  )
}

export default Home