# 微信模板消息集成指南

## 📋 什么是模板消息

模板消息是微信公众号提供的主动推送消息能力，适用于：
- 支付成功通知 ✅
- 订单状态更新 ✅
- 预约提醒 ✅
- 审核结果通知 ✅

## 🆚 客服消息 vs 模板消息

| 特性 | 客服消息 | 模板消息 |
|------|---------|---------|
| **时间限制** | 48小时内有互动 | 支付等场景无限制 |
| **消息格式** | 自定义文本 | 固定模板 |
| **使用场景** | 客服回复 | 通知提醒 |
| **跳转链接** | ❌ 不支持 | ✅ 支持 |
| **权限要求** | 默认开通 | 需申请开通 |

## 📝 如何开通模板消息

### 1. 登录微信公众平台

访问：https://mp.weixin.qq.com/

### 2. 添加消息模板

**路径**：功能 → 模板消息 → 模板库 → 选择模板

**推荐模板**：
- 充值成功通知
- 订单支付成功通知
- 余额变动提醒

### 3. 获取模板ID

添加后会得到一个模板ID，如：
```
TEMPLATE_ID: TM00001
```

### 4. 配置到 .env 文件

```bash
# 模板消息ID
WX_TEMPLATE_RECHARGE_SUCCESS=TM00001
```

## 💻 代码实现

### 发送模板消息函数

```javascript
// 发送模板消息
async function sendTemplateMessage(openId, templateId, data, url = '') {
  try {
    const accessToken = await getAccessToken();
    const apiUrl = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${accessToken}`;
    
    const messageData = JSON.stringify({
      touser: openId,
      template_id: templateId,
      url: url, // 点击消息跳转的URL
      data: data
    });

    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(messageData)
        }
      };

      const req = https.request(apiUrl, options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            if (result.errcode === 0) {
              console.log(`✓ 模板消息发送成功: ${openId}`);
              resolve(true);
            } else {
              console.error('发送模板消息失败:', result);
              reject(new Error(result.errmsg || '发送失败'));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.write(messageData);
      req.end();
    });
  } catch (error) {
    console.error('发送模板消息出错:', error);
    return false;
  }
}
```

### 支付成功通知

```javascript
// 充值成功后发送模板消息
async function sendRechargeSuccessNotice(openId, amount, credits, balance) {
  const templateId = process.env.WX_TEMPLATE_RECHARGE_SUCCESS;
  
  const data = {
    first: {
      value: '您的充值已成功！',
      color: '#173177'
    },
    keyword1: {
      value: `${(amount / 100).toFixed(2)}元`,
      color: '#173177'
    },
    keyword2: {
      value: `+${credits}次对话`,
      color: '#173177'
    },
    keyword3: {
      value: new Date().toLocaleString('zh-CN'),
      color: '#173177'
    },
    remark: {
      value: `\n当前余额：${balance}次\n感谢您的支持！`,
      color: '#FF6B6B'
    }
  };

  await sendTemplateMessage(
    openId, 
    templateId, 
    data,
    'https://wenkexueai.com' // 点击跳转地址
  );
}
```

### 在支付回调中使用

```javascript
// 支付回调处理
if (credits > 0 && openId) {
  const newBalance = addCredits(openId, credits);
  
  // 发送模板消息（推荐）
  await sendRechargeSuccessNotice(openId, amount, credits, newBalance);
  
  // 或者发送客服消息（当前实现）
  // await sendCustomerMessage(openId, '充值成功...');
}
```

## 🎨 模板消息示例

### 充值成功通知

```
【AI课程助手】
您的充值已成功！

充值金额：1.00元
到账次数：+50次对话
充值时间：2025-10-11 10:30:00

当前余额：53次
感谢您的支持！

[点击详情]
```

### 余额不足提醒

```
【AI课程助手】
您的余额不足提醒

当前余额：2次
建议充值：1元50次

回复"充值"查看套餐

[立即充值]
```

## 🔐 权限说明

### 认证服务号

✅ 默认有模板消息权限
✅ 可发送所有类型模板

### 未认证订阅号

❌ 无模板消息权限
✅ 只能用客服消息（48小时限制）

## ⚠️ 注意事项

1. **不能滥用**
   - 禁止营销推广
   - 禁止垃圾消息
   - 禁止频繁发送

2. **用户体验**
   - 只在必要时发送
   - 内容简洁明了
   - 提供取消订阅选项

3. **发送频率**
   - 建议每天不超过3条
   - 重要通知才发送

## 📊 最佳实践

### 适合发送模板消息的场景

✅ 支付成功通知
✅ 订单状态变更
✅ 预约提醒（提前24小时）
✅ 审核结果通知
✅ 账户余额预警

### 不适合的场景

❌ 营销广告
❌ 促销活动（除非用户订阅）
❌ 问候消息
❌ 无关内容

## 🚀 升级路径

### 阶段1：客服消息（当前）
- ✅ 简单快速
- ✅ 适合开发测试
- ⚠️ 有48小时限制

### 阶段2：模板消息
- 🌟 支付场景无时间限制
- 🌟 格式统一，用户信任
- 🌟 可以带跳转链接

### 阶段3：订阅消息（小程序）
- 🔥 用户主动订阅
- 🔥 支持定时提醒
- 🔥 功能最强大

## 📞 技术支持

- **微信公众平台**: https://mp.weixin.qq.com/
- **开发文档**: https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Template_Message_Interface.html

