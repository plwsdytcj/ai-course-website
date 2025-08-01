import { Star, Quote } from 'lucide-react'
import successStory from '../assets/success-story.jpg'

const TestimonialSection = () => {
  const testimonials = [
    {
      name: "李小雨",
      major: "中文系大三",
      avatar: "👩‍🎓",
      rating: 5,
      content: "作为文科生，我原本对AI很恐惧，觉得那是理科生的专利。但这个课程让我发现，AI其实可以成为我们文科生的得力助手。现在我用AI来辅助写作和研究，效率提升了很多！",
      highlight: "效率提升很多"
    },
    {
      name: "王志明", 
      major: "历史系研一",
      avatar: "👨‍🎓",
      rating: 5,
      content: "课程设计很贴心，没有复杂的数学公式，而是从人文角度来理解AI。老师讲得很生动，案例也很丰富。最重要的是，我学会了如何批判性地看待AI技术。",
      highlight: "批判性思维"
    },
    {
      name: "张美琳",
      major: "新闻系大四", 
      avatar: "👩‍💼",
      rating: 5,
      content: "月度陪跑服务真的很值！每周的直播答疑解决了我很多困惑，1对1指导让我的学习更有针对性。现在我已经开始用AI工具来做新闻采访和写作了。",
      highlight: "1对1指导很有用"
    },
    {
      name: "陈思远",
      major: "哲学系大二",
      avatar: "🧑‍🎓", 
      rating: 5,
      content: "这门课程不仅教会了我AI的基础知识，更重要的是让我思考AI对人类社会的深层影响。作为哲学专业的学生，我觉得这种跨学科的学习非常有价值。",
      highlight: "跨学科学习"
    },
    {
      name: "刘雨萌",
      major: "英语系大三",
      avatar: "👩‍🏫",
      rating: 5,
      content: "课程内容很实用，学完后我不仅了解了AI的原理，还掌握了很多AI工具的使用方法。现在我用AI来辅助英语教学设计，学生们都很喜欢！",
      highlight: "实用性很强"
    },
    {
      name: "马浩然",
      major: "社会学系研二",
      avatar: "👨‍💻",
      rating: 5,
      content: "作为社会学专业的学生，我特别关注AI对社会的影响。这个课程从多个角度分析了AI的社会意义，让我对自己的研究方向有了新的思考。",
      highlight: "拓展研究视野"
    }
  ]

  const stats = [
    { number: "2000+", label: "学员总数" },
    { number: "98%", label: "满意度" },
    { number: "4.9", label: "平均评分" },
    { number: "95%", label: "完课率" }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            学员真实反馈
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            听听已经完成课程的文科生同学们怎么说
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Featured Testimonial */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Quote className="h-8 w-8 text-blue-500 mr-3" />
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              
              <blockquote className="text-lg text-gray-700 mb-6 leading-relaxed">
                "作为一名文科生，我从来没想过自己能够理解AI。但这个课程改变了我的看法。
                老师用我们熟悉的人文语言来解释技术概念，让我不仅学会了使用AI工具，
                更重要的是培养了在AI时代的思维方式。现在我对未来充满信心！"
              </blockquote>
              
              <div className="flex items-center">
                <div className="text-3xl mr-4">👩‍🎓</div>
                <div>
                  <div className="font-semibold text-gray-900">李小雨</div>
                  <div className="text-gray-600">中文系大三 · 课程优秀学员</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={successStory} 
                alt="成功学员" 
                className="rounded-lg shadow-lg w-full"
              />
              <div className="absolute -bottom-4 -left-4 bg-orange-500 text-white p-4 rounded-lg shadow-lg">
                <div className="text-sm font-semibold">学习成果</div>
                <div className="text-lg font-bold">AI应用达人</div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">{testimonial.avatar}</div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.major}</div>
                </div>
              </div>
              
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-700 mb-3 text-sm leading-relaxed">
                {testimonial.content}
              </p>
              
              <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                {testimonial.highlight}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-white p-8 rounded-2xl shadow-lg inline-block">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              加入我们，开启你的AI学习之旅
            </h3>
            <p className="text-gray-600 mb-6">
              和2000+文科生一起，在AI时代找到属于自己的位置
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                查看课程详情
              </button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                立即开始学习
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialSection

