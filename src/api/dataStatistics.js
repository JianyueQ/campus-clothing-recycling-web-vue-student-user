import request from '@/utils/request';


export function getUserStatistics() {
    return request.get('/user/statistics');
}

export function checkIn() {
    return request.post('/user/checkin');
}

export function getCheckInHistory() {
    return request.get('/user/checkin/history');
}
