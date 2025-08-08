import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Award } from 'lucide-react'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Create WhatsApp message with form data
    const message = `Hola AlbornozObras, quiero solicitar un presupuesto:
    
Nombre: ${formData.name}
Email: ${formData.email}
Teléfono: ${formData.phone}
Servicio: ${formData.service}
Mensaje: ${formData.message}`
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5491155821120&text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleWhatsAppClick = () => {
    window.open('https://api.whatsapp.com/send?phone=5491155821120&text=Hola%20AlbornozObras%2C%20quiero%20consultarles%20sobre%20lo%20siguiente', '_blank')
  }

  const contactInfo = [
    {
      icon: <Phone className="w-5 h-5 lg:w-6 lg:h-6 text-orange-500" />,
      title: "Teléfono",
      content: "011 5582-1120",
      subtitle: "Atención inmediata",
      action: () => window.open('tel:01155821120', '_self')
    },
    {
      icon: <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-500" />,
      title: "WhatsApp",
      content: "011 5582-1120",
      subtitle: "Respuesta rápida",
      action: handleWhatsAppClick
    },
    {
      icon: <MapPin className="w-5 h-5 lg:w-6 lg:h-6 text-orange-500" />,
      title: "Dirección",
      content: "Av. S. Martín 3166",
      subtitle: "CABA, Buenos Aires",
      action: () => window.open('https://maps.google.com/?q=Av.+S.+Martín+3166,+C1416+Cdad.+Autónoma+de+Buenos+Aires', '_blank')
    },
    {
      icon: <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-orange-500" />,
      title: "Horarios",
      content: "Lun - Vie: 8:00 - 18:00",
      subtitle: "Sáb: 9:00 - 14:00"
    }
  ]

  return (
    <section id="contacto" className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <MessageCircle className="w-4 h-4 mr-2" />
            Contacto
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Pedí tu Presupuesto Gratis
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            ¿Tenés un proyecto en mente? Estamos aquí para ayudarte a hacerlo realidad. 
            Presupuesto 100% gratuito en menos de 24 horas.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-4 lg:space-y-6">
              {contactInfo.map((info, index) => (
                <Card 
                  key={index} 
                  className={`border-none shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${info.action ? 'hover:scale-105' : ''}`}
                  onClick={info.action}
                >
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 p-3 bg-orange-50 rounded-lg">
                        {info.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-1">
                          {info.title}
                        </h3>
                        <p className="text-sm lg:text-base text-gray-900 font-medium mb-1">
                          {info.content}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-600">
                          {info.subtitle}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Urgent Help Card - Mobile Optimized */}
            <Card className="bg-gradient-to-r from-green-500 to-green-600 border-none text-white">
              <CardContent className="p-6 lg:p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-white" />
                <h3 className="text-lg lg:text-xl font-bold mb-2">
                  ¿Necesitás ayuda urgente?
                </h3>
                <p className="text-green-100 mb-4 text-sm lg:text-base">
                  Contactanos por WhatsApp para atención inmediata
                </p>
                <Button 
                  onClick={handleWhatsAppClick}
                  variant="secondary" 
                  className="w-full bg-white text-green-600 hover:bg-gray-100"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Directo
                </Button>
              </CardContent>
            </Card>

            {/* Trust Badge */}
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4 lg:p-6 text-center">
                <Award className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <h4 className="font-semibold text-gray-800 mb-1">23 Años de Experiencia</h4>
                <p className="text-sm text-gray-600">Más de 500 proyectos completados</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl lg:text-2xl font-bold text-gray-800">
                  Solicitar Presupuesto Gratuito
                </CardTitle>
                <p className="text-sm lg:text-base text-gray-600">
                  Completá el formulario y te contactamos en menos de 24 horas
                </p>
              </CardHeader>
              
              <CardContent className="p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm lg:text-base font-medium">
                        Nombre Completo *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="h-10 lg:h-12 text-sm lg:text-base"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm lg:text-base font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="h-10 lg:h-12 text-sm lg:text-base"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm lg:text-base font-medium">
                        Teléfono *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="h-10 lg:h-12 text-sm lg:text-base"
                        placeholder="011 1234-5678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service" className="text-sm lg:text-base font-medium">
                        Servicio de Interés
                      </Label>
                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleInputChange}
                        className="w-full h-10 lg:h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm lg:text-base"
                      >
                        <option value="">Seleccionar servicio</option>
                        <option value="construccion-seco">Construcción en Seco</option>
                        <option value="reforma-integral">Reforma Integral</option>
                        <option value="pintura">Pintura</option>
                        <option value="plomeria">Plomería</option>
                        <option value="ampliacion">Ampliación</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm lg:text-base font-medium">
                      Contanos sobre tu proyecto *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="resize-none text-sm lg:text-base"
                      placeholder="Describí tu proyecto, presupuesto estimado, fechas, etc."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="flex-1 bg-green-500 hover:bg-green-600 text-base lg:text-lg py-3 lg:py-4"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Enviar por WhatsApp
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => window.open('tel:01155821120', '_self')}
                      variant="outline" 
                      size="lg"
                      className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50 text-base lg:text-lg py-3 lg:py-4"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Llamar Ahora
                    </Button>
                  </div>

                  <p className="text-xs lg:text-sm text-gray-600 text-center">
                    Al enviar este formulario, aceptás nuestros términos y condiciones. 
                    Te contactaremos en un plazo máximo de 24 horas.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact

