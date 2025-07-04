import request from "@/utils/request.js";

// 上传文件
export function uploadAvatar(data) {
    return request.post('/common/upload', data,{
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}
