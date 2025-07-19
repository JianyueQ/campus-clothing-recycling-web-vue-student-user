import {createRouter, createWebHistory} from 'vue-router'

//导入组件
import Notice from "@/views/notice/Notice.vue";
import CharityRanking from "@/views/charity/CharityRanking.vue";
import UserResetPassword from "@/views/user/UserResetPassword.vue";
import UserAvatar from "@/views/user/UserAvatar.vue";
import index from "@/views/layout/index.vue";
import UserIndex from "@/views/user/UserIndex.vue";
import Login from "@/views/Login.vue";
import OnlineAppointment from "@/views/appointment/OnlineAppointment.vue";
import OfflineDelivery from "@/views/appointment/OfflineDelivery.vue";
import NotFound from "@/views/error/404.vue"
import Register from "@/views/Register.vue";
import DonationQuery from "@/views/donationQuery/DonationQuery.vue";
import ForgetPassword from "@/views/ForgetPassword.vue";
import DonationRecord from "@/views/donation/DonationRecord.vue";

//定义路由关系
const routes = [
    {
        path: '/login',
        component: Login,
        meta: {title: '登录页'}
    },
    {
        path: '/register',
        component: Register,
        meta: {title: '注册页'}
    },
    {
        //重定向路由redirect
        path: '/', component: index, redirect: '/notice', meta: {title: '首页', requiresAuth: true}, children: [
            {
                path: '/notice',
                component: Notice,
                meta: {title: '公告', requiresAuth: true}
            },
            {
                path: '/donationQuery',
                component: DonationRecord,
                meta: {title: '捐赠信息与反馈', requiresAuth: true}
            },
            {
                path: '/system/appointment',
                meta: {title: '回收预约', requiresAuth: true}, children: [
                    {
                        path: '/system/onlineAppointment',
                        requiresAuth: true,
                        component: OnlineAppointment,
                        meta: {title: '线上预约'}
                    },
                    {
                        path: '/system/offlineDelivery',
                        requiresAuth: true,
                        component: OfflineDelivery,
                        meta: {title: '线下投递'}
                    }
                ],
            },
            {path: '/charityRanking', component: CharityRanking, meta: {title: '数据统计', requiresAuth: true}},
            {
                path: '/user/info', meta: {title: '个人中心', requiresAuth: true}, children: [
                    {
                        path: '/user/info',
                        component: UserIndex,
                        meta: {title: '基本资料', requiresAuth: true}
                    },
                    {
                        path: '/user/info',
                        component: UserAvatar,
                        meta: {title: '更换头像', requiresAuth: true}
                    },
                    {
                        path: '/user/resetpassword',
                        component: UserResetPassword,
                        meta: {title: '更换密码', requiresAuth: true}
                    },
                ]
            },

        ]
    },
    {
        path: '/forgetPassword',
        component: ForgetPassword,
        meta: {title: '忘记密码'}
    },
    // 最后添加 404 页面路由
    {
        path: '/:pathMatch(.*)*',
        component: NotFound,
        meta: {title: '404'}
    }
];

//创建路由器
const router = createRouter({
    history: createWebHistory(),
    routes: routes,
})

//导出路由器
export default router
