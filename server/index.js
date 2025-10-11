import 'dotenv/config';
import http from 'http';
import https from 'https';
import crypto from 'crypto';
import fs from 'fs';

const PORT = process.env.PORT || 3000;
const WECHAT_TOKEN = process.env.WX_TOKEN || '88005568';
const WECHAT_APPID = process.env.WX_APPID;
const WECHAT_APPSECRET = process.env.WX_APPSECRET;
const WECHAT_ENCODING_AES_KEY = process.env.WX_ENCODING_AES_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// 全局 access_token 缓存
let accessTokenCache = {
  token: null,
  expiresAt: 0
};
const WX_MCHID = process.env.WX_MCHID; // 微信商户号
const WX_PAY_KEY = process.env.WX_PAY_KEY; // 商户密钥
const WX_PAY_CERT_SERIAL = process.env.WX_PAY_CERT_SERIAL; // 证书序列号

// 加载商户私钥
let privateKey = null;
try {
  privateKey = fs.readFileSync('./cert/apiclient_key.pem', 'utf8');
  console.log('✓ 商户私钥加载成功');
} catch (error) {
  console.log('⚠️ 商户私钥未找到，支付功能将使用测试模式');
}

// Credit 价格配置
const CREDIT_PRICE = {
  '1': { amount: 100, credits: 50, desc: '1元50次' },    // 1元 = 50 credits
  '5': { amount: 500, credits: 300, desc: '5元300次' },   // 5元 = 300 credits (送50)
  '10': { amount: 1000, credits: 700, desc: '10元700次' }, // 10元 = 700 credits (送200)
};
const CREDIT_PER_MESSAGE = 1; // 每条消息消耗1个credit

// 用户数据存储（简单的内存存储，生产环境应使用数据库）
const userDataStore = new Map();

// 订单存储（临时存储订单和支付参数）
const orderStore = new Map();

// 保存或更新用户信息
function saveUserData(openId, data) {
  if (!userDataStore.has(openId)) {
    userDataStore.set(openId, {
      openId,
      credits: 3, // 新用户送3次免费体验
      firstSeenAt: new Date(),
      messageCount: 0,
      lastMessageAt: null,
      conversationHistory: [],
      paymentHistory: []
    });
  }
  
  const userData = userDataStore.get(openId);
  Object.assign(userData, data);
  if (!data.skipMessageCount) {
    userData.messageCount++;
  }
  userData.lastMessageAt = new Date();
  
  // 只保留最近10条对话历史
  if (userData.conversationHistory && userData.conversationHistory.length > 10) {
    userData.conversationHistory = userData.conversationHistory.slice(-10);
  }
  
  return userData;
}

// 获取用户信息
function getUserData(openId) {
  return userDataStore.get(openId);
}

// 扣除 credits
function deductCredits(openId, amount = CREDIT_PER_MESSAGE) {
  const userData = getUserData(openId);
  if (!userData) return false;
  
  if (userData.credits >= amount) {
    userData.credits -= amount;
    return true;
  }
  return false;
}

// 增加 credits
function addCredits(openId, amount) {
  const userData = saveUserData(openId, { skipMessageCount: true });
  userData.credits = (userData.credits || 0) + amount;
  return userData.credits;
}

// 检查用户是否有足够的 credits
function hasEnoughCredits(openId, amount = CREDIT_PER_MESSAGE) {
  const userData = getUserData(openId);
  return userData && userData.credits >= amount;
}

// 生成支付订单号
function generateOrderNo() {
  return 'ORDER' + Date.now() + Math.random().toString(36).substr(2, 9);
}

// 创建微信 JSAPI 支付订单（公众号内支付）
async function createWxPayOrder(openId, priceKey) {
  const priceInfo = CREDIT_PRICE[priceKey];
  if (!priceInfo) {
    throw new Error('无效的充值金额');
  }

  const orderNo = generateOrderNo();

  // 如果没有私钥，使用测试模式
  if (!privateKey) {
    console.log('⚠️ 使用测试模式（无商户私钥）');
    return {
      orderNo,
      amount: priceInfo.amount,
      credits: priceInfo.credits,
      openId: openId,
      payUrl: `http://wenkexueai.com/pay.html?order=${orderNo}&price=${priceKey}&openid=${openId}`,
      testMode: true
    };
  }

  try {
    // 构建支付参数（JSAPI 方式）
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
      attach: openId // 在回调中用来识别用户
    };

    console.log('📤 调用微信统一下单API...');
    
    // 调用微信支付统一下单接口
    const result = await callWeChatPayAPI('/v3/pay/transactions/jsapi', orderData);
    
    console.log('✅ 统一下单成功，prepay_id:', result.prepay_id);

    // 生成前端调起支付所需的参数
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = generateRandomString(32);
    const packageStr = `prepay_id=${result.prepay_id}`;
    
    // 生成 paySign
    const paySignStr = `${WECHAT_APPID}\n${timestamp}\n${nonceStr}\n${packageStr}\n`;
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(paySignStr);
    const paySign = sign.sign(privateKey, 'base64');

    const payParams = {
      appId: WECHAT_APPID,
      timeStamp: timestamp,
      nonceStr: nonceStr,
      package: packageStr,
      signType: 'RSA',
      paySign: paySign
    };

    // 保存订单和支付参数
    orderStore.set(orderNo, {
      orderNo,
      openId,
      priceKey,
      amount: priceInfo.amount,
      credits: priceInfo.credits,
      payParams,
      createTime: new Date(),
      status: 'pending'
    });

    return {
      orderNo,
      amount: priceInfo.amount,
      credits: priceInfo.credits,
      openId: openId,
      payParams: payParams,
      payUrl: `https://wenkexueai.com/pay.html?order=${orderNo}&price=${priceKey}&openid=${openId}`,
      testMode: false
    };
  } catch (error) {
    console.error('❌ 创建支付订单失败:', error);
    throw error;
  }
}

// 生成充值菜单
function getRechargeMenu() {
  let menu = '💰 充值套餐\n\n';
  Object.keys(CREDIT_PRICE).forEach(key => {
    const info = CREDIT_PRICE[key];
    menu += `${key}. ${info.desc}\n`;
  });
  menu += '\n回复数字选择套餐\n例如：充值 1';
  return menu;
}

// 生成随机字符串
function generateRandomString(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 生成微信支付签名
function generatePaymentSignature(method, url, timestamp, nonce, body) {
  const signStr = `${method}\n${url}\n${timestamp}\n${nonce}\n${body}\n`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signStr);
  return sign.sign(privateKey, 'base64');
}

// 构建 Authorization 头
function buildAuthorizationHeader(method, url, body) {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = generateRandomString(32);
  const signature = generatePaymentSignature(method, url, timestamp, nonce, body);
  
  return `WECHATPAY2-SHA256-RSA2048 mchid="${WX_MCHID}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="${WX_PAY_CERT_SERIAL}"`;
}

