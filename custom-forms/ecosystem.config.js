/**
 * PM2 Ecosystem Configuration for BIZUIT Custom Forms
 *
 * This file configures PM2 to manage both the runtime-app (Next.js) and backend-api (FastAPI).
 * PM2 keeps the processes running, restarts them if they crash, and manages logs.
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 list
 *   pm2 logs
 *
 * For multiple clients on the same server, duplicate the app blocks with different:
 *   - name (e.g., cliente2-runtime, cliente2-backend)
 *   - ports (e.g., 3002, 8001)
 *   - cwd (working directory)
 */

module.exports = {
  apps: [
    // ============================================
    // Runtime App (Next.js)
    // ============================================
    {
      name: 'arielsch-runtime',

      // Working directory
      cwd: 'E:\\BIZUITSites\\arielsch\\arielschBIZUITCustomForms',

      // Next.js standalone server
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',

      // Single instance (Next.js handles concurrency internally)
      instances: 1,
      exec_mode: 'fork',

      // Load environment variables from .env.local
      env_file: '.env.local',

      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: '3001',
        // CRITICAL: Runtime basePath for Next.js SSR (will be replaced by pipeline)
        __NEXT_ROUTER_BASEPATH: '__RUNTIME_BASEPATH_VALUE__'
      },

      // Logging
      error_file: 'logs/runtime-error.log',
      out_file: 'logs/runtime-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,

      // Auto-restart configuration
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,

      // Memory management
      max_memory_restart: '500M',

      // Watch files (disabled in production)
      watch: false,

      // Cron restart (optional - restart every day at 3 AM)
      // cron_restart: '0 3 * * *',

      // Kill timeout
      kill_timeout: 5000
    },

    // ============================================
    // Backend API (FastAPI)
    // ============================================
    {
      name: 'arielsch-backend',

      // Working directory
      cwd: 'E:\\BIZUITSites\\arielsch\\arielschBIZUITCustomFormsBackEnd',

      // Python main.py (loads .env.local and starts uvicorn)
      script: 'C:\\Python312\\python.exe',
      args: 'main.py',

      // Important: Use 'none' as interpreter for non-Node.js scripts
      interpreter: 'none',

      // Single instance
      instances: 1,
      exec_mode: 'fork',

      // Load environment variables from .env.local
      env_file: '.env.local',

      // Environment variables
      env: {
        PYTHONUNBUFFERED: '1',
        PYTHON_ENV: 'production',
        PORT: '8000'
      },

      // Logging
      error_file: 'logs/backend-error.log',
      out_file: 'logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,

      // Auto-restart configuration
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,

      // Memory management
      max_memory_restart: '800M',

      // Watch files (disabled in production)
      watch: false,

      // Cron restart (optional - restart every day at 3 AM)
      // cron_restart: '0 3 * * *',

      // Kill timeout
      kill_timeout: 5000
    }

    // ============================================
    // Example: Additional client configuration
    // ============================================
    // Uncomment and modify for additional clients:
    /*
    {
      name: 'cliente2-runtime',
      cwd: 'E:\\BIZUITSites\\cliente2\\cliente2BIZUITCustomForms',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3002',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: '3002'
      },
      error_file: 'logs/runtime-error.log',
      out_file: 'logs/runtime-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      max_memory_restart: '500M',
      watch: false,
      kill_timeout: 5000
    },
    {
      name: 'cliente2-backend',
      cwd: 'E:\\BIZUITSites\\cliente2\\cliente2BIZUITCustomFormsBackEnd',
      script: 'C:\\Python312\\python.exe',
      args: 'main.py',
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      env: {
        PYTHONUNBUFFERED: '1',
        PYTHON_ENV: 'production',
        PORT: '8001'
      },
      error_file: 'logs/backend-error.log',
      out_file: 'logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      max_memory_restart: '800M',
      watch: false,
      kill_timeout: 5000
    }
    */
  ]
};
