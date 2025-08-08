import { Button } from '@/components/ui/button'
import { Facebook, Instagram, Twitter, Linkedin, Phone, Mail, MapPin, ArrowUp, MessageCircle } from 'lucide-react'

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleWhatsAppClick = () => {
    window.open('https://api.whatsapp.com/send?phone=5491155821120&text=Hola%20AlbornozObras%2C%20quiero%20consultarles%20sobre%20lo%20siguiente', '_blank')
  }

  const services = [
    "Construcción en Seco",
    "Reformas Integrales", 
    "Pintura Profesional",
    "Plomería Garantizada",
    "Ampliaciones",
    "Durlock y Steel Frame"
  ]

  const quickLinks = [
    "Inicio",
    "Servicios",
    "Proyectos", 
    "Nosotros",
    "Contacto"
  ]

  const areas = [
    "CABA",
    "Zona Norte",
    "Zona Oeste",
    "Zona Sur",
    "Gran Buenos Aires"
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company info */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">ALBORNOZ OBRAS</h3>
                <p className="text-sm text-gray-400">Reformas y Construcción</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm lg:text-base leading-relaxed">
              Con 23 años de experiencia, somos especialistas en construcción en seco, 
              reformas integrales, pintura y plomería en CABA y Gran Buenos Aires.
            </p>
            
            {/* Quick Contact Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleWhatsAppClick}
                size="sm" 
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              {/* Call button - only visible on mobile */}
              <Button 
                onClick={() => window.open('tel:01155821120', '_self')}
                size="sm" 
                variant="outline" 
                className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white md:hidden"
              >
                <Phone className="w-4 h-4 mr-2" />
                Llamar
              </Button>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Nuestros Servicios</h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <a 
                    href="#servicios" 
                    className="text-gray-300 hover:text-orange-500 transition-colors text-sm lg:text-base"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas de Trabajo */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Zonas de Trabajo</h4>
            <ul className="space-y-3">
              {areas.map((area, index) => (
                <li key={index}>
                  <span className="text-gray-300 text-sm lg:text-base">
                    {area}
                  </span>
                </li>
              ))}
            </ul>
            
            <div className="pt-4">
              <h5 className="font-medium mb-2">Enlaces Rápidos</h5>
              <ul className="space-y-2">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={`#${link.toLowerCase().replace(' ', '')}`}
                      className="text-gray-300 hover:text-orange-500 transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Contacto</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm lg:text-base font-medium">011 5582-1120</p>
                  <p className="text-xs text-gray-400">Lun - Vie: 8:00 - 18:00</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MessageCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm lg:text-base font-medium">WhatsApp</p>
                  <p className="text-xs text-gray-400">Respuesta inmediata</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm lg:text-base">Av. S. Martín 3166</p>
                  <p className="text-xs text-gray-400">CABA, Buenos Aires</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="space-y-3 pt-4 border-t border-gray-800">
              <h5 className="font-medium">¿Necesitás una reforma?</h5>
              <p className="text-sm text-gray-400">
                Contactanos para tu presupuesto gratuito
              </p>
              <Button 
                onClick={handleWhatsAppClick}
                size="sm" 
                className="bg-green-500 hover:bg-green-600 w-full"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Consultar por WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-400">
                © 2024 Albornoz Obras. Todos los derechos reservados.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                23 años transformando hogares en Buenos Aires
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2">
                <a href="#" className="text-xs text-gray-400 hover:text-orange-500 transition-colors">
                  Política de Privacidad
                </a>
                <a href="#" className="text-xs text-gray-400 hover:text-orange-500 transition-colors">
                  Términos de Servicio
                </a>
                <a href="#" className="text-xs text-gray-400 hover:text-orange-500 transition-colors">
                  Cookies
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleWhatsAppClick}
                size="sm" 
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              
              <Button 
                onClick={scrollToTop}
                size="sm" 
                variant="ghost" 
                className="p-2 hover:bg-gray-800 group"
              >
                <ArrowUp className="w-5 h-5 group-hover:text-orange-500 transition-colors" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

