import axios, {type AxiosInstance, type AxiosRequestConfig, type AxiosError} from 'axios'

export const API_BASE_URL = 'https://api.tipbot.app/v1';

export const http: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

http.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error: AxiosError) => Promise.reject(error)
)

http.interceptors.response.use(
    (response) => response.data,
    (error: AxiosError) => {
        if (error.response?.status === 401){
            console.warn('Unauthorized: token expired')
        }
        if (error.response?.status === 403){
            console.warn('Forbidden: insufficient permissions')
        }
        if (error.response?.status === 404){
            console.warn('Not Found: resource not found')
        }
        if (error.response?.status === 500){
            console.error('Internal Server Error: server error')
        }
        if(error.response?.status === 429){
            console.warn('Too Many Requests: rate limit exceeded')
        }
        if(error.response?.status === 502){
            console.error('Bad Gateway: server error')
        }
        if(error.response?.status === 503){
            console.error('Service Unavailable: server error')
        }
        if(error.response?.status === 504){
            console.error('Gateway Timeout: server error')
        }
        return Promise.reject(error)
    }
)
export const apiRequest = async <T = any> (
    config: AxiosRequestConfig = {}
): Promise<T> => {
    try {
        const response = await http.request<T>(config)
        return response.data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error
        }
        throw error
    }

}
export const get = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiRequest<T>({ ...config, url, method: 'GET' })
}
export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiRequest<T>({ ...config, url, method: 'POST', data })
}
export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiRequest<T>({ ...config, url, method: 'PUT', data })
}   
export const del = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiRequest<T>({ ...config, url, method: 'DELETE' })
}