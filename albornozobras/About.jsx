import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Award, Clock, Shield, MessageCircle, Phone } from 'lucide-react'
import aboutImage from '../assets/Iu6Woe3Jy3jG.jpg'

const About = () => {
  const handleWhatsAppClick = () => {
    window.open('https://api.whatsapp.com/send?phone=5491155821120&text=Hola%20AlbornozObras%2C%20quiero%20consultarles%20sobre%20lo%20siguiente', '_blank')
  }

  const features = [
    {
      icon: <Users className="w-6 h-6 lg:w-8 lg:h-8 text-orange-500" />,
      title: "Equipo Propio",
      description: "Profesionales especializados con más de 23 años de experiencia en el rubro."
    },
    {
      icon: <Award className="w-6 h-6 lg:w-8 lg:h-8 text-orange-500" />,
      title: "Materiales de Primera",
      description: "Utilizamos materiales de primera calidad para garantizar durabilidad y acabados perfectos."
    },
    {
      icon: <Clock className="w-6 h-6 lg:w-8 lg:h-8 text-orange-500" />,
      title: "Puntualidad Garantizada",
      description: "Nos movemos con puntualidad y responsabilidad en cada proyecto que emprendemos."
    },
    {
      icon: <Shield className="w-6 h-6 lg:w-8 lg:h-8 text-orange-500" />,
      title: "Trabajo Garantizado",
      description: "Todos nuestros trabajos cuentan con garantía y respaldo de nuestra experiencia."
    }
  ]

  return (
    <section id="nosotros" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1 space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                <Award className="w-4 h-4 mr-2" />
                Sobre Nosotros
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
                23 años transformando
                <span className="text-orange-500 block">hogares en Buenos Aires</span>
              </h2>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
                En <strong>Albornoz Obras</strong>, somos especialistas en construcción en seco y reformas integrales 
                en CABA y Gran Buenos Aires. Nuestro equipo maneja cada detalle con profesionalismo, 
                desde la construcción en seco hasta pintura y plomería.
              </p>
              
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Nos movemos con puntualidad y responsabilidad para que no tengas que preocuparte por nada. 
                Tu proyecto es nuestra prioridad.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-start space-x-3 lg:space-x-4">
                      <div className="flex-shrink-0 p-2 lg:p-3 bg-orange-50 rounded-lg">
                        {feature.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-1 lg:mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA Buttons - Mobile Optimized */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <Button 
                  onClick={handleWhatsAppClick}
                  size="lg" 
                  className="bg-green-500 hover:bg-green-600 text-white text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 w-full sm:w-auto"
                >
                  <MessageCircle className="mr-2 w-5 h-5" />
                  Consultar por WhatsApp
                </Button>
                <Button 
                  onClick={() => window.open('tel:01155821120', '_self')}
                  variant="outline" 
                  size="lg"
                  className="text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 border-orange-500 text-orange-500 hover:bg-orange-50 w-full sm:w-auto"
                >
                  <Phone className="mr-2 w-5 h-5" />
                  Llamar Ahora
                </Button>
              </div>
              
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-600">
                  📍 Trabajamos en CABA y Gran Buenos Aires
                </p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative z-10">
              <img 
                src={aboutImage} 
                alt="Equipo de Albornoz Obras trabajando" 
                className="rounded-2xl shadow-2xl w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-full h-full bg-orange-200 rounded-2xl -z-10"></div>
            
            {/* Stats overlay - Mobile Optimized */}
            <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-4 sm:gap-6 text-center">
                <div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-500">23+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Años</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-500">500+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Proyectos</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button 
                  onClick={handleWhatsAppClick}
                  size="sm" 
                  className="bg-green-500 hover:bg-green-600 text-white w-full text-xs sm:text-sm"
                >
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Presupuesto Gratis
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About

