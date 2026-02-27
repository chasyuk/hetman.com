import axios from 'axios'

const api = axios.create({
    baseURL: window.__RUNTIME_CONFIG__?.API_URL || import.meta.env.VITE_API_URL || '/api',
})

export default api
