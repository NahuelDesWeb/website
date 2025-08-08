import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Phone, MessageCircle } from 'lucide-react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleWhatsAppClick = () => {
    window.open('https://api.whatsapp.com/send?phone=5491155821120&text=Hola%20AlbornozObras%2C%20quiero%20consultarles%20sobre%20lo%20siguiente', '_blank')
  }

  const handleCallClick = () => {
    window.open('tel:01155821120', '_self')
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMenuOpen(false)
    }
  }

  const navItems = [
    { name: 'Inicio', id: 'inicio' },
    { name: 'Servicios', id: 'servicios' },
    { name: 'Proyectos', id: 'proyectos' },
    { name: 'Nosotros', id: 'nosotros' },
    { name: 'Contacto', id: 'contacto' }
  ]

  return (
    <>
      {/* Top contact bar */}
      <div className="bg-orange-500 text-white py-2 px-4 text-sm">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center space-y-1 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <a href="tel:01155821120" className="flex items-center space-x-1 hover:text-orange-100 transition-colors">
              <Phone className="w-4 h-4" />
              <span>011 5582-1120</span>
            </a>
            <a href="mailto:info@albornozobras.com" className="hidden sm:flex items-center space-x-1 hover:text-orange-100 transition-colors">
              <span>info@albornozobras.com</span>
            </a>
          </div>
          <div className="text-center sm:text-right">
            <span className="font-medium">23 años transformando hogares en Buenos Aires</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl lg:text-2xl">A</span>
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-gray-800">ALBORNOZ OBRAS</h1>
                <p className="text-xs lg:text-sm text-gray-600">Reformas y Construcción en Seco</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-gray-700 hover:text-orange-500 font-medium transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
                </button>
              ))}
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              <Button 
                onClick={handleWhatsAppClick}
                size="sm" 
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              {/* Call button - only visible on mobile, hidden on desktop */}
              <Button 
                onClick={handleCallClick}
                size="sm" 
                className="bg-orange-500 hover:bg-orange-600 text-white md:hidden"
              >
                <Phone className="w-4 h-4 mr-2" />
                Llamar
              </Button>
            </div>

            {/* Mobile CTA Buttons */}
            <div className="flex lg:hidden items-center space-x-2">
              <Button 
                onClick={handleWhatsAppClick}
                size="sm" 
                className="bg-green-500 hover:bg-green-600 text-white px-3"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
              {/* Call button - visible on mobile */}
              <Button 
                onClick={handleCallClick}
                size="sm" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-3"
              >
                <Phone className="w-4 h-4" />
              </Button>
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <nav className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-left py-2 px-3 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                  >
                    {item.name}
                  </button>
                ))}
                
                {/* Mobile CTA Section */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <Button 
                    onClick={handleWhatsAppClick}
                    className="bg-green-500 hover:bg-green-600 text-white w-full"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Consultar por WhatsApp
                  </Button>
                  <Button 
                    onClick={handleCallClick}
                    className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Llamar: 011 5582-1120
                  </Button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}

export default Header

