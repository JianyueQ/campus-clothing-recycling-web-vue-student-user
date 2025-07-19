// src/api/notice.js
import request from "@/utils/request";

/**
 * 分页查询公告信息
 */
export const getNoticeListService = (params) => {
    return request.get('/user/announcement', { params });
};
/**
 * 根据ID获取公告信息
 */
export const getNoticeByIdService = (id) => {
    return request.get(`/user/announcement/${id}`);
};

