import path from 'path'
import fs from 'fs'
import { BrowserWindow, app } from 'electron'
import pie from 'puppeteer-in-electron'
import { Duration } from 'luxon'
import { Browser, Page } from 'puppeteer-core'

export class ZheXue {
    private browser?: Browser
    private loginWindow?: BrowserWindow
    private loginPage?: Page
    private homeWindow?: BrowserWindow
    private homePage?: Page
    private videoWindow?: BrowserWindow
    private videoPage?: Page
    private searchWindow?: BrowserWindow
    private searchPage?: Page

    private cookieFilePath: string = path.join(app.getPath('userData'), '/data/cookie.json')
    private userFilePath: string = path.join(app.getPath('userData'), '/data/userInfo.json')
    private readonly url: string = 'https://www.zjce.gov.cn'

    constructor(private win: BrowserWindow, private chromePath: string = '', private show = false) {
        if (!app.isPackaged) {
            this.cookieFilePath = path.join(app.getAppPath(), '../data/cookie.json')
            this.userFilePath = path.join(app.getAppPath(), '../data/userInfo.json')
        }
    }

    private async ensureBrowserInitialized() {
        if (!this.browser)
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            this.browser = await pie.connect(app, require('puppeteer-core'))

        if (!this.homeWindow) {
            const browserWindow = new BrowserWindow({
                width: 1200,
                height: 600,
                show: false,
            })
            this.homeWindow = browserWindow
            this.homePage = await pie.getPage(this.browser, browserWindow)
            this.homeWindow.addListener('closed', () => {
                this.homeWindow = undefined
                this.homePage = undefined
            })
            const cookies = await this.get_cookies()

            if (cookies) {
                cookies.forEach(async (cookie, _) => {
                    await this.homePage.setCookie({
                        name: cookie.name,
                        value: cookie.value,
                        domain: cookie.domain,
                    })
                })
            }
        }
    }

    async login() {
        await this.ensureBrowserInitialized()
        if (!this.loginPage) {
            const browserWindow = new BrowserWindow({
                width: 800,
                height: 600,
                show: true,
            })
            this.loginWindow = browserWindow
            this.loginPage = await pie.getPage(this.browser, browserWindow)
            this.loginWindow.addListener('closed', () => {
                this.loginWindow = undefined
                this.loginPage = undefined
            })

            this.loginWindow.webContents.addListener('did-navigate-in-page', async () => {
                const url = this.loginWindow.webContents.getURL()
                if (url === 'https://www.zjce.gov.cn/home') {
                    // ????????????
                    const cookies = await this.loginWindow.webContents.session.cookies.get({
                        domain: 'www.zjce.gov.cn',
                    })
                    await this.save_cookies(JSON.stringify(cookies))
                    this.loginWindow.close()
                    this.win.webContents.send('login_success')
                }
            })
        }

        await this.loginPage.goto(`${this.url}/login`)
    }

    async getUserInfoByFile(): Promise<User> {
        try {
            await fs.promises.access(this.userFilePath)
        } catch (error) {
            return await this.getUserInfoByBrowser()
        }
        try {
            const userInfo = await fs.promises.readFile(this.userFilePath, 'utf-8')
            return JSON.parse(userInfo)
        } catch (error) {
            return null
        }
    }

    async getUserInfoByBrowser(): Promise<User> {
        await this.ensureBrowserInitialized()

        await this.homePage.goto(`${this.url}/personalCenter/creditArchive`)
        await this.homePage.waitForNetworkIdle()

        const isLoggedIn = await this.homePage.$('.for-avatar')
        if (!isLoggedIn)
            throw new LoginFailedError('????????????')

        const name = await this.homePage.$eval('.big-name', el => el.textContent)
        const company = await this.homePage.$eval(
            '.name-mar:nth-of-type(3)',
            el => el.textContent,
        )
        const avatarUrl = await this.homePage.$eval('.for-avatar img', el =>
            el.getAttribute('src'),
        )
        const user = { name, company, avatarUrl }
        await fs.promises.writeFile(this.userFilePath, JSON.stringify(user))
        return { name, company, avatarUrl }
    }