// 调用微信支付 API
async function callWeChatPayAPI(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const authorization = buildAuthorizationHeader('POST', path, body);
    
    const options = {
      hostname: 'api.mch.weixin.qq.com',
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authorization,
        'User-Agent': 'Mozilla/5.0'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(responseData);
          if (res.statusCode === 200) {
            resolve(jsonResponse);
          } else {
            console.error('微信支付API错误:', jsonResponse);
            reject(new Error(jsonResponse.message || '支付接口调用失败'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(body);
    req.end();
  });
}

// 验证签名
function verifySignature(signature, timestamp, nonce) {
  const expected = crypto
    .createHash('sha1')
    .update([WECHAT_TOKEN, timestamp, nonce].sort().join(''))
    .digest('hex');
  return expected === signature;
}

// 解析XML消息
function parseXML(xml) {
  const result = {};
  const regex = /<(\w+)><!?\[CDATA\[(.*?)\]\]><\/\1>|<(\w+)>(.*?)<\/\3>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const key = match[1] || match[3];
    const value = match[2] || match[4];
    result[key] = value;
  }
  return result;
}

// 构建回复的XML消息
function buildReplyXML(toUser, fromUser, content) {
  const timestamp = Math.floor(Date.now() / 1000);
  return `<xml>
  <ToUserName><![CDATA[${toUser}]]></ToUserName>
  <FromUserName><![CDATA[${fromUser}]]></FromUserName>
  <CreateTime>${timestamp}</CreateTime>
  <MsgType><![CDATA[text]]></MsgType>
  <Content><![CDATA[${content}]]></Content>
</xml>`;
}

// 构建图文消息XML
function buildNewsReplyXML(toUser, fromUser, articles) {
  const timestamp = Math.floor(Date.now() / 1000);
  const articlesXML = articles.map(article => `
    <item>
      <Title><![CDATA[${article.title}]]></Title>
      <Description><![CDATA[${article.description}]]></Description>
      <PicUrl><![CDATA[${article.picUrl}]]></PicUrl>
      <Url><![CDATA[${article.url}]]></Url>
    </item>`).join('');
  
  return `<xml>
  <ToUserName><![CDATA[${toUser}]]></ToUserName>
  <FromUserName><![CDATA[${fromUser}]]></FromUserName>
  <CreateTime>${timestamp}</CreateTime>
  <MsgType><![CDATA[news]]></MsgType>
  <ArticleCount>${articles.length}</ArticleCount>
  <Articles>${articlesXML}
  </Articles>
</xml>`;
}

// 获取微信 access_token
async function getAccessToken() {
  // 检查缓存是否有效
  if (accessTokenCache.token && Date.now() < accessTokenCache.expiresAt) {
    return accessTokenCache.token;
  }

  return new Promise((resolve, reject) => {
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_APPID}&secret=${WECHAT_APPSECRET}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.access_token) {
            // 缓存 token（提前5分钟过期）
            accessTokenCache.token = result.access_token;
            accessTokenCache.expiresAt = Date.now() + (result.expires_in - 300) * 1000;
            console.log('✓ 获取 access_token 成功');
            resolve(result.access_token);
          } else {
            console.error('获取 access_token 失败:', result);
            reject(new Error(result.errmsg || '获取失败'));
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// 发送客服消息（主动推送给用户）
async function sendCustomerMessage(openId, content) {
  try {
    const accessToken = await getAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${accessToken}`;
    
    const messageData = JSON.stringify({
      touser: openId,
      msgtype: 'text',
      text: {
        content: content
      }
    });

    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(messageData)
        }
      };

      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.errcode === 0) {
              console.log(`✓ 客服消息发送成功: ${openId}`);
              resolve(true);
            } else {
              console.error('发送客服消息失败:', result);
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
    console.error('发送客服消息出错:', error);
    return false;
  }
}

// 调用 DeepSeek API
async function callDeepSeekAPI(userMessage) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个AI文科生课程的助教，专注于帮助学生理解人工智能相关知识。回答要友好、简洁、准确。'
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const options = {
      hostname: 'api.deepseek.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(responseData);
          if (jsonResponse.choices && jsonResponse.choices[0]) {
            const reply = jsonResponse.choices[0].message.content;
            resolve(reply);
          } else {
            reject(new Error('Invalid API response'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// 将 Markdown 转换为微信文本格式
function markdownToWechatText(markdown) {
  let text = markdown;
  
  // 移除代码块标记
  text = text.replace(/```[\s\S]*?```/g, (match) => {
    return match.replace(/```\w*\n?/g, '').replace(/```/g, '');
  });
  
  // 移除行内代码标记
  text = text.replace(/`([^`]+)`/g, '$1');
  
  // 转换标题
  text = text.replace(/^#{1,6}\s+(.+)$/gm, '\n【$1】\n');
  
  // 转换粗体
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');
  text = text.replace(/__(.+?)__/g, '$1');
  
  // 转换斜体
  text = text.replace(/\*(.+?)\*/g, '$1');
  text = text.replace(/_(.+?)_/g, '$1');
  
  // 转换列表
  text = text.replace(/^\s*[-*+]\s+/gm, '• ');
  text = text.replace(/^\s*\d+\.\s+/gm, (match) => match);
  
  // 移除多余的空行
  text = text.replace(/\n{3,}/g, '\n\n');
  
  return text.trim();
}

// 处理文本消息 - 使用 DeepSeek AI 回复
async function handleTextMessage(text) {
  try {
    // 调用 DeepSeek API
    const aiResponse = await callDeepSeekAPI(text);
    
    // 转换 Markdown 为微信文本格式
    const wechatText = markdownToWechatText(aiResponse);
    
    return wechatText;
  } catch (error) {
    console.error('DeepSeek API 调用失败:', error);
    return '抱歉，我现在有点忙，请稍后再试~';
  }
}

// 处理图片消息
async function handleImageMessage(picUrl, mediaId) {
  try {
    console.log(`收到图片: ${picUrl}`);
    
    // 使用 AI 生成关于图片的回复
    const prompt = `用户发送了一张图片。请以AI助教的身份，友好地回复用户。可以：
1. 表示收到了图片
2. 询问用户想了解什么或需要什么帮助
3. 提示如果有关于图片的具体问题可以用文字描述

回复要简短、友好。`;
    
    const aiResponse = await callDeepSeekAPI(prompt);
    const wechatText = markdownToWechatText(aiResponse);
    
    return wechatText;
  } catch (error) {
    console.error('处理图片消息失败:', error);
    return '📷 收到你的图片了！\n\n有什么关于图片的问题吗？请用文字描述，我会尽力帮你解答~';
  }
}

// 处理语音消息
function handleVoiceMessage(recognition) {
  if (recognition) {
    // 如果微信识别了语音内容，当作文本处理
    return handleTextMessage(recognition);
  }
  return '🎤 收到你的语音了！不过我暂时只能处理文字消息哦，请用文字告诉我你的问题~';
}

// 处理事件消息（关注、取消关注等）
function handleEvent(message) {
  if (message.Event === 'subscribe') {
    const openId = message.FromUserName;
    // 确保新用户有免费次数
    saveUserData(openId, {});
    return '👋 欢迎关注AI文科生课程！\n\n🎁 新用户福利：免费体验 3 次对话\n\n我是你的AI助教，可以回答关于人工智能、课程内容、学习方法等各种问题。\n\n💡 实用命令：\n• 余额 - 查看剩余次数\n• 充值 - 查看充值套餐\n\n直接发送问题即可开始对话~';
  }
  if (message.Event === 'unsubscribe') {
    return ''; // 取消关注无需回复
  }
  return '感谢您的操作';
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // 处理微信服务器验证（GET）
  if (req.method === 'GET' && url.pathname === '/wechat') {
    const signature = url.searchParams.get('signature') || '';
    const timestamp = url.searchParams.get('timestamp') || '';
    const nonce = url.searchParams.get('nonce') || '';
    const echostr = url.searchParams.get('echostr') || '';

    if (verifySignature(signature, timestamp, nonce)) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(echostr);
      console.log('✓ 微信服务器验证成功');
    } else {
      res.writeHead(401, { 'Content-Type': 'text/plain' });
      res.end('invalid signature');
      console.log('✗ 微信服务器验证失败');
    }
    return;
  }

  // 处理用户消息（POST）
  if (req.method === 'POST' && url.pathname === '/wechat') {
    const signature = url.searchParams.get('signature') || '';
    const timestamp = url.searchParams.get('timestamp') || '';
    const nonce = url.searchParams.get('nonce') || '';

    // 验证签名
    if (!verifySignature(signature, timestamp, nonce)) {
      res.writeHead(401, { 'Content-Type': 'text/plain' });
      res.end('invalid signature');
      console.log('✗ 消息签名验证失败');
      return;
    }

    // 接收POST数据
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        // 解析XML消息
        const message = parseXML(body);
        console.log('收到消息:', message);

        // 获取用户信息
        const userOpenId = message.FromUserName;  // 用户的 OpenID
        const publicAccountId = message.ToUserName; // 公众号的原始ID
        const msgId = message.MsgId; // 消息ID
        const createTime = message.CreateTime; // 消息创建时间
        
        console.log(`\n👤 用户信息:`);
        console.log(`   OpenID: ${userOpenId}`);
        console.log(`   消息ID: ${msgId || '无'}`);
        console.log(`   时间: ${createTime ? new Date(createTime * 1000).toLocaleString('zh-CN') : '无'}`);

        // 获取或创建用户数据
        let userData = getUserData(userOpenId);
        if (!userData) {
          console.log(`   🆕 新用户`);
        } else {
          console.log(`   📊 历史消息数: ${userData.messageCount}`);
        }

        // 根据消息类型和内容路由到不同的处理函数
        let replyContent = '';
        
        if (message.MsgType === 'text') {
          // 文本消息
          const userText = message.Content.trim();
          console.log(`📝 用户问: ${userText}`);
          
          // 处理特殊命令
          if (userText === '余额' || userText === '查询余额') {
            userData = userData || getUserData(userOpenId) || saveUserData(userOpenId, {});
            replyContent = `💳 您的余额\n\n剩余次数：${userData.credits || 0} 次\n累计对话：${userData.messageCount || 0} 次\n\n回复"充值"查看充值套餐`;
          } else if (userText === '充值' || userText === '购买') {
            replyContent = getRechargeMenu();
          } else if (userText.startsWith('充值 ')) {
            const priceKey = userText.replace('充值 ', '').trim();
            try {
              const order = await createWxPayOrder(userOpenId, priceKey);
              // 使用图文消息返回支付链接
              const replyMsg = buildNewsReplyXML(
                message.FromUserName,  // 发给用户
                message.ToUserName,    // 来自公众号
                [{
                  title: `💰 充值订单已创建`,
                  description: `套餐：${CREDIT_PRICE[priceKey].desc}\n金额：${order.amount / 100}元\n点击卡片立即支付`,
                  picUrl: 'https://wenkexueai.com/pay-icon.png',
                  url: order.payUrl
                }]
              );
              res.writeHead(200, { 'Content-Type': 'application/xml' });
              res.end(replyMsg);
              console.log(`✓ 已发送充值订单图文消息: ${CREDIT_PRICE[priceKey].desc}`);
              return; // 直接返回，不继续执行后面的代码
            } catch (error) {
              replyContent = '❌ 创建订单失败\n\n' + getRechargeMenu();
            }
          } else {
            // 普通对话 - 检查 credit
            if (!hasEnoughCredits(userOpenId)) {
              userData = userData || getUserData(userOpenId) || saveUserData(userOpenId, {});
              replyContent = `😊 您的次数已用完\n\n当前剩余：${userData.credits || 0} 次\n\n${getRechargeMenu()}`;
            } else {
              // 扣费并回复
              deductCredits(userOpenId);
              
              // 保存用户消息到历史
              userData = saveUserData(userOpenId, {
                conversationHistory: [
                  ...(userData?.conversationHistory || []),
                  { role: 'user', content: userText, time: new Date() }
                ]
              });
              
              replyContent = await handleTextMessage(userText);
              
              // 在回复中显示剩余次数
              const remainingCredits = userData.credits;
              replyContent += `\n\n💡 剩余${remainingCredits}次`;
              
              // 保存AI回复到历史
              saveUserData(userOpenId, {
                conversationHistory: [
                  ...userData.conversationHistory,
                  { role: 'assistant', content: replyContent, time: new Date() }
                ]
              });
            }
          }
        } else if (message.MsgType === 'image') {
          // 图片消息
          console.log(`📷 收到图片消息`);
          replyContent = await handleImageMessage(message.PicUrl, message.MediaId);
        } else if (message.MsgType === 'voice') {
          // 语音消息
          console.log(`🎤 收到语音消息`);
          replyContent = await handleVoiceMessage(message.Recognition);
        } else if (message.MsgType === 'video' || message.MsgType === 'shortvideo') {
          // 视频消息
          console.log(`🎬 收到视频消息`);
          replyContent = '🎬 收到你的视频了！\n\n目前我只能处理文字消息，有什么问题请用文字告诉我~';
        } else if (message.MsgType === 'location') {
          // 位置消息
          console.log(`📍 收到位置消息`);
          replyContent = `📍 收到你的位置了！\n\n${message.Label || '地理位置'}\n\n有什么我能帮你的吗？`;
        } else if (message.MsgType === 'link') {
          // 链接消息
          console.log(`🔗 收到链接消息`);
          replyContent = `🔗 收到你分享的链接了！\n\n有什么想讨论的吗？`;
        } else if (message.MsgType === 'event') {
          // 事件消息
          replyContent = handleEvent(message);
        } else {
          replyContent = '暂不支持该消息类型，请发送文字消息~';
        }

        // 构建回复消息
        const replyMsg = buildReplyXML(
          message.FromUserName,  // 发给用户
          message.ToUserName,    // 来自公众号
          replyContent
        );

        res.writeHead(200, { 'Content-Type': 'application/xml' });
        res.end(replyMsg);
        console.log(`✓ AI回复: ${replyContent.substring(0, 100)}${replyContent.length > 100 ? '...' : ''}`);
      } catch (error) {
        console.error('处理消息出错:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('error');
      }
    });
    return;
  }

  // 支付回调接口
  if (req.method === 'POST' && url.pathname === '/api/pay/notify') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        // 解析支付回调数据
        const callbackData = JSON.parse(body);
        console.log('收到支付回调:', callbackData);

        // 解密支付数据
        let paymentData = null;
        if (callbackData.resource && callbackData.resource.ciphertext) {
          // 微信支付回调数据是加密的，需要解密
          const { ciphertext, nonce, associated_data } = callbackData.resource;
          
          // 解密数据
          const ciphertextBuffer = Buffer.from(ciphertext, 'base64');
          const authTag = ciphertextBuffer.slice(-16); // 最后16字节是认证标签
          const encryptedData = ciphertextBuffer.slice(0, -16); // 前面的是密文
          
          const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            WX_PAY_KEY,
            nonce
          );
          
          decipher.setAuthTag(authTag);
          decipher.setAAD(Buffer.from(associated_data));
          
          let decrypted = decipher.update(encryptedData, null, 'utf8');
          decrypted += decipher.final('utf8');
          
          paymentData = JSON.parse(decrypted);
          console.log('解密后的支付数据:', paymentData);
        } else {
          // 如果没有加密（测试环境可能会遇到）
          paymentData = callbackData;
        }

        // TODO: 验证签名（生产环境必须）
        
        // 提取订单信息
        const orderNo = paymentData.out_trade_no;
        const openId = paymentData.attach; // 需要在创建订单时传入
        const amount = paymentData.amount?.total;
        
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
          console.log(`✓ 充值成功: ${openId} +${credits} credits, 新余额: ${newBalance}`);
          
          // 记录支付历史
          const userData = getUserData(openId);
          if (userData) {
            userData.paymentHistory = userData.paymentHistory || [];
            userData.paymentHistory.push({
              orderNo,
              amount: amount / 100,
              credits,
              time: new Date()
            });
          }

          // 主动推送充值成功消息给用户
          const successMessage = `🎉 充值成功！

💰 充值金额：${(amount / 100).toFixed(2)}元
✨ 到账次数：+${credits}次
📊 当前余额：${newBalance}次

感谢您的支持！继续和我聊天吧~
回复"余额"查看详情`;

          // 异步发送消息（不阻塞回调响应）
          sendCustomerMessage(openId, successMessage).catch(err => {
            console.error('发送充值成功消息失败:', err);
          });
        }

        // 返回成功响应给微信
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 'SUCCESS', message: '成功' }));
      } catch (error) {
        console.error('处理支付回调失败:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ code: 'FAIL', message: '处理失败' }));
      }
    });
    return;
  }

  // 模拟支付测试接口
  // 获取支付参数接口
  if (req.method === 'GET' && url.pathname.startsWith('/api/pay/params/')) {
    const orderNo = url.pathname.split('/').pop();
    const orderInfo = orderStore.get(orderNo);
    
    if (orderInfo) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        orderNo: orderInfo.orderNo,
        amount: orderInfo.amount,
        credits: orderInfo.credits,
        payParams: orderInfo.payParams
      }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, message: '订单不存在' }));
    }
    return;
  }

  // 测试充值接口（开发调试用）
  if (req.method === 'GET' && url.pathname === '/api/pay/test') {
    const openId = url.searchParams.get('openid');
    const credits = parseInt(url.searchParams.get('credits')) || 50;
    
    if (openId) {
      const newBalance = addCredits(openId, credits);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ 
        success: true, 
        message: `充值成功！+${credits} credits`,
        newBalance 
      }));
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, message: '缺少openid参数' }));
    }
    return;
  }

  // 管理API - 获取所有用户列表
  if (req.method === 'GET' && url.pathname === '/api/users') {
    const users = Array.from(userDataStore.values()).map(user => ({
      openId: user.openId.substring(0, 10) + '***', // 隐藏部分openId
      messageCount: user.messageCount,
      firstSeenAt: user.firstSeenAt,
      lastMessageAt: user.lastMessageAt,
      conversationCount: user.conversationHistory.length
    }));
    
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      total: users.length,
      users: users
    }, null, 2));
    return;
  }

  // 管理API - 获取用户详细信息
  if (req.method === 'GET' && url.pathname.startsWith('/api/user/')) {
    const openId = url.pathname.replace('/api/user/', '');
    const user = getUserData(openId);
    
    if (user) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(user, null, 2));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '用户不存在' }));
    }
    return;
  }

  // 管理API - 统计数据
  if (req.method === 'GET' && url.pathname === '/api/stats') {
    const totalUsers = userDataStore.size;
    const totalMessages = Array.from(userDataStore.values())
      .reduce((sum, user) => sum + user.messageCount, 0);
    
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      totalUsers,
      totalMessages,
      averageMessagesPerUser: totalUsers > 0 ? (totalMessages / totalUsers).toFixed(2) : 0
    }, null, 2));
    return;
  }

  res.statusCode = 404;
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`WeChat server running on http://localhost:${PORT}`);
  console.log(`Configuration loaded:`);
  console.log(`- AppID: ${WECHAT_APPID ? '✓' : '✗'}`);
  console.log(`- AppSecret: ${WECHAT_APPSECRET ? '✓' : '✗'}`);
  console.log(`- Token: ${WECHAT_TOKEN ? '✓' : '✗'}`);
  console.log(`- EncodingAESKey: ${WECHAT_ENCODING_AES_KEY ? '✓' : '✗'}`);
  console.log(`- DeepSeek API: ${DEEPSEEK_API_KEY ? '✓' : '✗'}`);
  console.log(`\n🤖 AI助教已就绪！`);
  console.log(`\n支持的消息类型：`);
  console.log(`  📝 文字 - AI智能回复`);
  console.log(`  📷 图片 - AI友好回复`);
  console.log(`  🎤 语音 - 支持语音识别转文字`);
  console.log(`  🎬 视频 - 提示用文字描述`);
  console.log(`  📍 位置 - 接收并回复`);
  console.log(`  🔗 链接 - 接收并回复`);
  console.log(`\n📊 管理 API 接口：`);
  console.log(`  GET  /api/stats - 查看统计数据`);
  console.log(`  GET  /api/users - 查看所有用户列表`);
  console.log(`  GET  /api/user/{openId} - 查看用户详细信息`);
});


