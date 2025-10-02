import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Receipt, Clock, CheckCircle, Globe, User, MapPin, Calendar, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PaymentPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [orderInfo, setOrderInfo] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState('pending') // pending, success, failed

  useEffect(() => {
    // 从URL参数获取订单信息
    const orderId = searchParams.get('orderId') || `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`
    const planName = searchParams.get('plan') || 'AI入门课程'
    const amount = searchParams.get('amount') || '299'
    const currentTime = new Date()
    const formattedTime = currentTime.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    setOrderInfo({
      orderId,
      timestamp: formattedTime,
      timestampISO: currentTime.toISOString(),
      amount,
      productName: planName,
      productDescription: '专为文科生设计的AI入门课程，包含完整的学习资料和实践指导',
      period: '永久访问',
      websiteUrl: window.location.origin,
      currentUrl: window.location.href,
      recipientName: '学员姓名',
      recipientAddress: '在线课程服务',
      recipientPhone: '138****8888',
      paymentMethod: 'alipay',
      merchantName: 'AI启蒙学院',
      merchantContact: '400-123-4567',
      merchantLicense: '京ICP备2024000000号',
      businessLicense: '91110000MA00000000'
    })
  }, [searchParams])

  const handlePaymentSuccess = () => {
    setPaymentStatus('success')
  }

  const handlePaymentFailed = () => {
    setPaymentStatus('failed')
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">订单支付</h1>
              <p className="text-gray-600 mt-1">请确认订单信息并完成支付</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">订单号</div>
              <div className="font-mono text-blue-600">{orderInfo?.orderId}</div>
            </div>
          </div>
        </div>

        {/* 详细交易信息 - 用于举证 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <Receipt className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">交易详情（法律举证材料）</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">基本信息</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">订单号：</span>
                  <span className="font-mono text-blue-600">{orderInfo?.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">交易时间：</span>
                  <span className="font-semibold">{orderInfo?.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">商品名称：</span>
                  <span className="font-semibold">{orderInfo?.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">商品描述：</span>
                  <span className="text-right max-w-xs">{orderInfo?.productDescription}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">支付周期：</span>
                  <span>{orderInfo?.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">订单金额：</span>
                  <span className="font-bold text-red-600 text-lg">¥{orderInfo?.amount}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">网站与用户信息</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">网站地址：</span>
                  <span className="font-mono text-xs text-blue-600 break-all">{orderInfo?.websiteUrl}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">当前页面：</span>
                  <span className="font-mono text-xs text-blue-600 break-all">{orderInfo?.currentUrl}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">收货人：</span>
                  <span className="font-semibold">{orderInfo?.recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">收货地址：</span>
                  <span>{orderInfo?.recipientAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">联系电话：</span>
                  <span className="font-mono">{orderInfo?.recipientPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">支付方式：</span>
                  <span className="font-semibold">{orderInfo?.paymentMethod === 'alipay' ? '支付宝' : '微信支付'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 商户信息 */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 mb-4">商户信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">商户名称：</span>
                  <span className="font-semibold">{orderInfo?.merchantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">客服电话：</span>
                  <span className="font-mono">{orderInfo?.merchantContact}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">ICP备案号：</span>
                  <span className="font-mono text-xs">{orderInfo?.merchantLicense}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">营业执照号：</span>
                  <span className="font-mono text-xs">{orderInfo?.businessLicense}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 法律声明 */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm text-yellow-800">
              <div className="font-semibold mb-2">⚠️ 交易凭证说明：</div>
              <ul className="space-y-1">
                <li>• 本页面包含完整的交易信息，可作为法律举证材料</li>
                <li>• 请妥善保存订单号、交易时间等关键信息</li>
                <li>• 建议截图保存本页面作为交易凭证</li>
                <li>• 如有争议，可凭此页面信息进行维权</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 支付操作区域 */}
        {paymentStatus === 'pending' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">支付操作</h3>
            <div className="text-center">
              <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <div className="text-center">
                  <div className="text-6xl mb-2">💙</div>
                  <div className="text-sm text-gray-600">支付宝扫码支付</div>
                  <div className="text-xs text-gray-500 mt-2">
                    订单金额：¥{orderInfo?.amount}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-600 font-semibold text-xs">
                    1
                  </div>
                  打开支付宝APP
                </div>
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-600 font-semibold text-xs">
                    2
                  </div>
                  扫描上方二维码
                </div>
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-600 font-semibold text-xs">
                    3
                  </div>
                  确认支付金额并完成支付
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-center text-orange-800">
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="text-sm">请在15分钟内完成支付</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  onClick={handlePaymentSuccess}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  模拟支付成功
                </Button>
                <Button 
                  onClick={handlePaymentFailed}
                  variant="outline"
                  className="flex-1"
                >
                  支付失败
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 支付成功状态 */}
        {paymentStatus === 'success' && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">支付成功！</h3>
            <p className="text-gray-600 mb-6">
              恭喜您成功购买了{orderInfo?.productName}，我们将在24小时内为您开通课程权限
            </p>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
              <h4 className="font-semibold text-green-900 mb-3">交易凭证信息：</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">订单号：</span>
                  <span className="font-mono text-green-800">{orderInfo?.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">支付时间：</span>
                  <span className="font-semibold text-green-800">{orderInfo?.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">支付金额：</span>
                  <span className="font-bold text-green-800">¥{orderInfo?.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">支付方式：</span>
                  <span className="text-green-800">支付宝</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleBackToHome}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              返回首页
            </Button>
          </div>
        )}

        {/* 支付失败状态 */}
        {paymentStatus === 'failed' && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">支付失败</h3>
            <p className="text-gray-600 mb-6">
              支付过程中出现问题，请重试或联系客服
            </p>
            
            <div className="flex space-x-4">
              <Button 
                onClick={() => setPaymentStatus('pending')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                重新支付
              </Button>
              <Button 
                onClick={handleBackToHome}
                variant="outline"
              >
                返回首页
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentPage
