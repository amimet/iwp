import axios from 'axios'
import qs from 'qs'

export const api = {
    create: () => {
        return axios.create({
            baseURL: 'https://jsonplaceholder.typicode.com/',
            timeout: 1000,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
    }
}