// src/api/order.js
import request from "@/utils/request";

/**
 * 分页查询订单信息-线下
 */
export const getOrderListOfflineService = (params) => {
    return request.get('/user/orders/offline/list', {params});
};
/**
 * 新增订单-线下
 */
export const addOrderOfflineService = (data) => {
    return request.post('/user/orders/offline', data);
};
/**
 * 修改订单信息-线下
 */
export const updateOrderOfflineService = (data) => {
    return request.put('/user/orders/offline', data);
};
/**
 * 根据ID获取订单信息-线下
 */
export const getOrderByIdOfflineService = (id) => {
    return request.get(`/user/orders/offline/${id}`);
};


/**
 * 分页查询订单信息-线上
 */
export const getOrderListOnlineService = (params) => {
    return request.get('/user/orders/online/list', {params});
};
/**
 * 新增订单-线上
 */
export const addOrderOnlineService = (data) => {
    return request.post('/user/orders/online', data);
};
/**
 * 修改订单信息-线上
 */
export const updateOrderOnlineService = (data) => {
    return request.put('/user/orders/online', data);
};

/**
 * 根据ID获取订单信息-线上
 */
export const getOrderByIdOnlineService = (id) => {
    return request.get(`/user/orders/online/${id}`);
};



/**
 * 删除订单（支持批量）
 */
export const deleteOrderService = (ids) => {
    if (!ids || ids.length === 0) {
        return Promise.reject(new Error('请选择要删除的订单'));
    }
    const idsStr = ids.join(',');
    return request.delete('/user/orders', {
        params: {
            ids: idsStr
        }
    });
};

/**
 * 修改订单状态（支持批量）
 */
export const cancelOrderService = (params) => {
    if (!params.ids || params.ids.length === 0) {
        return Promise.reject(new Error('请选择要修改状态的订单'));
    }
    const data = {
        ids: params.ids,
        cancelReason: params.cancelReason,
    };
    return request.put('/user/orders', data);
};
