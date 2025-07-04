import request from '@/utils/request'

// 登录的函数
export const loginUserService = (loginData) => {
    return request.post('/admin/login', JSON.stringify(loginData), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
//查询用户信息
export const userInfoService = () => {
    return request.get('/admin/userInfo')
}
//修改用户基本信息
export const userUpdateSercice = (userData) => {
    return request.put('/admin/update', userData)
}
//修改用户的密码
export const userUpdatePwdService = (pswData) => {
    return request.put('/admin/updatePwd', pswData)
}
