import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Wrench, Palette, Building, ArrowRight, MessageCircle, Droplets } from 'lucide-react'

const Services = () => {
  const handleWhatsAppClick = () => {
    window.open('https://api.whatsapp.com/send?phone=5491155821120&text=Hola%20AlbornozObras%2C%20quiero%20consultarles%20sobre%20lo%20siguiente', '_blank')
  }

  const services = [
    {
      icon: <Building className="w-10 h-10 lg:w-12 lg:h-12 text-orange-500" />,
      title: "Construcción en Seco",
      description: "Creamos y dividimos espacios con rapidez y limpieza usando Durlock y steel frame.",
      features: ["Instalación rápida", "Sin escombros", "Aislamiento térmico", "Terminaciones perfectas"],
      popular: true
    },
    {
      icon: <Home className="w-10 h-10 lg:w-12 lg:h-12 text-orange-500" />,
      title: "Reformas y Ampliaciones",
      description: "Transformación completa de baños, cocinas y espacios en CABA y Gran Buenos Aires.",
      features: ["Diseño personalizado", "Gestión completa", "Materiales premium", "Entrega puntual"]
    },
    {
      icon: <Palette className="w-10 h-10 lg:w-12 lg:h-12 text-orange-500" />,
      title: "Pintura Profesional",
      description: "Renovamos tus ambientes con terminaciones de primera calidad y acabados duraderos.",
      features: ["Preparación de superficies", "Pinturas de calidad", "Técnicas profesionales", "Garantía de trabajo"]
    },
    {
      icon: <Droplets className="w-10 h-10 lg:w-12 lg:h-12 text-orange-500" />,
      title: "Plomería Garantizada",
      description: "Instalaciones y reparaciones de plomería con garantía y materiales de primera.",
      features: ["Instalaciones nuevas", "Reparaciones urgentes", "Materiales certificados", "Servicio garantizado"]
    }
  ]

  return (
    <section id="servicios" className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Wrench className="w-4 h-4 mr-2" />
            Nuestros Servicios
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Somos la Solución Completa
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Con 23 años de experiencia, manejamos cada detalle de tu proyecto con 
            puntualidad y responsabilidad para que no tengas que preocuparte por nada.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12 lg:mb-16">
          {services.map((service, index) => (
            <Card key={index} className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative ${service.popular ? 'ring-2 ring-orange-500' : ''}`}>
              {service.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Más Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 lg:p-4 bg-orange-50 rounded-full group-hover:bg-orange-100 transition-colors">
                  {service.icon}
                </div>
                <CardTitle className="text-lg lg:text-xl font-bold text-gray-800 mb-2">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm lg:text-base">
                  {service.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm lg:text-base text-gray-600">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={handleWhatsAppClick}
                  variant="ghost" 
                  className="w-full text-orange-500 hover:text-orange-600 hover:bg-orange-50 text-sm lg:text-base"
                >
                  Consultar por WhatsApp
                  <MessageCircle className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section - Mobile Optimized */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 lg:p-8 text-center text-white">
          <h3 className="text-xl lg:text-2xl font-bold mb-2">
            ¿Listo para transformar tu hogar?
          </h3>
          <p className="text-orange-100 mb-6 text-sm lg:text-base">
            Tu proyecto es nuestra prioridad. Pedinos tu presupuesto y empezá a disfrutar del cambio.
          </p>
          
            <div className="space-y-2">
              <Button 
                onClick={handleWhatsAppClick}
                size="lg" 
                className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto"
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                Presupuesto Gratis
              </Button>
              <Button 
                onClick={() => window.open('tel:01155821120', '_self')}
                variant="outline" 
                size="lg"
                className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white w-full sm:w-auto md:hidden"
              >
                Llamar: 011 5582-1120
              </Button>
            </div>
        </div>
      </div>
    </section>
  )
}

export default Services

