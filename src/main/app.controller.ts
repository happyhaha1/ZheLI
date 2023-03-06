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
        return this.appService.get_user_info(false)
    }

    @IpcHandle('sync_info')
    public async sync_info(): Promise<IpcResponse<User>> {
        return this.appService.get_user_info(true)
    }

    @IpcHandle('get_courses')
    public async get_courses(page: number, pagesize: number): Promise<IpcResponse<{ courses: Course[]; count: number }>> {
        return this.appService.get_courses(page, pagesize)
    }

    @IpcHandle('sync_courses')
    public async sync_courses(): Promise<IpcResponse<number>> {
        return this.appService.syncCoures()
    }

    @IpcHandle('change_show')
    public async change_show(show: boolean): Promise<IpcResponse<string>> {
        return this.appService.change_show(show)
    }

    @IpcHandle('study')
    public async study(data: string): Promise<IpcResponse<string>> {
        const courses: Course[] = JSON.parse(data)
        return this.appService.study(courses)
    }

    @IpcHandle('logout')
    public async logout(): Promise<IpcResponse<string>> {
        return this.appService.logout()
    }
}
