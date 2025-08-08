import './App.css'
import Header from './components/Header'
import Hero from './components/Hero'
import Services from './components/Services'
import Projects from './components/Projects'
import About from './components/About'
import Testimonials from './components/Testimonials'
import Map from './components/Map'
import Footer from './components/Footer'
import FloatingCTA from './components/FloatingCTA'
import LoadingAnimation from './components/LoadingAnimation'

function App() {
  return (
    <div className="min-h-screen bg-white smooth-scroll">
      <LoadingAnimation />
      <Header />
      <main>
        <Hero />
        <Services />
        <Projects />
        <About />
        <Testimonials />
        <Map />
      </main>
      <Footer />
      <FloatingCTA />
    </div>
  )
}

export default App

