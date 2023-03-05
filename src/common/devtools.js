const { spawn } = require('child_process')

// 启动Vue开发工具
const devtoolsProcess = spawn('npm', ['run', 'vue-devtools'], {
    shell: true,
    stdio: 'inherit',
})

// 启动Vite
const viteProcess = spawn('npm', ['run', 'vite'], {
    shell: true,
    stdio: 'inherit',
})

// 当任一子进程退出时，杀死另一个子进程
const killProcesses = () => {
    devtoolsProcess.kill()
    viteProcess.kill()
}

devtoolsProcess.on('exit', () => {
    killProcesses()
})

viteProcess.on('exit', () => {
    killProcesses()
})
