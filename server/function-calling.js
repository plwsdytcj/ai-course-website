// DeepSeek Function Calling 实现

// 定义可用的函数（工具）
export const availableFunctions = {
  // 查询余额
  getUserBalance: {
    name: 'getUserBalance',
    description: '查询用户的对话次数余额',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async (args, context) => {
      const userData = context.getUserData(context.openId);
      return {
        credits: userData?.credits || 0,
        messageCount: userData?.messageCount || 0
      };
    }
  },

  // 创建充值订单
  createRechargeOrder: {
    name: 'createRechargeOrder',
    description: '创建充值订单，用户想要充值对话次数时调用',
    parameters: {
      type: 'object',
      properties: {
        package: {
          type: 'string',
          enum: ['1', '5', '10'],
          description: '充值套餐：1（1元50次）、5（5元300次）、10（10元700次）'
        }
      },
      required: ['package']
    },
    handler: async (args, context) => {
      const priceKey = args.package;
      const order = await context.createWxPayOrder(context.openId, priceKey);
      return {
        orderNo: order.orderNo,
        amount: order.amount / 100,
        credits: order.credits,
        payUrl: order.payUrl
      };
    }
  },

  // 查询充值套餐
  getRechargePackages: {
    name: 'getRechargePackages',
    description: '获取可用的充值套餐列表',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async (args, context) => {
      return {
        packages: [
          { id: '1', price: 1, credits: 50, desc: '1元50次' },
          { id: '5', price: 5, credits: 300, desc: '5元300次' },
          { id: '10', price: 10, credits: 700, desc: '10元700次' }
        ]
      };
    }
  },

  // 查询支付历史
  getPaymentHistory: {
    name: 'getPaymentHistory',
    description: '查询用户的充值历史记录',
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: '返回最近几条记录，默认5条'
        }
      },
      required: []
    },
    handler: async (args, context) => {
      const userData = context.getUserData(context.openId);
      const history = userData?.paymentHistory || [];
      const limit = args.limit || 5;
      return {
        history: history.slice(-limit).reverse()
      };
    }
  }
};

// 构建Function Calling的tools配置
export function buildToolsConfig() {
  return Object.values(availableFunctions).map(func => ({
    type: 'function',
    function: {
      name: func.name,
      description: func.description,
      parameters: func.parameters
    }
  }));
}

// 执行函数调用
export async function executeFunctionCall(functionName, args, context) {
  const func = availableFunctions[functionName];
  
  if (!func) {
    throw new Error(`Unknown function: ${functionName}`);
  }
  
  try {
    const result = await func.handler(args, context);
    return result;
  } catch (error) {
    console.error(`执行函数 ${functionName} 失败:`, error);
    return { error: error.message };
  }
}

// 调用DeepSeek API（支持Function Calling）
export async function callDeepSeekWithTools(userMessage, context) {
  const https = await import('https');
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
  
  return new Promise((resolve, reject) => {
    const tools = buildToolsConfig();
    
    const requestData = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `你是一个智能AI助教。你可以使用以下工具帮助用户：
1. 查询余额和对话次数
2. 创建充值订单
3. 查询充值套餐
4. 查询充值历史

当用户询问相关信息时，优先使用工具函数获取准确数据。`
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      tools: tools,
      tool_choice: 'auto', // 让AI自动决定是否调用工具
      temperature: 0.7
    });

    const options = {
      hostname: 'api.deepseek.com',
      port: 443,
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Length': Buffer.byteLength(requestData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', async () => {
        try {
          const response = JSON.parse(data);
          
          // 检查是否需要调用函数
          const message = response.choices[0].message;
          
          if (message.tool_calls && message.tool_calls.length > 0) {
            // AI决定调用工具
            const toolCall = message.tool_calls[0];
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);
            
            console.log(`🔧 AI调用工具: ${functionName}`, functionArgs);
            
            // 执行函数
            const functionResult = await executeFunctionCall(
              functionName, 
              functionArgs, 
              context
            );
            
            // 将结果返回给AI，让AI生成最终回复
            const secondRequestData = JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                {
                  role: 'system',
                  content: '你是一个智能AI助教。根据工具返回的数据，用友好的方式回复用户。'
                },
                {
                  role: 'user',
                  content: userMessage
                },
                {
                  role: 'assistant',
                  content: null,
                  tool_calls: message.tool_calls
                },
                {
                  role: 'tool',
                  tool_call_id: toolCall.id,
                  content: JSON.stringify(functionResult)
                }
              ],
              temperature: 0.7
            });

            const secondReq = https.request(options, (secondRes) => {
              let secondData = '';
              secondRes.on('data', (chunk) => secondData += chunk);
              secondRes.on('end', () => {
                try {
                  const secondResponse = JSON.parse(secondData);
                  const finalReply = secondResponse.choices[0].message.content;
                  resolve(finalReply);
                } catch (error) {
                  reject(error);
                }
              });
            });

            secondReq.on('error', reject);
            secondReq.write(secondRequestData);
            secondReq.end();
            
          } else {
            // 直接返回AI回复（不需要调用工具）
            resolve(message.content);
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(requestData);
    req.end();
  });
}

export default {
  availableFunctions,
  buildToolsConfig,
  executeFunctionCall,
  callDeepSeekWithTools
};

