import request from "@/utils/request.js";

//获取公益端账户信息--分页查询
export const getCharityAccountService = (data) => {
    return request.get('/admin/charityAccount', {params: data})
}
//修改公益端账户信息
export const updateCharityAccountService = (data) => {
    return request.put('/admin/charityAccount', data)
}
//修改公益端账户状态
export const updateCharityAccountStatusService = (id, status) => {
    return request.put(`/admin/charityAccount/status/${id}`, {status: status})
}
//添加公益端账户
export const addCharityAccountService = (data) => {
    return request.post('/admin/charityAccount', data)
}
//根据id获取公益端账户信息以及详细信息
export const getCharityAccountByIdService = (id) => {
    return request.get(`/admin/charityAccount/${id}`)
}
//删除公益端账户
export const deleteCharityAccountService = (ids) => {
    if (!ids || ids.length === 0) {
        return Promise.reject(new Error('Ids must not be empty'));
    }
    const idsString = ids.join(',');
    return request.delete('/admin/charityAccount', {
        params: { ids: idsString }
    })
}
//重置按钮
export const resetCharityAccountPasswordService = (id) => {
    return request.put(`/admin/resetPassword/${id}`)
}
