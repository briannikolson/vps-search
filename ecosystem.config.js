// PM2 конфигурация для продакшена
module.exports = {
    apps: [{
        name: 'vps-finder',
        script: 'server.js',
        instances: 1,
        exec_mode: 'fork',
        autorestart: true,
        watch: false,
        max_memory_restart: '512M',
        env: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        error_file: 'logs/err.log',
        out_file: 'logs/out.log',
        log_file: 'logs/combined.log',
        time: true,
        kill_timeout: 3000,
        listen_timeout: 5000
    }]
};
