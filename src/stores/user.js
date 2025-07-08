import {defineStore} from "pinia"
import {computed, ref} from 'vue'

export const useUserInfoStore = defineStore('userInfo', () => {
    //定义用户信息
    const info = ref({
        id: '',
        name: '',
        imagesUrl: '',
        email: '',
        contactInfo: '',
        sex: '',
        userType: '',
        createTime: '',
        superAdmin: '',
    })
    //定义修改用户信息的方法
    const setInfo = (newInfo) => {
        info.value = newInfo;
    }
    //定义获取用户信息方法
    const getInfo = () => {
        return info.value
    }
    //定义清空用户信息的方法
    const removeInfo = () => {
        info.value = {}
    }
    return {info, setInfo, removeInfo, getInfo}
}, {
    persist: true
});

