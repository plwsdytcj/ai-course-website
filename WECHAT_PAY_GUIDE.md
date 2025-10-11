# 微信支付集成指南 - JSAPI支付（公众号内支付）

## 📋 已实现的功能

✅ Credit 积分系统
✅ 用户余额管理
✅ 充值套餐配置
✅ 支付页面（H5）
✅ 支付回调接口
✅ 对话扣费机制

## 💰 计费模式

- **每条对话消耗**: 1 credit
- **新用户赠送**: 3 次免费体验
- **充值套餐**:
  - 1元 = 50 credits
  - 5元 = 300 credits（送50）
  - 10元 = 700 credits（送200）

## 🔧 需要配置的微信支付参数

### 1. 在微信商户平台获取：

- **商户号(MCHID)**: `你的商户号`
- **商户密钥(API Key)**: `你的商户密钥`
- **证书序列号**: `你的证书序列号`

### 2. 更新 `.env` 文件：

```env
WX_MCHID=你的商户号
WX_PAY_KEY=你的商户API密钥（32位）
WX_PAY_CERT_SERIAL=你的证书序列号
```

### 3. 下载商户证书：

从微信商户平台下载 API 证书，需要：
- `apiclient_key.pem` - 商户私钥
- `apiclient_cert.pem` - 商户证书

## 📱 JSAPI 支付完整流程

### 用户端流程：

```
1. 用户发送 "充值" → 显示充值套餐
2. 用户发送 "充值 1" → 生成订单，返回支付链接
3. 用户点击链接 → 打开支付页面
4. 点击"立即支付" → 调起微信支付
5. 输入密码完成支付
6. 支付成功 → credits 自动到账
```

### 技术流程：

```
前端                    后端                  微信支付API
  |                       |                       |
  |-- 1. 发送"充值 1" -->  |                       |
  |                       |                       |
  |                       |-- 2. 统一下单 ------->|
  |                       |   (调用 JSAPI 接口)   |
  |                       |                       |
  |                       |<-- 3. 返回 prepay_id -|
  |                       |                       |
  |<-- 4. 返回支付参数 ---|                       |
  |   (prepay_id + 签名)   |                       |
  |                       |                       |
  |-- 5. 调起微信支付 ---------------------------->|
  |   WeixinJSBridge.invoke                       |
  |                                               |
  |<------------- 6. 用户输入密码 ----------------|
  |                                               |
  |                       |<-- 7. 支付回调 --------|
  |                       |   /api/pay/notify     |
  |                       |                       |
  |                       |-- 8. 充值 credits     |
  |<-- 9. 支付成功 --------|                       |
```

## 🔌 需要实现的后端API

### 1. 统一下单接口

```javascript
POST https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi

// 请求体
{
  "appid": "wx6f8828f74075acb4",
  "mchid": "你的商户号",
  "description": "充值50次对话",
  "out_trade_no": "ORDER1728567890xxx",
  "notify_url": "http://wenkexueai.com/api/pay/notify",
  "amount": {
    "total": 100,  // 单位：分
    "currency": "CNY"
  },
  "payer": {
    "openid": "用户的openid"
  }
}

// 响应
{
  "prepay_id": "wx20180101abcdefg"
}
```

### 2. 生成支付签名

```javascript
// 需要生成的参数
const paymentParams = {
  appId: WECHAT_APPID,
  timeStamp: Math.floor(Date.now() / 1000).toString(),
  nonceStr: generateRandomString(),
  package: `prepay_id=${prepay_id}`,
  signType: 'RSA',
  paySign: generateSignature(...)  // 使用商户私钥签名
};
```

### 3. 前端调起支付

```javascript
// 方式1：使用 WeixinJSBridge（推荐）
WeixinJSBridge.invoke(
  'getBrandWCPayRequest',
  {
    "appId": "wx6f8828f74075acb4",
    "timeStamp": "1234567890",
    "nonceStr": "randomstring",
    "package": "prepay_id=xxxxx",
    "signType": "RSA",
    "paySign": "xxxxx"
  },
  function(res) {
    if (res.err_msg == "get_brand_wcpay_request:ok") {
      alert('支付成功！');
    }
  }
);
```

## 📝 代码实现示例

### 完整的支付接口（server/index.js）

