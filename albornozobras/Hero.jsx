import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, Phone, MessageCircle, Clock, Award } from 'lucide-react'
import heroImage from '../assets/waErpcAbKXwU.jpg'

const Hero = () => {
  const handleWhatsAppClick = () => {
    window.open('https://api.whatsapp.com/send?phone=5491155821120&text=Hola%20AlbornozObras%2C%20quiero%20consultarles%20sobre%20lo%20siguiente', '_blank')
  }

  const handleCallClick = () => {
    window.open('tel:01155821120', '_self')
  }

  return (
    <section id="inicio" className="bg-gradient-to-br from-orange-50 to-orange-100 py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                <Award className="w-4 h-4 mr-2" />
                23 años de experiencia
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                <span className="text-orange-500 block">ALBORNOZ OBRAS</span>
                Reformas y Construcción en Seco
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                En Albornoz Obras, somos la solución. Con 23 años de experiencia, nos especializamos en 
                reformas, ampliaciones y construcción en seco en CABA y Gran Buenos Aires.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 lg:gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                <span className="text-gray-700 text-sm lg:text-base">Construcción en Seco</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                <span className="text-gray-700 text-sm lg:text-base">Pintura Profesional</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                <span className="text-gray-700 text-sm lg:text-base">Plomería Garantizada</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                <span className="text-gray-700 text-sm lg:text-base">Materiales de Primera</span>
              </div>
            </div>

            {/* CTA Buttons - Mobile Optimized */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <Button 
                  onClick={handleWhatsAppClick}
                  size="lg" 
                  className="bg-green-500 hover:bg-green-600 text-white text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 w-full sm:w-auto flex-1 sm:flex-none"
                >
                  <MessageCircle className="mr-2 w-5 h-5" />
                  Consultar por WhatsApp
                </Button>
                {/* Call button - only visible on mobile */}
                <Button 
                  onClick={handleCallClick}
                  size="lg" 
                  className="bg-orange-500 hover:bg-orange-600 text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 w-full sm:w-auto md:hidden"
                >
                  <Phone className="mr-2 w-5 h-5" />
                  Llamar Ahora
                </Button>
              </div>
              
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>Presupuesto gratuito en menos de 24 horas</span>
              </div>
            </div>

            {/* Stats - Mobile Optimized */}
            <div className="grid grid-cols-3 gap-4 lg:gap-8 pt-6 lg:pt-8 border-t border-orange-200">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-orange-500">23+</div>
                <div className="text-xs lg:text-sm text-gray-600">Años de Experiencia</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-orange-500">200+</div>
                <div className="text-xs lg:text-sm text-gray-600">Proyectos Completados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-orange-500">24h</div>
                <div className="text-xs lg:text-sm text-gray-600">Presupuesto Gratis</div>
              </div>
            </div>
          </div>

          {/* Image Section - Mobile Optimized */}
          <div className="relative order-first lg:order-last">
            <div className="relative z-10">
              <img 
                src={heroImage} 
                alt="Reforma integral moderna - Albornoz Obras" 
                className="rounded-2xl shadow-2xl w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-full h-full bg-orange-200 rounded-2xl -z-10"></div>
            <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 w-full h-full bg-orange-300 rounded-2xl -z-20"></div>
            
            {/* Floating CTA Card - Mobile Optimized */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-auto sm:w-64 bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-gray-800 text-sm sm:text-base mb-2">
                  ¿Necesitas una reforma?
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  Presupuesto 100% gratuito
                </p>
                <Button 
                  onClick={handleWhatsAppClick}
                  size="sm" 
                  className="bg-green-500 hover:bg-green-600 text-white w-full text-xs sm:text-sm"
                >
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Consultar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

