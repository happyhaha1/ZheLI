import { join } from 'path'
import { BrowserWindow, app } from 'electron'
import pie from 'puppeteer-in-electron'
const isDev = !app.isPackaged

pie.initialize(app, 8136)
export async function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        icon: 'src/common/icon.png',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: join(__dirname, '../preload/index.js'),
            devTools: isDev,
        },
        autoHideMenuBar: !isDev,
        titleBarStyle: 'hiddenInset',
    })

    // win.maximize()

    // const macAddress = getMAC()
    // const { data } = await axios.get(`http://check.kxlove.cn:9000?mac=${macAddress}`)
    // if (data.status === 1)
    //     return null

    const URL = isDev
        ? process.env.DS_RENDERER_URL
        : `file://${join(app.getAppPath(), 'dist/render/index.html')}`

    win.loadURL(URL)

    if (isDev)
        win.webContents.openDevTools()

    else
        win.removeMenu()

    win.on('closed', () => {
        const windows = BrowserWindow.getAllWindows()
        // 遍历窗口列表并关闭所有窗口
        windows.forEach((window) => {
            window.close()
        })
    })
    app.on('window-all-closed', () => {
        app.quit()
    })

    return win
}

export async function restoreOrCreateWindow() {
    let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed())

    if (window === undefined) {
        // 发起网络请求
        window = await createWindow()
    }

    if (window.isMinimized())
        window.restore()

    window.focus()
}