```javascript
// 需要安装: npm install node-rsa
import NodeRSA from 'node-rsa';
import fs from 'fs';

// 加载商户证书
const privateKey = fs.readFileSync('./cert/apiclient_key.pem', 'utf8');
const key = new NodeRSA(privateKey);

// 创建支付订单
async function createWxPayOrder(openId, priceKey) {
  const priceInfo = CREDIT_PRICE[priceKey];
  const orderNo = generateOrderNo();
  const timestamp = Math.floor(Date.now() / 1000);
  const nonceStr = generateRandomString(32);

  // 1. 调用微信统一下单接口
  const orderData = {
    appid: WECHAT_APPID,
    mchid: WX_MCHID,
    description: `充值${priceInfo.credits}次对话`,
    out_trade_no: orderNo,
    notify_url: `https://wenkexueai.com/api/pay/notify`,
    amount: {
      total: priceInfo.amount,
      currency: 'CNY'
    },
    payer: {
      openid: openId
    },
    attach: openId
  };

  // 2. 生成签名并请求
  const { prepay_id } = await callWxPayAPI('/v3/pay/transactions/jsapi', orderData);

  // 3. 生成前端调起支付所需的参数
  const payParams = {
    appId: WECHAT_APPID,
    timeStamp: timestamp.toString(),
    nonceStr: nonceStr,
    package: `prepay_id=${prepay_id}`,
    signType: 'RSA'
  };

  // 4. 生成 paySign
  const signStr = `${payParams.appId}\n${payParams.timeStamp}\n${payParams.nonceStr}\n${payParams.package}\n`;
  payParams.paySign = key.sign(signStr, 'base64');

  return {
    orderNo,
    payParams  // 返回给前端用于调起支付
  };
}

// 调用微信支付API
async function callWxPayAPI(path, data) {
  const url = `https://api.mch.weixin.qq.com${path}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const nonceStr = generateRandomString(32);
  const body = JSON.stringify(data);

  // 生成请求签名
  const signStr = `POST\n${path}\n${timestamp}\n${nonceStr}\n${body}\n`;
  const signature = key.sign(signStr, 'base64');

  // 构建 Authorization 头
  const authHeader = `WECHATPAY2-SHA256-RSA2048 mchid="${WX_MCHID}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timestamp}",serial_no="${WX_PAY_CERT_SERIAL}"`;

  // 发送请求
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
      'Accept': 'application/json'
    },
    body: body
  });

  return await response.json();
}
```

## 🧪 测试流程

### 1. 开发环境测试（无需真实支付）

```bash
# 测试充值接口
curl "http://wenkexueai.com/api/pay/test?openid=oXXXXX&credits=50"

# 响应
{
  "success": true,
  "message": "充值成功！+50 credits",
  "newBalance": 53
}
```

### 2. 微信支付沙箱测试

- 申请微信支付沙箱环境
- 使用沙箱商户号和密钥
- 使用测试 openid 进行测试

### 3. 生产环境上线

1. ✅ 配置真实商户号
2. ✅ 上传商户证书
3. ✅ 配置支付回调地址
4. ✅ 在微信商户平台配置白名单
5. ✅ 小额测试后正式上线

## 📊 用户命令

| 命令 | 功能 |
|------|------|
| `余额` | 查看剩余次数 |
| `充值` | 查看充值套餐 |
| `充值 1` | 选择套餐充值 |

## 🔍 监控和管理

### API 接口

```bash
# 查看统计数据
curl http://wenkexueai.com/api/stats

# 查看所有用户
curl http://wenkexueai.com/api/users

# 查看用户详情
curl http://wenkexueai.com/api/user/{openId}
```

### 日志查看

```bash
# 实时查看日志
pm2 logs wechat-server -f

# 查看支付相关日志
pm2 logs wechat-server | grep "支付"
```

## 🚨 注意事项

1. **安全性**
   - ✅ 支付回调必须验证签名
   - ✅ 订单号不可重复
   - ✅ 金额验证必须严格
   - ✅ OpenID 不可泄露

2. **证书管理**
   - 商户证书妥善保管
   - 定期更新证书
   - 不要提交到 git

3. **生产环境**
   - 使用 HTTPS
   - 配置域名白名单
   - 设置支付限额
   - 记录所有交易日志

4. **用户体验**
   - 支付失败友好提示
   - 支付超时自动取消
   - 到账即时通知

## 📚 参考文档

- [微信支付 JSAPI 文档](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_1.shtml)
- [微信支付签名算法](https://pay.weixin.qq.com/wiki/doc/apiv3/wechatpay/wechatpay4_0.shtml)
- [微信公众号 JS-SDK](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html)

## 🎯 当前状态

- ✅ Credit 系统已实现
- ✅ 支付页面已创建
- ✅ 测试充值接口已完成
- ⚠️ 需要配置微信商户号
- ⚠️ 需要实现真实支付API调用
- ⚠️ 需要添加支付签名验证

## 🔄 下一步

1. 申请微信商户号
2. 下载商户证书
3. 实现统一下单接口
4. 实现签名生成
5. 测试支付流程
6. 上线生产环境



