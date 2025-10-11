# 微信支付完整实现清单

## 📦 第一步：安装依赖

```bash
cd /home/admin/0801/0802/ai-course-website
npm install wechatpay-node-v3 --save
```

## 🔐 第二步：配置证书和密钥

### 1. 创建证书目录
```bash
mkdir -p cert
chmod 700 cert
```

### 2. 上传证书文件到服务器

通过 SFTP 或 scp 上传：
```bash
# 本地操作
scp apiclient_key.pem root@wenkexueai.com:/home/admin/0801/0802/ai-course-website/cert/
scp apiclient_cert.pem root@wenkexueai.com:/home/admin/0801/0802/ai-course-website/cert/
```

### 3. 设置权限
```bash
chmod 600 cert/apiclient_key.pem
chmod 644 cert/apiclient_cert.pem
```

### 4. 更新 .env 配置
```env
# 微信商户配置（从微信支付商户平台获取）
WX_MCHID=1234567890
WX_PAY_KEY=192006250b4c09247ec02edce69f6a2d
WX_PAY_CERT_SERIAL=5157F09EFDC096DE15EBE81A47057A7232F1B8E1
```

## 💻 第三步：修改代码

### 在 server/index.js 顶部添加：

```javascript
import { Payment } from 'wechatpay-node-v3';
import fs from 'fs';

// 初始化微信支付
const payment = new Payment({
  appid: WECHAT_APPID,
  mchid: WX_MCHID,
  private_key: fs.readFileSync('./cert/apiclient_key.pem', 'utf8'),
  serial_no: WX_PAY_CERT_SERIAL,
  apiv3_private_key: WX_PAY_KEY,
  notify_url: 'https://wenkexueai.com/api/pay/notify',
});
```

### 修改 createWxPayOrder 函数：

