import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

// Import project images
import project1 from '../assets/waErpcAbKXwU.jpg'
import project2 from '../assets/jlZKi3GSc5WJ.jpg'
import project3 from '../assets/Yb5yo3rmRzI8.jpg'
import project4 from '../assets/sYDMwnWuZ0OD.jpg'
import project5 from '../assets/Iu6Woe3Jy3jG.jpg'
import project6 from '../assets/8BJY8PWbzira.jpg'

// Import new search images
import constructionImg1 from '/home/ubuntu/upload/search_images/ACEo34hAk8Cj.jpg'
import constructionImg2 from '/home/ubuntu/upload/search_images/XfPU61jWZqh3.jpg'
import reformImg1 from '/home/ubuntu/upload/search_images/ogwQ6J33Ni8h.jpg'
import reformImg2 from '/home/ubuntu/upload/search_images/3q7rHnAfCmgj.jpg'
import reformImg3 from '/home/ubuntu/upload/search_images/Bkxz0tNyhjxP.jpg'

const Projects = () => {
  const [activeCategory, setActiveCategory] = useState('todos')
  const [visibleProjects, setVisibleProjects] = useState([])
  const [isAnimating, setIsAnimating] = useState(false)

  const categories = [
    { id: 'todos', name: 'Todos los Proyectos' },
    { id: 'construccion', name: 'Construcción' },
    { id: 'reformas', name: 'Reformas' },
    { id: 'pintura', name: 'Pintura' },
    { id: 'plomeria', name: 'Plomería' }
  ]

  const projects = [
    // Construcción en Seco
    { id: 1, category: 'construccion', image: constructionImg1 },
    { id: 2, category: 'construccion', image: constructionImg2 },
    { id: 3, category: 'construccion', image: project2 },
    { id: 4, category: 'construccion', image: project6 },
    
    // Reformas
    { id: 5, category: 'reformas', image: reformImg1 },
    { id: 6, category: 'reformas', image: reformImg2 },
    { id: 7, category: 'reformas', image: reformImg3 },
    { id: 8, category: 'reformas', image: project1 },
    
    // Pintura
    { id: 9, category: 'pintura', image: project3 },
    { id: 10, category: 'pintura', image: project4 },
    { id: 11, category: 'pintura', image: project5 },
    { id: 12, category: 'pintura', image: project1 },
    
    // Plomería
    { id: 13, category: 'plomeria', image: project2 },
    { id: 14, category: 'plomeria', image: project3 },
    { id: 15, category: 'plomeria', image: project4 },
    { id: 16, category: 'plomeria', image: project5 }
  ]

  const filteredProjects = activeCategory === 'todos' 
    ? projects 
    : projects.filter(project => project.category === activeCategory)

  const handleCategoryChange = (categoryId) => {
    if (categoryId === activeCategory) return
    
    setIsAnimating(true)
    setVisibleProjects([])
    
    setTimeout(() => {
      setActiveCategory(categoryId)
      setIsAnimating(false)
    }, 200)
  }

  useEffect(() => {
    if (!isAnimating) {
      const timer = setTimeout(() => {
        setVisibleProjects(filteredProjects.map((_, index) => index))
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [activeCategory, isAnimating, filteredProjects])

  return (
    <section id="proyectos" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Nuestros Proyectos
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-2">
            Descubre algunos de nuestros trabajos más destacados y la calidad que caracteriza cada uno de nuestros proyectos.
          </p>
          <p className="text-base sm:text-lg text-orange-500 font-semibold">
            +200 proyectos realizados
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 lg:gap-4 mb-8 lg:mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              variant={activeCategory === category.id ? "default" : "outline"}
              className={`category-filter px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base font-medium rounded-full transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-orange-500 text-white shadow-lg scale-105'
                  : 'border-orange-500 text-orange-500 hover:bg-orange-50'
              }`}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className={`projects-grid transition-all duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {filteredProjects.map((project, index) => (
              <div
                key={`${project.id}-${activeCategory}`}
                className={`project-card group cursor-pointer ${
                  visibleProjects.includes(index) ? 'visible' : ''
                } delay-${Math.min(index * 100, 500)}`}
                style={{
                  transitionDelay: `${Math.min(index * 100, 500)}ms`
                }}
              >
                <div className="project-image-container relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300">
                  <img
                    src={project.image}
                    alt={`Proyecto ${project.id} - ${categories.find(cat => cat.id === project.category)?.name}`}
                    className="project-image w-full h-64 sm:h-72 lg:h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-white">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium">Ver proyecto</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {isAnimating && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="skeleton-card bg-gray-200 rounded-xl h-64 sm:h-72 lg:h-80 animate-pulse"></div>
            ))}
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-12 lg:mt-16 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 lg:p-8 shadow-lg">
              <div className="text-3xl lg:text-4xl font-bold text-orange-500 mb-2">200+</div>
              <div className="text-gray-600 font-medium">Proyectos Completados</div>
            </div>
            <div className="bg-white rounded-xl p-6 lg:p-8 shadow-lg">
              <div className="text-3xl lg:text-4xl font-bold text-orange-500 mb-2">23</div>
              <div className="text-gray-600 font-medium">Años de Experiencia</div>
            </div>
            <div className="bg-white rounded-xl p-6 lg:p-8 shadow-lg">
              <div className="text-3xl lg:text-4xl font-bold text-orange-500 mb-2">100%</div>
              <div className="text-gray-600 font-medium">Clientes Satisfechos</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Projects

