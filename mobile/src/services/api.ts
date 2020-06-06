import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.25.42:3333'
})

export default api;