import path from 'path'
import fs from 'fs'
import { BrowserWindow, app } from 'electron'
import pie from 'puppeteer-in-electron'
import { Duration } from 'luxon'
import { Browser, Page } from 'puppeteer-core'

export class LoginFailedError extends Error {}

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

  private readonly cookieFilePath: string = path.join(app.getPath('userData'), 'cookie.json')
  private readonly url: string = 'https://www.zjce.gov.cn'

  constructor(private win: BrowserWindow, private chromePath: string = '', private show = false) {}

  private async ensureBrowserInitialized() {
    if (!this.browser)
      this.browser = await pie.connect(app, await import('puppeteer-core'))
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
          // 登录成功
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

  async getUserInfo(cookies: Electron.Cookie[]): Promise<User> {
    await this.ensureBrowserInitialized()

    // 判断是否登录了
    if (!this.homeWindow) {
      const browserWindow = new BrowserWindow({
        show: this.show,
      })
      this.homeWindow = browserWindow
      this.homePage = await pie.getPage(this.browser, browserWindow)
      this.homeWindow.addListener('closed', () => {
        this.homeWindow = undefined
        this.homePage = undefined
      })
    }

    if (cookies) {
      cookies.forEach(async (cookie, _) => {
        await this.homePage.setCookie({
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
        })
      })
    }

    await this.homePage.goto(`${this.url}/personalCenter/creditArchive`)
    await this.homePage.waitForNetworkIdle()

    // 检查是否成功登录
    const isLoggedIn = await this.homePage.$('.for-avatar')
    if (!isLoggedIn)
      throw new LoginFailedError('登录失效')

    // 获取用户信.$eval('#search', el => el.value);息
    const name = await this.homePage.$eval('.big-name', el => el.textContent)
    const company = await this.homePage.$eval(
      '.name-mar:nth-of-type(3)',
      el => el.textContent,
    )
    const avatarUrl = await this.homePage.$eval('.for-avatar img', el =>
      el.getAttribute('src'),
    )

    return { name, company, avatarUrl }
  }

  async searchByName(name: string) {
    await this.ensureBrowserInitialized()
    if (!this.searchWindow) {
      const browserWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: this.show,
      })
      this.searchWindow = browserWindow
      this.searchPage = await pie.getPage(this.browser, browserWindow)
    }
    await this.searchPage.goto(`${this.url}/search?keyword=${encodeURI(name)}`)

    //
    // this.searchWindow.close()
  }

  async getCourses(page: number): Promise<Course[]> {
    await this.ensureBrowserInitialized()

    await this.homePage.goto(`${this.url}/videos`)

    await this.homePage.waitForNetworkIdle()

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
      // 遍历每个<li>元素
      els.forEach((li) => {
        // 获取<img>标签的src属性
        const imgSrc = li.querySelector('img').getAttribute('src')
        // 获取<p>标签的title属性
        const pTitle = li.querySelector('p').getAttribute('title')
        // 获取<a>标签的href属性
        const aHref = li.querySelector('a').getAttribute('href')

        let videoNum = 1
        const tag = li.querySelector('.tag')
        if (tag) {
          const regex = /全(\d+)集/
          const match = regex.exec(tag.textContent)
          if (match !== null) {
            const num = match[1] // 第一个括号中的子字符串是数字2
            videoNum = parseInt(num)
          }
        }
        // 将结果添加到数据数组中
        courses.push({
          imgUrl: imgSrc,
          name: pTitle,
          url: aHref,
          videoNum,
          frist: true,
        })
      })
      // 返回数据数组
      return courses
    })

    return courses
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
      course.videos.length = course.videoNum
      if (course.videoNum > 1) {
        // 需要获取视频的链接
        await this.videoPage.$$eval('.set-content', (els) => {
          els.forEach((el, index) => {
            const name = el.querySelector('.right .set-title').textContent
            const progressStr = el.querySelector('.right .set-progress').textContent
            const match = progressStr.match(/\d+/)
            const progress = match ? parseInt(match[0], 10) : 0
            course.videos.push({
              index,
              name,
              progress,
            })
          })
        })
      }
      else {
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

    const progress = await this.videoPage.$eval('.ant-progress-text', el => el.textContent)
    course.progress = parseFloat(progress)

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

    // if (videoProgress == 100) {
    //     //播放下一集
    //     incompleteVideos.s
    // }

    if (course.progress === 100) {
      return true
    }
    else {
      const vedioStatus = await this.videoPage.$('.dplayer-playing')
      if (!vedioStatus) {
        // 点击播放按钮
        await new Promise(resolve => setTimeout(resolve, 5000))
        ;(await this.videoPage.$('.dplayer-play-icon')).click()
        const vedioStatus2 = this.videoPage.$('.dplayer-playing')
        if (!vedioStatus2)
          throw new Error('无法播放')
      }
      return false
    }
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
    }
    catch (error) {
      throw new Error('cookie文件不存在，请点击登录')
    }
    const fileContent = await fs.promises.readFile(this.cookieFilePath, 'utf-8')
    return JSON.parse(fileContent)
  }

  async autoScroll(page: Page) {
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
