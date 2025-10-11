import { useState } from 'react'
import { ArrowRight, Play, Star, Users, BookOpen, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PaymentModal from './PaymentModal'
import heroImage from '../assets/hero-bg.jpg'

const Hero = () => {
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, plan: null })

  const handleStartLearning = () => {
    // 默认推荐月度订阅服务
    const recommendedPlan = {
      name: "月度陪跑服务",
      price: "499",
      period: "每月"
    }
    setPaymentModal({ isOpen: true, plan: recommendedPlan })
  }

  const closePaymentModal = () => {
    setPaymentModal({ isOpen: false, plan: null })
  }
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-blue-900 bg-opacity-70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
            <Star className="h-4 w-4 mr-2" />
            专为文科生设计的AI入门课程
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            零基础文科生的
            <span className="text-blue-300 block">AI认知之旅</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            从人文ss视角理解AI，用文科思维掌握人工智能，
            在AI时代找到属于你的独特价值
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            <div className="flex items-center text-white">
              <Users className="h-5 w-5 mr-2 text-blue-300" />
              <span className="text-lg">已有 <strong>2000+</strong> 文科生成功入门</span>
            </div>
            <div className="flex items-center text-white">
              <BookOpen className="h-5 w-5 mr-2 text-blue-300" />
              <span className="text-lg"><strong>32学时</strong> 系统课程</span>
            </div>
            <div className="flex items-center text-white">
              <Clock className="h-5 w-5 mr-2 text-blue-300" />
              <span className="text-lg"><strong>4周</strong> 快速掌握</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              onClick={handleStartLearning}
            >
              立即开始学习
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg font-semibold rounded-lg"
            >
              <Play className="mr-2 h-5 w-5" />
              观看介绍视频
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 text-blue-200">
            <p className="text-sm mb-4">已获得以下认可</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
              <div className="text-sm">✓ 教育部推荐</div>
              <div className="text-sm">✓ 985高校合作</div>
              <div className="text-sm">✓ 行业专家认证</div>
              <div className="text-sm">✓ 学员满意度98%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>

      <PaymentModal 
        isOpen={paymentModal.isOpen}
        onClose={closePaymentModal}
        plan={paymentModal.plan}
      />
    </section>
  )
}

export default Hero

