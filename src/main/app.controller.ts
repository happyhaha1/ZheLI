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

    @IpcHandle('get_courses')
    public async get_courses(page: number): Promise<IpcResponse<Course[]>> {
        return this.appService.get_courses(page)
    }

    @IpcHandle('change_show')
    public async change_show(show: boolean): Promise<IpcResponse<string>> {
        return this.appService.change_show(show)
    }

    @IpcHandle('logout')
    public async logout(): Promise<IpcResponse<string>> {
        return this.appService.logout()
    }
}
