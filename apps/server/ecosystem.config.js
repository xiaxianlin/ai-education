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
        }
    ]
}
