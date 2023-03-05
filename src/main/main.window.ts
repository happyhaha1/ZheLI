import { join } from 'path'
import { BrowserWindow, app } from 'electron'
import pie from 'puppeteer-in-electron'

const isDev = !app.isPackaged

pie.initialize(app, 8136)
export async function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: join(__dirname, '../preload/index.js'),
            devTools: isDev,
        },
        autoHideMenuBar: !isDev,
    })

    // win.maximize()

    const URL = isDev
        ? process.env.DS_RENDERER_URL
        : `file://${join(app.getAppPath(), 'dist/render/index.html')}`

    win.loadURL(URL)

    if (isDev)
        win.webContents.openDevTools()

    else
        win.removeMenu()

    win.on('closed', () => {
        win.destroy()
    })

    return win
}

export async function restoreOrCreateWindow() {
    let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed())

    if (window === undefined)
        window = await createWindow()

    if (window.isMinimized())
        window.restore()

    window.focus()
}
