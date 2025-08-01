import { Brain, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Brain className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">AI启蒙学院</span>
            </div>
            <p className="text-gray-300 mb-4">
              专为文科生设计的AI入门课程，让零基础的你也能轻松掌握人工智能知识，
              在AI时代找到属于自己的位置。
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-2" />
                <span>contact@ai-academy.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="text-gray-300 hover:text-white transition-colors">首页</a></li>
              <li><a href="#course" className="text-gray-300 hover:text-white transition-colors">课程介绍</a></li>
              <li><a href="#pricing" className="text-gray-300 hover:text-white transition-colors">定价方案</a></li>
              <li><a href="#about" className="text-gray-300 hover:text-white transition-colors">关于我们</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">学习支持</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">学习指南</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">常见问题</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">技术支持</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">退款政策</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2025 AI启蒙学院. 保留所有权利. | 
            <a href="#" className="hover:text-white ml-2">隐私政策</a> | 
            <a href="#" className="hover:text-white ml-2">服务条款</a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

