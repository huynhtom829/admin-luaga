import axios, { type AxiosInstance } from 'axios'
import omit from 'lodash/omit'
import { getAccessTokenFromLS, setAccesTokenToLS, setProfileFromLS } from './auth'

class Upload {
  instance: AxiosInstance
  private accessToken: string
  constructor() {
    this.accessToken = getAccessTokenFromLS()
    this.instance = axios.create({
      // baseURL: 'http://localhost:4001/api/',
      baseURL: 'https://lostglobal.onrender.com/api/',
      timeout: 10000,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    this.instance.interceptors.request.use(
      (config) => {
        if (this.accessToken && config.headers) {
          config.headers['Authorization'] = `Bearer ${this.accessToken}`
          return config
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    this.instance.interceptors.response.use((response) => {
      const { url } = response.config
      if (url === '/v1/auth/login') {
        const dataProfile = response
        const newUser = omit(dataProfile.data.user, ['password'])
        this.accessToken = response.data.token
        // this.refreshToken = response.data.refresh_token
        setProfileFromLS(newUser as any)
        setAccesTokenToLS(this.accessToken)
        // setRefreshTokenToLS(this.refreshToken)
      } else if (url === '/user/log-out') {
        // this.accessToken = ''
        // this.refreshToken = ''
        // clearLS()
      }
      return response
    })
  }
}

const upload = new Upload().instance

export default upload
