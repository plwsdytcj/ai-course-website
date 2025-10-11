import redisClient from './redis-client.js';

// 消息队列管理器
class MessageQueue {
  constructor(queueName = 'ai_requests') {
    this.queueName = queueName;
    this.processingQueue = `${queueName}:processing`;
  }

  // 添加任务到队列
  async push(task) {
    try {
      const taskId = `task:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
      const taskData = JSON.stringify({
        id: taskId,
        ...task,
        createdAt: Date.now()
      });
      
      await redisClient.lPush(this.queueName, taskData);
      console.log(`✓ 任务加入队列: ${taskId}`);
      return taskId;
    } catch (error) {
      console.error('队列PUSH失败:', error);
      return null;
    }
  }

  // 从队列获取任务
  async pop(timeout = 5) {
    try {
      const result = await redisClient.brPop(this.queueName, timeout);
      if (!result) return null;
      
      const taskData = JSON.parse(result.element);
      
      // 移动到处理队列
      await redisClient.hSet(this.processingQueue, taskData.id, result.element);
      
      return taskData;
    } catch (error) {
      console.error('队列POP失败:', error);
      return null;
    }
  }

  // 完成任务
  async complete(taskId) {
    try {
      await redisClient.hDel(this.processingQueue, taskId);
      console.log(`✓ 任务完成: ${taskId}`);
      return true;
    } catch (error) {
      console.error('任务完成标记失败:', error);
      return false;
    }
  }

  // 任务失败，重新入队
  async retry(taskId) {
    try {
      const taskData = await redisClient.hGet(this.processingQueue, taskId);
      if (taskData) {
        await redisClient.lPush(this.queueName, taskData);
        await redisClient.hDel(this.processingQueue, taskId);
        console.log(`⚠️ 任务重试: ${taskId}`);
      }
      return true;
    } catch (error) {
      console.error('任务重试失败:', error);
      return false;
    }
  }

  // 获取队列长度
  async length() {
    try {
      return await redisClient.lLen(this.queueName);
    } catch (error) {
      console.error('获取队列长度失败:', error);
      return 0;
    }
  }
}

// AI 请求队列
export const aiQueue = new MessageQueue('ai_requests');

// 支付回调队列
export const paymentQueue = new MessageQueue('payment_callbacks');

// Worker 进程 - 处理AI请求
export async function startAIWorker(workerCount = 4) {
  console.log(`🤖 启动 ${workerCount} 个 AI Worker...`);
  
  for (let i = 0; i < workerCount; i++) {
    processAIQueue(i);
  }
}

async function processAIQueue(workerId) {
  console.log(`Worker ${workerId} 启动`);
  
  while (true) {
    try {
      const task = await aiQueue.pop();
      
      if (!task) {
        continue; // 超时，继续等待
      }
      
      console.log(`Worker ${workerId} 处理任务: ${task.id}`);
      
      // 处理AI请求
      // const response = await callDeepSeekAPI(task.message);
      
      // 发送回复给用户
      // await sendCustomerMessage(task.openId, response);
      
      // 标记完成
      await aiQueue.complete(task.id);
      
    } catch (error) {
      console.error(`Worker ${workerId} 出错:`, error);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

export default MessageQueue;

