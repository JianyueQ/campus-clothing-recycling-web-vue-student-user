import request from '@/utils/request';

// 获取订单统计数据
export function getOrderStatistics() {
    return request.get('/user/statistics/order');
}
