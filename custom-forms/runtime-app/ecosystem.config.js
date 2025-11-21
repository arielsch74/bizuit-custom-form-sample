/**
 * PM2 Configuration for BizuitCustomForms Runtime App
 *
 * This configuration includes the runtime basePath replacement step
 * before starting the Next.js server.
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 restart arielsch-runtime
 *   pm2 stop arielsch-runtime
 */

module.exports = {
  apps: [
    {
      // App configuration
      name: 'arielsch-runtime',

      // Execute prepare-deployment script before starting server
      // Windows: Use PowerShell script
      // Linux/Mac: Use Node.js script
      script: process.platform === 'win32'
        ? 'powershell.exe'
        : 'node',

      args: process.platform === 'win32'
        ? '-ExecutionPolicy Bypass -File scripts/prepare-deployment.ps1 && node server.js'
        : 'scripts/prepare-deployment.js && node server.js',

      // Working directory
      cwd: 'E:\\BIZUITSites\\arielsch\\arielschBIZUITCustomForms',

      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3001,

        // CRITICAL: Set the runtime basePath here
        // This will be used by prepare-deployment script
        RUNTIME_BASEPATH: '/arielschBIZUITCustomForms',

        // Other environment variables from .env.local will be loaded by Next.js
      },

      // PM2 configuration
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',

      // Logs
      log_file: 'logs/runtime-combined.log',
      error_file: 'logs/runtime-error.log',
      out_file: 'logs/runtime-out.log',
      time: true,

      // Startup behavior
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000,

      // Restart on file changes (disabled in production)
      ignore_watch: ['node_modules', '.next', 'logs', 'temp'],

      // Auto restart on crash with exponential backoff
      min_uptime: '10s',
      max_restarts: 10,

      // Node.js flags
      node_args: '--max-old-space-size=2048',

      // Alternative simple configuration (if script chaining doesn't work)
      // script: 'server.js',
      // pre_restart: 'node scripts/prepare-deployment.js',
    }
  ],

  // Deploy configuration (optional)
  deploy: {
    production: {
      // For reference only - actual deployment is done via Azure DevOps
      user: 'deploy',
      host: 'test.bizuit.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-repo/bizuit-custom-forms.git',
      path: '/var/www/production',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};