import { Check, Star, Zap, Crown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PricingSection = () => {
  const handlePurchase = (plan) => {
    // 生成订单信息并跳转到支付页面
    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`
    const paymentUrl = `/payment?orderId=${orderId}&plan=${encodeURIComponent(plan.name)}&amount=${plan.price}`
    
    // 跳转到支付页面
    window.location.href = paymentUrl
  }
  const plans = [
    {
      name: "一次性课程",
      price: "299",
      originalPrice: "599",
      period: "永久访问",
      description: "适合自主学习能力强的同学",
      features: [
        "完整AI入门课程（32学时）",
        "高清视频课程永久观看",
        "PPT演示文稿下载",
        "PDF详细教程",
        "学习资料包",
        "课程更新免费获取",
        "基础学习群交流",
        "7天无理由退款"
      ],
      buttonText: "立即购买",
      popular: false,
      icon: Star,
      color: "blue"
    },
    {
      name: "月度陪跑服务",
      price: "499",
      originalPrice: "899", 
      period: "每月",
      description: "适合需要指导和督促的同学",
      features: [
        "包含一次性课程所有内容",
        "每周2小时直播答疑",
        "1对1专属学习指导",
        "专属VIP学习群",
        "作业批改和详细反馈",
        "学习进度跟踪",
        "最新AI动态分享",
        "实践项目指导",
        "优先技术支持",
        "随时取消订阅"
      ],
      buttonText: "开始订阅",
      popular: true,
      icon: Crown,
      color: "orange"
    }
  ]

  const faqs = [
    {
      question: "课程适合完全零基础的文科生吗？",
      answer: "是的，我们的课程专门为零AI基础的文科生设计，不需要任何技术背景，用通俗易懂的语言解释复杂概念。"
    },
    {
      question: "月度订阅可以随时取消吗？",
      answer: "可以的，您可以随时取消订阅，取消后当月服务继续有效，下月不再扣费。"
    },
    {
      question: "支持哪些支付方式？",
      answer: "我们支持支付宝和微信支付，扫码即可完成支付，安全便捷。"
    },
    {
      question: "有退款保证吗？",
      answer: "一次性课程提供7天无理由退款，月度订阅可随时取消。我们对课程质量有信心。"
    }
  ]

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            选择适合你的学习方案
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            两种学习模式，满足不同需求。无论选择哪种方案，都能获得优质的学习体验
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative bg-white rounded-2xl shadow-xl border-2 ${
                plan.popular ? 'border-orange-500 transform scale-105' : 'border-gray-200'
              } p-8 hover:shadow-2xl transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    🔥 最受欢迎
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={`inline-flex p-3 rounded-full ${
                  plan.color === 'orange' ? 'bg-orange-100' : 'bg-blue-100'
                } mb-4`}>
                  <plan.icon className={`h-8 w-8 ${
                    plan.color === 'orange' ? 'text-orange-600' : 'text-blue-600'
                  }`} />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="flex items-center justify-center mb-2">
                  <span className="text-4xl font-bold text-gray-900">¥{plan.price}</span>
                  <span className="text-gray-500 ml-2">/{plan.period}</span>
                </div>
                
                <div className="flex items-center justify-center">
                  <span className="text-gray-400 line-through text-lg">原价 ¥{plan.originalPrice}</span>
                  <span className={`ml-2 px-2 py-1 rounded text-sm font-semibold ${
                    plan.color === 'orange' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    限时优惠
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full py-4 text-lg font-semibold rounded-lg transition-all duration-200 ${
                  plan.popular 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                onClick={() => handlePurchase(plan)}
              >
                {plan.buttonText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>

        {/* Value Proposition */}
        <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl p-8 mb-16">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">为什么选择我们的课程？</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">快速入门</h4>
                <p className="text-gray-600">4周时间，从零基础到AI应用高手</p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">专业品质</h4>
                <p className="text-gray-600">985高校合作，行业专家认证</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">贴心服务</h4>
                <p className="text-gray-600">专属导师，全程陪伴学习</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">常见问题</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">{faq.question}</h4>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default PricingSection

