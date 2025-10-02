import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CourseSection from './components/CourseSection'
import PricingSection from './components/PricingSection'
import TestimonialSection from './components/TestimonialSection'
import AboutSection from './components/AboutSection'
import Footer from './components/Footer'
import PaymentPage from './components/PaymentPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={
            <>
              <Navbar />
              <Hero />
              <CourseSection />
              <TestimonialSection />
              <PricingSection />
              <AboutSection />
              <Footer />
            </>
          } />
          <Route path="/payment" element={<PaymentPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
