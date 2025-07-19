import request from '@/utils/request'

// 登录的函数
export const loginUserService = (loginData) => {
    return request.post('/user/login', JSON.stringify(loginData), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
// 注册的函数
export const registerUserService = (registerData) => {
    return request.post('/user/register', JSON.stringify(registerData), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
//查询用户信息
export const userInfoService = () => {
    return request.get('/user/studentInfo')
}
//修改用户基本信息
export const userUpdateSercice = (userData) => {
    return request.put('/user/studentInfo/update', userData)
}
//修改用户的密码
export const userUpdatePwdService = (pswData) => {
    return request.put('/user/studentInfo/updatePassword', pswData)
}
//退出登录
export const logoutService = () => {
    return request.post('/user/logout')
}
// 忘记密码接口
export const forgetPasswordService = (data) => {
    return request.post('/user/forget', data)
}
