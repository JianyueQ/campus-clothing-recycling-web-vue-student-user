//定义store
import { defineStore } from "pinia";
import { ref } from "vue";

export const useTokenStore = defineStore('token', () => {
    //响应式变量
    const token = ref('')
    //修改token的值
    const setToken = (newToken) => {
        token.value = newToken
    }
    //移除token
    const removeToken = () => {
        token.value = ''
    }
    return {
        setToken, removeToken, token
    }
}, {
    persist: true//持久化存储
})
