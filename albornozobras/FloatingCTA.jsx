import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, Phone, X } from 'lucide-react'

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 3000) // Show after 3 seconds

    return () => clearTimeout(timer)
  }, [])

  const handleWhatsAppClick = () => {
    window.open('https://api.whatsapp.com/send?phone=5491155821120&text=Hola%20AlbornozObras%2C%20quiero%20consultarles%20sobre%20lo%20siguiente', '_blank')
  }

  const handleCallClick = () => {
    window.open('tel:01155821120', '_self')
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      {/* Expanded CTA Card */}
      {isExpanded && (
        <div className="bg-white rounded-xl shadow-2xl p-4 max-w-xs animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-gray-800 text-sm">¿Necesitás una reforma o construcción en seco?</h3>
              <p className="text-xs text-gray-600 mt-1">Conseguí tu presupuesto gratuito en menos de 24 horas.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleWhatsAppClick}
              size="sm" 
              className="bg-green-500 hover:bg-green-600 text-white w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Consultar por WhatsApp
            </Button>
            {/* Call button - only visible on mobile */}
            <Button 
              onClick={handleCallClick}
              size="sm" 
              className="bg-orange-500 hover:bg-orange-600 text-white w-full md:hidden"
            >
              <Phone className="w-4 h-4 mr-2" />
              Llamar: 011 5582-1120
            </Button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <div className="relative">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 shadow-2xl animate-bounce"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
        
        {/* Notification badge */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      </div>
    </div>
  )
}

export default FloatingCTA

