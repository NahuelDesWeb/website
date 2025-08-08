import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Navigation, Phone, MessageCircle } from 'lucide-react'

const Map = () => {
  const address = "Av. S. Martín 3166, C1416 Cdad. Autónoma de Buenos Aires"
  const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(address)}`
  const directionsUrl = `https://www.google.com/maps/dir//${encodeURIComponent(address)}`
  
  const handleWhatsAppClick = () => {
    window.open('https://api.whatsapp.com/send?phone=5491155821120&text=Hola%20AlbornozObras%2C%20quiero%20consultarles%20sobre%20lo%20siguiente', '_blank')
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <MapPin className="w-4 h-4 mr-2" />
            Nuestra Ubicación
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Visitanos en Buenos Aires
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            Estamos ubicados en el corazón de Buenos Aires, trabajando en CABA y Gran Buenos Aires.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Map Embed */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-lg">
              <CardContent className="p-0">
                <div className="relative w-full h-64 sm:h-80 lg:h-96">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWTgaQzuU17R8&q=${encodeURIComponent(address)}&zoom=16`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación de Albornoz Obras"
                    className="w-full h-full"
                  />
                  
                  {/* Fallback for when iframe doesn't load */}
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <div className="text-center p-8">
                      <MapPin className="w-16 h-16 mx-auto mb-4 text-orange-500" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Albornoz Obras
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {address}
                      </p>
                      <Button 
                        onClick={() => window.open(googleMapsUrl, '_blank')}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        Ver en Google Maps
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location Info */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="flex-shrink-0 p-3 bg-orange-50 rounded-lg">
                    <MapPin className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Dirección
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {address}
                    </p>
                    <div className="space-y-2">
                      <Button 
                        onClick={() => window.open(directionsUrl, '_blank')}
                        size="sm" 
                        className="w-full bg-blue-500 hover:bg-blue-600"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Cómo Llegar
                      </Button>
                      <Button 
                        onClick={() => window.open(googleMapsUrl, '_blank')}
                        variant="outline" 
                        size="sm"
                        className="w-full border-orange-500 text-orange-500 hover:bg-orange-50"
                      >
                        Ver en Google Maps
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6 lg:p-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Zonas de Trabajo
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">Ciudad Autónoma de Buenos Aires (CABA)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">Zona Norte (Vicente López, San Isidro, Tigre)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">Zona Oeste (Morón, Hurlingham, Ituzaingó)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">Zona Sur (Avellaneda, Quilmes, Lanús)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
              <CardContent className="p-6 lg:p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">
                  ¿Estás en la zona?
                </h3>
                <p className="text-green-100 mb-4 text-sm">
                  Contactanos para coordinar una visita
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={handleWhatsAppClick}
                    variant="secondary" 
                    className="w-full bg-white text-green-600 hover:bg-gray-100"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button 
                    onClick={() => window.open('tel:01155821120', '_self')}
                    variant="outline" 
                    className="w-full border-white text-white hover:bg-white hover:text-green-600 md:hidden"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    011 5582-1120
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Map

