import { Injectable } from 'einf'
import { ZheXue } from './Study'
@Injectable()
export class AppService {
  private stu: ZheXue
  constructor() {
    this.stu = new ZheXue()
  }

  public getDelayTime(): number {
    return 2
  }

  public async login(): Promise<IpcResponse<String>> {
    try {
      await this.stu.login()
      return { data: '登录成功' }
    }
    catch (error) {
      return { error }
    }
  }

  public async get_user_info(): Promise<IpcResponse<User>> {
    try {
      const cookies = await this.stu.get_cookies()
      const userInfo = await this.stu.getUserInfo(cookies)
      return { data: userInfo }
    }
    catch (error) {
      return { error }
    }
  }
}
