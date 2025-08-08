import { useState, useEffect } from 'react'

const LoadingAnimation = () => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000) // Show loading for 2 seconds

    return () => clearTimeout(timer)
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">
      <div className="text-center">
        {/* Logo Animation */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <span className="text-white font-bold text-3xl">A</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4 animate-fade-in">
            ALBORNOZ OBRAS
          </h2>
          <p className="text-gray-600 animate-fade-in-delay">
            Reformas y Construcción en Seco
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Loading Text */}
        <p className="text-gray-500 mt-4 text-sm animate-pulse">
          Cargando experiencia de 23 años...
        </p>
      </div>
    </div>
  )
}

export default LoadingAnimation

