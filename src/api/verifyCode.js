import request from "@/utils/request.js";

//获取验证码图片
export const getVerifyCodeService = () => {
    return request.get('/code/get')
}
//刷新获取验证码图片
export const refreshVerifyCodeService = (uuid) => {
    return request.get(`/code/refresh/${uuid}`)
}
