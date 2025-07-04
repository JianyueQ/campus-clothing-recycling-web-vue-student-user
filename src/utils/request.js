//定制请求的实例
import axios from 'axios';
import {ElMessage, ElMessageBox} from 'element-plus'
import router from '@/router';
import { useTokenStore } from '@/stores/token';
import {useUserInfoStore} from "@/stores/user.js";
//定义一个变量,记录公共的前缀  ,  baseURL
const baseURL = '/api';
// 添加一个全局变量用于标记是否已弹窗
let isTokenExpiredDialogShown = false;


const instance = axios.create({ baseURL })

//添加请求拦截器
instance.interceptors.request.use(
    (config) => {
        const tokenStore = useTokenStore();
        if (tokenStore.token) {
            config.headers.Authentication = tokenStore.token
        }
        return config;
    },
    (err) => {
        return Promise.reject(err);
    }
);

//添加响应拦截器
instance.interceptors.response.use(
    result => {
        if (result.data.code === 1) {
            return result.data;
        } else if (result.data.code === 0) {
            ElMessage({
                showClose: true,
                message: result.data.msg,
                type: 'error',
            })
        }
        return Promise.reject(err);//异步的状态转化成失败的状态
    },
    err => {
        if (err.response.status === 403) {
            //设置登录过期状态
            useTokenStore().removeToken();
            if (!isTokenExpiredDialogShown){
                isTokenExpiredDialogShown = true;
                ElMessageBox.confirm(
                    '您的登录状态已过期，是否重新登录？',
                    '登录状态过期',
                    {
                        confirmButtonText: '重新登录',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                ).then(() => {
                    useTokenStore().removeToken();
                    useUserInfoStore().removeInfo();
                    router.push('/login'); // 点击确认跳转登录
                }).catch(() => {
                    // 点击取消，不清空 token，但标记为过期
                    useUserInfoStore().removeInfo();
                    isTokenExpiredDialogShown = false;
                });
            }
            // router.push('/login')
        }else if (err.response.status === 401){
            ElMessage({
                showClose: true,
                message: '访问的路径不存在',
                type: 'error',
            })
        }
        else {
            ElMessage({
                showClose: true,
                message: '服务异常',
                type: 'error',
            })
        }
        return Promise.reject(err);//异步的状态转化成失败的状态
    }
)

export default instance;
