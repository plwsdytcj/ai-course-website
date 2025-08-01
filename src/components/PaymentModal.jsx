import { useState } from 'react'
import { X, Smartphone, CreditCard, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PaymentModal = ({ isOpen, onClose, plan }) => {
  const [paymentMethod, setPaymentMethod] = useState('alipay')
  const [step, setStep] = useState('method') // method, qrcode, success

  if (!isOpen) return null

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method)
    setStep('qrcode')
  }

  const handlePaymentSuccess = () => {
    setStep('success')
    setTimeout(() => {
      onClose()
      setStep('method')
    }, 3000)
  }

  const generateQRCode = () => {
    // 这里应该调用真实的支付API生成二维码
    // 现在使用模拟的二维码
    const baseUrl = paymentMethod === 'alipay' 
      ? 'https://qr.alipay.com/pay' 
      : 'https://pay.weixin.qq.com/pay'
    return `${baseUrl}?amount=${plan?.price}&order=${Date.now()}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">
            {step === 'success' ? '支付成功' : '选择支付方式'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'method' && (
            <>
              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">订单详情</h4>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">{plan?.name}</span>
                  <span className="font-semibold">¥{plan?.price}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>支付周期</span>
                  <span>{plan?.period}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <button
                  onClick={() => handlePaymentMethodSelect('alipay')}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors flex items-center"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">支付宝</div>
                    <div className="text-sm text-gray-500">扫码支付，安全便捷</div>
                  </div>
                </button>

                <button
                  onClick={() => handlePaymentMethodSelect('wechat')}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 transition-colors flex items-center"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">微信支付</div>
                    <div className="text-sm text-gray-500">微信扫码，即时到账</div>
                  </div>
                </button>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <div className="font-semibold mb-1">安全保障</div>
                    <div>支付过程采用银行级加密，保障您的资金安全</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 'qrcode' && (
            <>
              {/* QR Code */}
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-2">
                        {paymentMethod === 'alipay' ? '💙' : '💚'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {paymentMethod === 'alipay' ? '支付宝' : '微信'}扫码支付
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        订单金额：¥{plan?.price}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-600 font-semibold text-xs">
                    1
                  </div>
                  打开{paymentMethod === 'alipay' ? '支付宝' : '微信'}APP
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-600 font-semibold text-xs">
                    2
                  </div>
                  扫描上方二维码
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-600 font-semibold text-xs">
                    3
                  </div>
                  确认支付金额并完成支付
                </div>
              </div>

              {/* Timer and Status */}
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <div className="flex items-center text-orange-800">
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="text-sm">请在15分钟内完成支付</span>
                </div>
              </div>

              {/* Mock Payment Button (for demo) */}
              <Button 
                onClick={handlePaymentSuccess}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                模拟支付成功 (仅演示)
              </Button>

              <div className="text-center mt-4">
                <button 
                  onClick={() => setStep('method')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  返回选择支付方式
                </button>
              </div>
            </>
          )}

          {step === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">支付成功！</h4>
              <p className="text-gray-600 mb-6">
                恭喜您成功购买了{plan?.name}，我们将在24小时内为您开通课程权限
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h5 className="font-semibold text-blue-900 mb-2">接下来您需要：</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 查收邮件获取课程访问链接</li>
                  <li>• 加入专属学习群</li>
                  <li>• 下载学习资料</li>
                  <li>• 开始您的AI学习之旅</li>
                </ul>
              </div>

              <div className="text-sm text-gray-500">
                页面将在3秒后自动关闭...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentModal

