import { Users, Award, BookOpen, Heart, Target, Lightbulb } from 'lucide-react'

const AboutSection = () => {
  const team = [
    {
      name: "Dr. 张教授",
      role: "课程总监",
      avatar: "👨‍🏫",
      description: "985高校AI研究中心主任，专注AI教育10年，发表相关论文50余篇"
    },
    {
      name: "李老师",
      role: "文科教学专家", 
      avatar: "👩‍🏫",
      description: "文学博士，有丰富的文科教学经验，擅长将复杂概念简化表达"
    },
    {
      name: "王老师",
      role: "AI应用导师",
      avatar: "👨‍💻", 
      description: "AI行业从业8年，熟悉各类AI工具，专注AI实用技能培训"
    }
  ]

  const values = [
    {
      icon: Heart,
      title: "人文关怀",
      description: "始终以人为本，关注AI对人类社会的积极影响"
    },
    {
      icon: Target,
      title: "实用导向", 
      description: "注重实际应用，让学员真正掌握有用的AI技能"
    },
    {
      icon: Lightbulb,
      title: "创新思维",
      description: "培养批判性思维，鼓励独立思考和创新应用"
    }
  ]

  const achievements = [
    { number: "3年", label: "专业教学经验" },
    { number: "2000+", label: "成功培养学员" },
    { number: "98%", label: "学员满意度" },
    { number: "50+", label: "合作高校" }
  ]

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            关于AI启蒙学院
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            我们致力于为文科生提供最优质的AI教育，让每个人都能在AI时代找到自己的价值
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl p-8 mb-16">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">我们的使命</h3>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              在AI技术快速发展的今天，我们相信文科生不应该被技术浪潮抛下。
              我们的使命是用人文的视角、通俗的语言，帮助文科生理解和掌握AI技术，
              让他们在保持人文素养的同时，也能拥抱科技进步，在AI时代发挥独特价值。
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">核心价值观</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow duration-300">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h4>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-blue-600 rounded-2xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">我们的成就</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {achievement.number}
                </div>
                <div className="text-blue-100 font-medium">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">专业团队</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                <div className="text-6xl mb-4">{member.avatar}</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h4>
                <div className="text-blue-600 font-medium mb-3">{member.role}</div>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">为什么选择我们？</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-lg mr-4">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">专业的课程设计</h4>
                  <p className="text-gray-600">基于文科生的学习特点，精心设计的课程体系</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-lg mr-4">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">贴心的学习支持</h4>
                  <p className="text-gray-600">专业导师全程陪伴，解答疑问，指导实践</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-orange-100 p-2 rounded-lg mr-4">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">权威的教学认证</h4>
                  <p className="text-gray-600">与多所985高校合作，获得行业专家认可</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-100 to-orange-100 p-8 rounded-2xl">
            <h4 className="text-xl font-bold text-gray-900 mb-4">我们的承诺</h4>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                提供最适合文科生的AI教育内容
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                保证课程质量和教学效果
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                持续更新课程内容，跟上AI发展
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                提供优质的学习支持和服务
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection

