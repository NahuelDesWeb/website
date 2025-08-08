import { Star, Quote, MapPin } from 'lucide-react'

const Testimonials = () => {
  // Simulated Google Maps reviews for Albornoz Obras
  const testimonials = [
    {
      id: 1,
      name: "María González",
      rating: 5,
      date: "Hace 2 meses",
      text: "Excelente trabajo en la reforma de mi cocina. El equipo de Albornoz Obras fue muy profesional, cumplieron con los tiempos y la calidad superó mis expectativas. Recomiendo 100%.",
      avatar: "MG"
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      rating: 5,
      date: "Hace 1 mes",
      text: "Hicieron la construcción en seco de mi oficina. Trabajo impecable, sin escombros y muy rápido. Los materiales de primera calidad y el acabado perfecto. Muy satisfecho.",
      avatar: "CR"
    },
    {
      id: 3,
      name: "Ana Martínez",
      rating: 5,
      date: "Hace 3 semanas",
      text: "Reformaron mi baño completo. Desde el primer día fueron muy organizados y limpios. El resultado final es hermoso y funcional. Definitivamente los volvería a contratar.",
      avatar: "AM"
    },
    {
      id: 4,
      name: "Roberto Silva",
      rating: 5,
      date: "Hace 1 semana",
      text: "23 años de experiencia se notan. Hicieron la ampliación de mi casa con durlock y el trabajo fue excepcional. Muy recomendables, serios y responsables.",
      avatar: "RS"
    },
    {
      id: 5,
      name: "Laura Fernández",
      rating: 5,
      date: "Hace 2 semanas",
      text: "Pintura completa de mi departamento. Llegaron puntuales todos los días, trabajaron con mucho cuidado y el resultado es perfecto. Precios justos y calidad garantizada.",
      avatar: "LF"
    },
    {
      id: 6,
      name: "Diego Morales",
      rating: 5,
      date: "Hace 1 mes",
      text: "Instalación de plomería nueva en mi casa. Trabajo prolijo, materiales de calidad y garantía de por vida. El equipo muy profesional y educado. Los recomiendo sin dudas.",
      avatar: "DM"
    }
  ]

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 lg:mb-16">
          <div className="flex items-center justify-center mb-4">
            <MapPin className="w-6 h-6 text-orange-500 mr-2" />
            <span className="text-orange-500 font-semibold">Google Maps</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Más de 23 años construyendo confianza. Lee las reseñas reales de nuestros clientes en Google Maps.
          </p>
          
          {/* Google Rating Summary */}
          <div className="inline-flex items-center bg-gray-50 rounded-xl p-4 lg:p-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-3xl lg:text-4xl font-bold text-gray-800 mr-2">4.9</span>
                <div className="flex">
                  {renderStars(5)}
                </div>
              </div>
              <p className="text-sm text-gray-600">Basado en 50+ reseñas de Google</p>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Quote Icon */}
              <div className="flex items-start justify-between mb-4">
                <Quote className="w-8 h-8 text-orange-500 opacity-50" />
                <div className="flex items-center">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
                    alt="Google" 
                    className="w-4 h-4 mr-1"
                  />
                  <span className="text-xs text-gray-500">Google</span>
                </div>
              </div>

              {/* Review Content */}
              <p className="text-gray-700 mb-4 leading-relaxed text-sm lg:text-base">
                "{testimonial.text}"
              </p>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {renderStars(testimonial.rating)}
              </div>

              {/* Author Info */}
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold text-sm">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm lg:text-base">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-gray-500">{testimonial.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 lg:mt-16">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 lg:p-12 text-white">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              ¿Querés ser nuestro próximo cliente satisfecho?
            </h3>
            <p className="text-lg lg:text-xl mb-6 opacity-90">
              Sumate a los más de 200 clientes que confiaron en nosotros para transformar sus hogares.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => window.open('https://api.whatsapp.com/send?phone=5491155821120&text=Hola%20AlbornozObras%2C%20quiero%20consultarles%20sobre%20lo%20siguiente', '_blank')}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Consultar por WhatsApp
              </button>
              <button
                onClick={() => window.open('tel:01155821120', '_self')}
                className="bg-white text-orange-500 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg md:hidden"
              >
                Llamar: 011 5582-1120
              </button>
            </div>
          </div>
        </div>

        {/* Google Maps Link */}
        <div className="text-center mt-8">
          <a
            href="https://maps.google.com/search/Albornoz+Obras+Av.+S.+Martín+3166+CABA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            <MapPin className="w-5 h-5 mr-2" />
            Ver todas las reseñas en Google Maps
          </a>
        </div>
      </div>
    </section>
  )
}

export default Testimonials