```javascript
// 创建微信 JSAPI 支付订单（真实支付）
async function createWxPayOrder(openId, priceKey) {
  const priceInfo = CREDIT_PRICE[priceKey];
  if (!priceInfo) {
    throw new Error('无效的充值金额');
  }

  const orderNo = generateOrderNo();
  
  try {
    // 调用统一下单接口
    const result = await payment.transactions_jsapi({
      description: `充值${priceInfo.credits}次对话`,
      out_trade_no: orderNo,
      amount: {
        total: priceInfo.amount,
      },
      payer: {
        openid: openId,
      },
      attach: openId, // 用于回调时识别用户
    });

    // 生成 JSAPI 调起支付的参数
    const payParams = payment.buildBridgeParams(result.prepay_id);

    return {
      orderNo,
      amount: priceInfo.amount,
      credits: priceInfo.credits,
      openId: openId,
      payParams: payParams, // 包含 appId, timeStamp, nonceStr, package, signType, paySign
      payUrl: `https://wenkexueai.com/pay.html?order=${orderNo}&price=${priceKey}&openid=${openId}`
    };
  } catch (error) {
    console.error('创建支付订单失败:', error);
    throw error;
  }
}
```

### 添加支付参数接口：

```javascript
// 获取支付参数（供前端调用）
if (req.method === 'GET' && url.pathname.startsWith('/api/pay/params/')) {
  const orderNo = url.pathname.replace('/api/pay/params/', '');
  
  // 这里应该从数据库查询订单，简化示例直接返回
  // 实际应该保存订单信息
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({
    // 从之前保存的订单中获取 payParams
    payParams: cachedPayParams[orderNo]
  }));
  return;
}
```

### 修改支付回调验证：

```javascript
// 支付回调接口（带签名验证）
if (req.method === 'POST' && url.pathname === '/api/pay/notify') {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      // 获取微信签名头
      const signature = req.headers['wechatpay-signature'];
      const timestamp = req.headers['wechatpay-timestamp'];
      const nonce = req.headers['wechatpay-nonce'];
      const serial = req.headers['wechatpay-serial'];

      // 验证签名
      const verified = await payment.verifySign({
        signature,
        timestamp,
        nonce,
        serial,
        body
      });

      if (!verified) {
        console.error('❌ 支付回调签名验证失败');
        res.writeHead(401);
        res.end(JSON.stringify({ code: 'FAIL', message: '签名验证失败' }));
        return;
      }

      // 解密回调数据
      const result = await payment.decipher_gcm(
        JSON.parse(body).resource.ciphertext,
        JSON.parse(body).resource.associated_data,
        JSON.parse(body).resource.nonce
      );

      const paymentData = JSON.parse(result);
      console.log('✅ 支付回调验证成功:', paymentData);

      // 提取订单信息
      const orderNo = paymentData.out_trade_no;
      const openId = paymentData.attach;
      const amount = paymentData.amount.total;
      const tradeState = paymentData.trade_state;

      // 只处理支付成功的回调
      if (tradeState === 'SUCCESS') {
        // 根据金额确定充值的credits
        let credits = 0;
        Object.values(CREDIT_PRICE).forEach(price => {
          if (price.amount === amount) {
            credits = price.credits;
          }
        });

        if (credits > 0 && openId) {
          // 充值credits
          const newBalance = addCredits(openId, credits);
          console.log(`✅ 充值成功: ${openId} +${credits} credits, 新余额: ${newBalance}`);
          
          // 记录支付历史
          const userData = getUserData(openId);
          if (userData) {
            userData.paymentHistory = userData.paymentHistory || [];
            userData.paymentHistory.push({
              orderNo,
              amount: amount / 100,
              credits,
              time: new Date(),
              transactionId: paymentData.transaction_id
            });
          }
        }
      }

      // 返回成功响应给微信
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 'SUCCESS', message: '成功' }));
    } catch (error) {
      console.error('❌ 处理支付回调失败:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ code: 'FAIL', message: '处理失败' }));
    }
  });
  return;
}
```

## 🌐 第四步：修改前端支付页面

在 `public/pay.html` 中添加真实调起支付的代码：

```javascript
// 获取支付参数并调起支付
async function startPay() {
  try {
    // 从后端获取支付参数
    const response = await fetch(`/api/pay/params/${orderNo}`);
    const data = await response.json();
    
    if (!data.payParams) {
      alert('获取支付参数失败');
      return;
    }

    const { appId, timeStamp, nonceStr, package: packageStr, signType, paySign } = data.payParams;

    // 调起微信支付
    if (typeof WeixinJSBridge != "undefined") {
      WeixinJSBridge.invoke(
        'getBrandWCPayRequest',
        {
          appId: appId,
          timeStamp: timeStamp,
          nonceStr: nonceStr,
          package: packageStr,
          signType: signType,
          paySign: paySign
        },
        function(res) {
          if (res.err_msg == "get_brand_wcpay_request:ok") {
            alert('✅ 支付成功！\n\ncredits 将在3秒内到账');
            setTimeout(() => {
              window.location.href = 'weixin://';
            }, 3000);
          } else if (res.err_msg == "get_brand_wcpay_request:cancel") {
            alert('⚠️ 支付已取消');
          } else {
            alert('❌ 支付失败: ' + res.err_msg);
          }
        }
      );
    } else {
      alert('请在微信中打开');
    }
  } catch (error) {
    alert('调起支付失败: ' + error.message);
  }
}
```

## 🧪 第五步：测试流程

### 1. 沙箱测试

```bash
# 微信支付提供沙箱环境测试
# 使用沙箱商户号和密钥
# 不会产生真实扣款
```

### 2. 小额真实测试

```bash
# 使用真实商户号
# 充值 0.01 元测试
# 验证完整流程
```

### 3. 生产上线

```bash
# 确认所有功能正常
# 监控支付回调
# 记录所有交易日志
```

## ⚠️ 重要注意事项

### 1. HTTPS 必需
```bash
# 微信支付要求使用 HTTPS
# 需要配置 SSL 证书
certbot --nginx -d wenkexueai.com
```

### 2. 域名配置
```
在微信商户平台配置支付授权目录：
https://wenkexueai.com/
```

### 3. 回调地址
```
确保回调地址可以被微信访问：
https://wenkexueai.com/api/pay/notify
```

### 4. 证书安全
```bash
# 不要将证书提交到 git
echo "cert/" >> .gitignore
```

## 📊 完整流程图

```
用户端                  您的服务器              微信支付服务器
  |                        |                        |
  |--- 1. 发送"充值 1" ---->|                        |
  |                        |                        |
  |                        |--- 2. 调用统一下单 ---->|
  |                        |   (payment.transactions_jsapi)
  |                        |                        |
  |                        |<-- 3. 返回 prepay_id ---|
  |                        |                        |
  |<-- 4. 返回支付参数 -----|                        |
  |   (payParams)          |                        |
  |                        |                        |
  |--- 5. 点击支付按钮 ---->|                        |
  |                        |                        |
  |--- 6. 调起微信支付 ---------------------------->|
  |   WeixinJSBridge.invoke                         |
  |                                                  |
  |<----------- 7. 输入密码完成支付 -----------------|
  |                                                  |
  |                        |<-- 8. 支付回调通知 -----|
  |                        |   (POST /api/pay/notify)
  |                        |                        |
  |                        |--- 9. 验证签名          |
  |                        |--- 10. 充值 credits    |
  |                        |                        |
  |<-- 11. 显示支付成功 ----|                        |
```

## 💰 成本说明

- **微信支付手续费**: 0.6%（每笔）
- **例如**: 用户充值 10 元，您实际收到 9.94 元

## 📞 遇到问题？

1. **微信支付商户平台**: https://pay.weixin.qq.com/
2. **技术支持**: 400-999-2326
3. **开发文档**: https://pay.weixin.qq.com/wiki/doc/apiv3/

