import { createClient } from 'redis';

// 创建 Redis 客户端
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  password: process.env.REDIS_PASSWORD,
  database: 0
});

// 连接错误处理
redisClient.on('error', (err) => {
  console.error('Redis 连接错误:', err);
});

redisClient.on('ready', () => {
  console.log('✓ Redis 连接成功');
});

// 连接 Redis
await redisClient.connect();

// 用户数据操作
export const UserRedis = {
  // 获取用户数据
  async get(openId) {
    try {
      const data = await redisClient.get(`user:${openId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis GET 失败:', error);
      return null;
    }
  },

  // 保存用户数据
  async set(openId, data) {
    try {
      await redisClient.set(
        `user:${openId}`,
        JSON.stringify(data),
        { EX: 7 * 24 * 60 * 60 } // 7天过期
      );
      return true;
    } catch (error) {
      console.error('Redis SET 失败:', error);
      return false;
    }
  },

  // 增加 credits
  async addCredits(openId, amount) {
    try {
      const current = await redisClient.hIncrBy(`user:${openId}`, 'credits', amount);
      return current;
    } catch (error) {
      console.error('Redis HINCRBY 失败:', error);
      return null;
    }
  },

  // 扣除 credits
  async deductCredits(openId, amount = 1) {
    try {
      const current = await redisClient.hIncrBy(`user:${openId}`, 'credits', -amount);
      return current;
    } catch (error) {
      console.error('Redis HINCRBY 失败:', error);
      return null;
    }
  },

  // 获取 credits
  async getCredits(openId) {
    try {
      const credits = await redisClient.hGet(`user:${openId}`, 'credits');
      return parseInt(credits) || 0;
    } catch (error) {
      console.error('Redis HGET 失败:', error);
      return 0;
    }
  }
};

// Access Token 缓存
export const TokenRedis = {
  async get() {
    try {
      const token = await redisClient.get('wechat:access_token');
      return token;
    } catch (error) {
      console.error('Redis GET token 失败:', error);
      return null;
    }
  },

  async set(token, expiresIn = 7200) {
    try {
      await redisClient.set('wechat:access_token', token, {
        EX: expiresIn - 300 // 提前5分钟过期
      });
      return true;
    } catch (error) {
      console.error('Redis SET token 失败:', error);
      return false;
    }
  }
};

// 订单存储
export const OrderRedis = {
  async set(orderNo, data) {
    try {
      await redisClient.set(
        `order:${orderNo}`,
        JSON.stringify(data),
        { EX: 30 * 60 } // 30分钟过期
      );
      return true;
    } catch (error) {
      console.error('Redis SET order 失败:', error);
      return false;
    }
  },

  async get(orderNo) {
    try {
      const data = await redisClient.get(`order:${orderNo}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis GET order 失败:', error);
      return null;
    }
  }
};

// 限流（防止滥用）
export const RateLimiter = {
  async check(openId, limit = 10, window = 60) {
    try {
      const key = `rate:${openId}`;
      const count = await redisClient.incr(key);
      
      if (count === 1) {
        await redisClient.expire(key, window);
      }
      
      return count <= limit;
    } catch (error) {
      console.error('Rate limit 检查失败:', error);
      return true; // 出错时放行
    }
  }
};

export default redisClient;