    async searchByName(name: string) {
        await this.ensureBrowserInitialized()
        if (!this.searchWindow) {
            const browserWindow = new BrowserWindow({
                width: 800,
                height: 600,
                show: false,
            })
            this.searchWindow = browserWindow
            this.searchPage = await pie.getPage(this.browser, browserWindow)
        }
        await this.searchPage.goto(`${this.url}/search?keyword=${encodeURI(name)}`)
    }

    async getCourses(page: number): Promise<Course[]> {
        await this.ensureBrowserInitialized()

        if (page === 1) {
            await this.homePage.goto(`${this.url}/videos`)
            await this.homePage.waitForNetworkIdle()
        }
        const paginationItem = await this.homePage.$(`li[title="${page}"]`)
        // Click the pagination item
        await paginationItem.click()
        await this.homePage.waitForNetworkIdle()
        await this.homePage.evaluate(() => {
            window.scrollTo(0, 0)
        })
        await this.autoScroll(this.homePage)
        const courses = await this.homePage.$$eval('.clearfix li', (els) => {
            const courses: Course[] = []
            // ????????????<li>??????
            els.forEach((li) => {
                // ??????<img>?????????src??????
                const imgSrc = li.querySelector('img').getAttribute('src')
                // ??????<p>?????????title??????
                const pTitle = li.querySelector('p').getAttribute('title')
                // ??????<a>?????????href??????
                const aHref = li.querySelector('a').getAttribute('href')

                let videoNum = 1
                const tag = li.querySelector('.tag')
                if (tag) {
                    const regex = /???(\d+)???/
                    const match = regex.exec(tag.textContent)
                    if (match !== null) {
                        const num = match[1] // ??????????????????????????????????????????2
                        videoNum = parseInt(num)
                    }
                }
                // ?????????????????????????????????
                courses.push({
                    imgUrl: imgSrc,
                    name: pTitle,
                    url: aHref,
                    videoNum,
                    frist: true,
                    progress: 0,
                })
            })
            // ??????????????????
            return courses
        })

        return courses
    }

    async getCourseCount(): Promise<number> {
        await this.ensureBrowserInitialized()

        await this.homePage.goto(`${this.url}/videos`)

        await this.homePage.waitForNetworkIdle()
        const courseCount = await this.homePage.$eval('.pagination li:nth-last-child(2)', el => el.textContent)
        return parseInt(courseCount)
    }

