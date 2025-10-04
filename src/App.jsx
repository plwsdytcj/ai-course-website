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

const HomePage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <CourseSection />
      <TestimonialSection />
      <PricingSection />
      <AboutSection />
      <Footer />
    </>
  )
}

// 强制引用PaymentPage组件，防止tree-shaking
const PaymentPageComponent = PaymentPage

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/payment" element={<PaymentPageComponent />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
