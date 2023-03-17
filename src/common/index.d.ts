import type { IpcRenderer } from 'electron'

declare global {
  interface Window {
    ipcRenderer: IpcRenderer
  }

  interface IpcResponse<T> {
    data?: T
    error?: any
  }
  interface User {
    name: string
    company: string
    avatarUrl: string
    integral: number
  }
  
  interface Course {
    name: string
    url: string
    imgUrl: string
    videos?: Array<Video>
    progress?: number
    videoNum: number
    frist: boolean,
    currentVideo?: Video
  }
  
  interface Video {
    index: number
    name: string
    dtime?: number
    ntime?: number
    progress?: number
  }

  class LoginFailedError extends Error {}
  
  
}

export { }