    async play(course: Course): Promise<boolean> {
        await this.ensureBrowserInitialized()
        if (!this.videoPage) {
            const browserWindow = new BrowserWindow({
                width: 800,
                height: 600,
                show: this.show,
            })
            this.videoWindow = browserWindow
            this.videoWindow.webContents.setAudioMuted(true)
            this.videoPage = await pie.getPage(this.browser, browserWindow)
        }
        if (course.frist) {
            await this.videoPage.goto(this.url + course.url)
            await this.videoPage.waitForNetworkIdle()
            course.videos = []
            if (course.videoNum > 1) {
                // ???????????????????????????
                // await this.videoPage.$$eval('.set-content', (els) => {
                //     els.forEach((el, index) => {
                //         const name = el.querySelector('.right .set-title').textContent
                //         const progressStr = el.querySelector('.right .set-progress').textContent
                //         const match = progressStr.match(/\d+/)
                //         const progress = match ? parseInt(match[0], 10) : 0
                //         console.log(name)
                //         course.videos.push({
                //             index,
                //             name,
                //             progress,
                //         })
                //     })
                // })

                const titles = await this.videoPage.$$eval('.set-content .right .set-title', els => els.map(el => el.textContent))
                for (let t = 0; t < titles.length; t++) {
                    course.videos.push({
                        index: t,
                        name: titles[t],
                        progress: 0,
                    })
                }
            } else {
                const video: Video = {
                    index: 0,
                    name: course.name,
                    progress: course.progress,
                }
                course.videos.push(video)
            }

            course.frist = false
        }
        const currentVideoName = await this.videoPage.$eval(
            '.set-content.active .right .set-title',
            el => el.textContent,
        )

        const currentVideo = course.videos.find(video => video.name === currentVideoName)

        const setProgressValues = await this.videoPage.$$eval('.set-content .right .set-progress', elements => elements.map(e => e.textContent))
        const totalProgress = setProgressValues.reduce((acc, text) => {
            const progressMatch = text.match(/\d+/) // ????????????????????????????????????
            const progress = progressMatch ? parseInt(progressMatch[0]) : 0
            return acc + progress
        }, 0)
        // const progress = await this.videoPage.$eval('.ant-progress-text', el => el.textContent)
        course.progress = totalProgress / course.videos.length
        const ntime = await this.videoPage.$eval('.dplayer-ptime', el => el.textContent)
        const dtime = await this.videoPage.$eval('.dplayer-dtime', el => el.textContent)
        const ntimelong = StrToSeconds(ntime)
        const dtimelong = StrToSeconds(dtime)

        const progressStr = await this.videoPage.$eval(
            '.set-content.active .right .set-progress',
            el => el.textContent,
        )
        const match = progressStr.match(/\d+/)
        const videoProgress = match ? parseInt(match[0], 10) : 0

        course.videos[currentVideo.index].dtime = dtimelong
        course.videos[currentVideo.index].ntime = ntimelong
        course.videos[currentVideo.index].progress = videoProgress

        course.currentVideo = currentVideo

        if (course.progress === 100)
            return true

        if (videoProgress === 100) {
            const allVideoContent = await this.videoPage.$$('.set-content')

            const index = currentVideo.index++
            allVideoContent[index].click()
        }

        const vedioStatus = await this.videoPage.$('.dplayer-playing')
        if (!vedioStatus) {
            // ??????????????????
            await new Promise(resolve => setTimeout(resolve, 5000))
            ;(await this.videoPage.$('.dplayer-play-icon')).click()
            const vedioStatus2 = this.videoPage.$('.dplayer-playing')
            if (!vedioStatus2)
                throw new Error('????????????')
        }
        return false
    }

    async logout() {
        await fs.promises.unlink(this.cookieFilePath)
    }

    async close() {
        if (this.homeWindow) {
            this.homeWindow.close()
            this.homePage.close()
            this.homeWindow = undefined
            this.homePage = undefined
        }
        if (this.searchWindow) {
            this.searchWindow.close()
            this.searchPage.close()
            this.searchWindow = undefined
            this.searchPage = undefined
        }

        if (this.videoWindow) {
            this.videoWindow.close()
            this.videoPage.close()
            this.videoWindow = undefined
            this.videoPage = undefined
        }
    }

    async save_cookies(cookies: string) {
        await fs.promises.writeFile(this.cookieFilePath, cookies)
    }

    async get_cookies(): Promise<Electron.Cookie[]> {
        try {
            await fs.promises.access(this.cookieFilePath)
        } catch (error) {
            throw new LoginFailedError('cookie?????????????????????????????????')
        }
        const fileContent = await fs.promises.readFile(this.cookieFilePath, 'utf-8')
        return JSON.parse(fileContent)
    }

    async chageShow(show: boolean) {
        await this.close()
        this.show = show
    }

    async autoScroll(page: any) {
        await page.evaluate(async () => {
            await new Promise<void>((resolve, _reject) => {
                let totalHeight = 0
                const distance = 50
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight
                    window.scrollBy(0, distance)
                    totalHeight += distance

                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer)
                        resolve()
                    }
                }, 200)
            })
        })
    }
}

function StrToSeconds(timeString: string): number {
    const [minutes, seconds] = timeString.split(':').map(Number)
    const duration = Duration.fromObject({ minutes, seconds })
    const totalSeconds = duration.as('seconds')
    return totalSeconds
}
