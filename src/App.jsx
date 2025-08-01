import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CourseSection from './components/CourseSection'
import PricingSection from './components/PricingSection'
import TestimonialSection from './components/TestimonialSection'
import AboutSection from './components/AboutSection'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <CourseSection />
      <TestimonialSection />
      <PricingSection />
      <AboutSection />
      <Footer />
    </div>
  )
}

export default App
