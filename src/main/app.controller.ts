import { Controller, IpcHandle, IpcSend } from 'einf'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(
    private appService: AppService,
  ) { }

  @IpcSend('login_success')
  public loginSuccess() {
    return 'login_success'
  }

  @IpcHandle('login')
  public async login(): Promise<IpcResponse<String>> {
    return this.appService.login()
  }

  @IpcHandle('get_user_info')
  public async get_user_info(): Promise<IpcResponse<User>> {
    return this.appService.get_user_info()
  }
}
