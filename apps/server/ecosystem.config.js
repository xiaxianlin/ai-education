module.exports = {
    apps: [
        {
            name: 'ai-education-server',
            script: 'uvicorn',
            args: 'main:app --host 0.0.0.0 --port 7010 --workers 2',
            interpreter: './.venv/bin/python',
            watch: false,
            env: {
                ENV: 'production'
            }
        },
        {
            name: 'ai-education-worker',
            script: 'worker.py',
            args: '--loglevel=info',
            interpreter: './.venv/bin/python',
            watch: false,
            env: {
                ENV: 'production',
                CELERY_WORKER_CONCURRENCY: 4  // 可以通过环境变量覆盖
            }
        }
    ]
}
