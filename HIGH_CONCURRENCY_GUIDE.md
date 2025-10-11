# 高并发架构优化指南

## 📊 当前架构 vs 高并发架构

### 当前架构（处理能力：~100 QPS）

```
用户 → Nginx → Node.js单进程 → 内存存储
                    ↓
                DeepSeek API
```

### 高并发架构（处理能力：~10,000+ QPS）

```
                     ┌→ Node.js进程1 ┐
用户 → CDN → Nginx → ├→ Node.js进程2 ├→ Redis集群
                     ├→ Node.js进程3 │
                     └→ Node.js进程4 ┘
                            ↓
                       消息队列
                            ↓
                    ┌→ AI Worker 1 ┐
                    ├→ AI Worker 2 ├→ DeepSeek API
                    ├→ AI Worker 3 │
                    └→ AI Worker 4 ┘
```

---

## 🚀 优化方案（按优先级）

### 阶段1：快速优化（1-2天）⚡

#### 1.1 PM2 Cluster 模式

**当前：**
```bash
pm2 start server/index.js --name wechat-server
# 单进程，只用1个CPU核心
```

**优化后：**
```bash
pm2 start ecosystem.config.js
# 多进程，用满所有CPU核心
```

**效果：**
- ✅ 并发能力提升 4-8倍
- ✅ CPU利用率从 25% → 100%
- ✅ 无需修改代码

**执行：**
```bash
cd /home/admin/0801/0802/ai-course-website

# 停止当前进程
pm2 delete wechat-server

# 使用cluster模式启动
pm2 start ecosystem.config.js

# 查看状态（应该看到多个进程）
pm2 status

# 保存
pm2 save
```

**预期效果：**
```
┌─────┬────────────────┬─────────┬──────┐
│ id  │ name           │ mode    │ cpu  │
├─────┼────────────────┼─────────┼──────┤
│ 0   │ wechat-server  │ cluster │ 25%  │
│ 1   │ wechat-server  │ cluster │ 25%  │
│ 2   │ wechat-server  │ cluster │ 25%  │
│ 3   │ wechat-server  │ cluster │ 25%  │
└─────┴────────────────┴─────────┴──────┘
```

---

#### 1.2 Nginx 限流配置

**防止DDoS和滥用：**

```nginx
# 添加到 nginx 配置
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /wechat {
    limit_req zone=api_limit burst=20 nodelay;
    # ... 其他配置
}
```

**执行：**
```bash
# 备份当前配置
sudo cp /etc/nginx/sites-available/ai-course-website /etc/nginx/sites-available/ai-course-website.bak

# 替换为高并发配置
sudo cp nginx-high-concurrency.conf /etc/nginx/sites-available/ai-course-website

# 测试配置
sudo nginx -t

# 重载
sudo systemctl reload nginx
```

**效果：**
- ✅ 防止单IP攻击
- ✅ 保护后端服务
- ✅ 每秒限制10个请求/IP

---

### 阶段2：Redis集成（2-3天）🔥

#### 2.1 安装 Redis

```bash
# 安装 Redis
sudo apt update
sudo apt install redis-server -y

# 启动 Redis
sudo systemctl start redis
sudo systemctl enable redis

# 测试
redis-cli ping
# 应该返回：PONG
```

#### 2.2 安装 Redis 客户端

```bash
cd /home/admin/0801/0802/ai-course-website
npm install redis
```

#### 2.3 修改代码使用 Redis

**修改 server/index.js：**

```javascript
// 替换内存存储
import { UserRedis, TokenRedis, OrderRedis } from './server/redis-client.js';

// 之前
const userDataStore = new Map();

// 之后
// 使用 UserRedis.get(), UserRedis.set()
```

**效果：**
- ✅ 数据持久化
- ✅ 多进程共享数据
- ✅ 支持集群扩展
- ✅ 重启不丢数据

---

### 阶段3：消息队列（3-5天）🎯

#### 3.1 为什么需要消息队列？

**问题：**
```javascript
// 当前：同步处理，阻塞
app.post('/wechat', async (req, res) => {
  const aiResponse = await callDeepSeekAPI(message);  // 等待3-5秒
  res.end(buildReply(aiResponse));
});
```

**后果：**
- 并发10个请求 = 10个进程全部阻塞
- AI响应慢 = 整个服务慢
- 微信可能超时（5秒）

**解决方案：**
```javascript
// 优化后：异步处理，立即响应
app.post('/wechat', async (req, res) => {
  // 1. 立即回复"正在处理"
  res.end(buildReply('正在思考中...'));
  
  // 2. 任务加入队列
  await aiQueue.push({ openId, message });
  
  // 3. Worker异步处理 + 主动推送结果
});
```

#### 3.2 使用消息队列

