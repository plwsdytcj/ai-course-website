module.exports = {
  apps: [{
    name: 'wechat-server',
    script: './server/index.js',
    
    // Cluster 模式 - 多进程
    instances: 'max',  // 使用所有CPU核心
    exec_mode: 'cluster',
    
    // 环境变量
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // 自动重启配置
    watch: false,
    max_memory_restart: '500M',
    
    // 错误日志
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    
    // 优雅重启
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 3000,
    
    // 自动重启策略
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    
    // 性能监控
    instance_var: 'INSTANCE_ID'
  }]
};

