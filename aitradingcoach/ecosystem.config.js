module.exports = {
  apps: [
    {
      name: 'market-data',
      script: 'npx',
      args: 'ts-node scripts/fetchMarketData.ts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/market-data-error.log',
      out_file: './logs/market-data-out.log',
      log_file: './logs/market-data-combined.log',
      time: true
    },
    {
      name: 'low-float-filter',
      script: 'npx',
      args: 'ts-node scripts/filterLowFloatTickers.ts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/low-float-error.log',
      out_file: './logs/low-float-out.log',
      log_file: './logs/low-float-combined.log',
      time: true
    },
    {
      name: 'hod-scanner',
      script: 'npx',
      args: 'ts-node scripts/highOfDayScanner.ts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/hod-scanner-error.log',
      out_file: './logs/hod-scanner-out.log',
      log_file: './logs/hod-scanner-combined.log',
      time: true
    }
  ]
}; 