```bash
# 安装依赖（已包含在redis中）
npm install redis

# 启动Worker进程
pm2 start server/ai-worker.js --name ai-worker -i 4
```

**效果：**
- ✅ 请求立即返回
- ✅ AI处理不阻塞
- ✅ 自动重试失败任务
- ✅ 吞吐量提升10倍+

---

### 阶段4：数据库优化（长期）💾

#### 4.1 迁移到 MySQL/PostgreSQL

**为什么？**
- Redis适合缓存，不适合复杂查询
- 需要查询支付历史、统计数据
- 需要ACID事务保证

**架构：**
```
Redis（热数据，缓存） + MySQL（持久化，复杂查询）
```

#### 4.2 连接池优化

```javascript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'wechat',
  connectionLimit: 100,  // 连接池大小
  waitForConnections: true,
  queueLimit: 0
});
```

---

## 📊 性能对比

| 优化阶段 | QPS | 响应时间 | CPU使用 | 成本 |
|---------|-----|---------|---------|------|
| **当前** | ~100 | 3-5s | 25% | 低 |
| **+Cluster** | ~400 | 3-5s | 100% | 低 |
| **+Redis** | ~1000 | 3-5s | 100% | 中 |
| **+消息队列** | ~5000 | <100ms | 100% | 中 |
| **+数据库** | ~10000+ | <100ms | 100% | 高 |

---

## 🎯 实施计划

### Week 1: 基础优化

```bash
Day 1: PM2 Cluster模式 ✅
Day 2: Nginx限流配置 ✅
Day 3: 性能测试
```

### Week 2: Redis集成

```bash
Day 1: 安装Redis
Day 2: 用户数据迁移到Redis
Day 3: Access Token缓存到Redis
Day 4: 订单数据迁移到Redis
Day 5: 测试验证
```

### Week 3: 消息队列

```bash
Day 1: 设计队列架构
Day 2: 实现AI请求队列
Day 3: 实现Worker进程
Day 4: 修改主进程为异步
Day 5: 测试验证
```

---

## 🧪 压力测试

### 工具推荐

```bash
# 安装 ab（Apache Bench）
sudo apt install apache2-utils

# 测试
ab -n 1000 -c 100 https://wenkexueai.com/api/stats
```

### 测试指标

- **QPS**: 每秒请求数
- **响应时间**: P50, P95, P99
- **错误率**: < 0.1%
- **CPU**: < 80%
- **内存**: < 2GB

---

## 🚨 监控告警

### 1. PM2监控

```bash
# 安装PM2 Plus（免费版）
pm2 install pm2-server-monit

# 查看监控
pm2 monit
```

### 2. Redis监控

```bash
# Redis状态
redis-cli info stats

# 关键指标
total_connections_received
instantaneous_ops_per_sec
used_memory
```

### 3. 日志监控

```bash
# 实时错误日志
pm2 logs --err

# 统计错误率
grep "ERROR" /root/.pm2/logs/*.log | wc -l
```

---

## 💰 成本估算

### 方案A：单机优化（推荐）

**硬件：**
- 阿里云 ECS 2核4G → 4核8G
- 升级费用：~100元/月

**效果：**
- 支持 1000 QPS
- 满足大部分场景

### 方案B：分布式架构

**硬件：**
- 负载均衡 SLB：50元/月
- 应用服务器 x3：300元/月
- Redis集群：200元/月
- MySQL RDS：300元/月

**总计：**~850元/月

**效果：**
- 支持 10000+ QPS
- 高可用

---

## ✅ 快速开始

### 立即执行（5分钟）

```bash
cd /home/admin/0801/0802/ai-course-website

# 1. 停止当前服务
pm2 delete wechat-server

# 2. 使用Cluster模式启动
pm2 start ecosystem.config.js

# 3. 查看状态
pm2 status

# 4. 保存
pm2 save

# 5. 测试
curl https://wenkexueai.com/api/stats
```

### 验证效果

```bash
# 查看进程数（应该是4个或更多）
pm2 list

# 查看CPU使用（应该更均衡）
pm2 monit
```

---

## 📚 参考资料

- **PM2文档**: https://pm2.keymetrics.io/
- **Redis文档**: https://redis.io/documentation
- **Nginx优化**: https://www.nginx.com/blog/tuning-nginx/
- **Node.js性能**: https://nodejs.org/en/docs/guides/simple-profiling/

---

## 🎉 总结

**最快见效：PM2 Cluster模式（5分钟）**
- 并发能力提升4-8倍
- 无需修改代码
- 立即生效

**性价比最高：Redis集成（2-3天）**
- 数据持久化
- 支持多进程
- 为集群做准备

**最强大：消息队列（3-5天）**
- 异步处理
- 吞吐量提升10倍+
- 用户体验最好

**建议：先做Cluster模式，够用就行；不够再加Redis和队列。**

