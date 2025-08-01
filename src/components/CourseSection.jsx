import { CheckCircle, Clock, Users, BookOpen, Brain, Lightbulb, Target, Zap } from 'lucide-react'
import courseIllustration from '../assets/course-illustration.jpg'
import learningPath from '../assets/ai-learning-path.jpg'

const CourseSection = () => {
  const courseModules = [
    {
      title: "AI认知篇",
      duration: "8学时",
      icon: Brain,
      topics: ["AI基础概念", "发展历程", "技术分类", "核心原理"]
    },
    {
      title: "AI应用篇", 
      duration: "10学时",
      icon: Target,
      topics: ["日常应用", "教育领域", "文化创意", "商业应用"]
    },
    {
      title: "AI影响篇",
      duration: "6学时", 
      icon: Lightbulb,
      topics: ["社会影响", "伦理问题", "人机关系", "未来趋势"]
    },
    {
      title: "AI实践篇",
      duration: "6学时",
      icon: Zap,
      topics: ["工具使用", "辅助写作", "研究方法", "应用规划"]
    }
  ]

  const features = [
    "零基础友好，无需技术背景",
    "文科视角，人文关怀导向", 
    "理论实践并重，学以致用",
    "批判思维培养，理性认知AI",
    "终身学习支持，持续更新",
    "专业导师指导，答疑解惑"
  ]

  return (
    <section id="course" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            专为文科生设计的AI课程体系
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            从人文视角理解AI，用文科思维掌握人工智能，32学时系统学习，4周快速入门
          </p>
        </div>

        {/* Course Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">课程特色</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-900 mb-2">为什么选择我们？</h4>
              <p className="text-blue-800">
                我们深知文科生的学习特点和需求，课程设计避免复杂的数学公式和编程代码，
                而是从人文社科的角度来理解AI，让你在保持专业优势的同时，掌握AI时代的核心技能。
              </p>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src={courseIllustration} 
              alt="课程特色插图" 
              className="rounded-lg shadow-lg w-full"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center text-blue-600">
                <Users className="h-5 w-5 mr-2" />
                <span className="font-semibold">2000+ 学员</span>
              </div>
            </div>
          </div>
        </div>

        {/* Course Modules */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">课程模块</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courseModules.map((module, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <module.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">{module.title}</h4>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {module.duration}
                    </div>
                  </div>
                </div>
                <ul className="space-y-2">
                  {module.topics.map((topic, topicIndex) => (
                    <li key={topicIndex} className="flex items-center text-gray-600 text-sm">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Path */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <img 
              src={learningPath} 
              alt="学习路径" 
              className="rounded-lg shadow-lg w-full"
            />
          </div>
          
          <div className="order-1 lg:order-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">学习路径</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  1
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">建立AI认知框架</h4>
                  <p className="text-gray-600">从基础概念开始，建立对AI的正确认知</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">探索应用场景</h4>
                  <p className="text-gray-600">了解AI在各领域的实际应用和价值</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  3
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">培养批判思维</h4>
                  <p className="text-gray-600">理性看待AI的影响，形成独立判断</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  4
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">掌握实用技能</h4>
                  <p className="text-gray-600">学会使用AI工具，提升学习和工作效率</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CourseSection

