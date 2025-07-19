import request from "@/utils/request.js";

// 获取捐赠信息列表 -- 分页查询
export const getDonationListService = (data) => {
    return request.get('/user/donation', { params: data });
};

// 根据ID获取捐赠信息详情
export const getDonationByIdService = (id) => {
    return request.get(`/user/donation/${id}`);
};


