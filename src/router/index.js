import {createRouter, createWebHistory} from 'vue-router'

//导入组件
import Notice from "@/views/notice/Notice.vue";
import CharityAccount from "@/views/charity/CharityAccount.vue";
import DonationRecord from "@/views/donation/DonationRecord.vue";
import RecipientLocation from "@/views/recipient/RecipientLocation.vue";
import RecipientManagement from "@/views/recipient/RecipientManagement.vue";
import CollectorManagement from "@/views/recycle/CollectorManagement.vue";
import RecyclingAppointment from "@/views/recycle/RecyclingAppointment.vue";
import CharityRanking from "@/views/charity/CharityRanking.vue";
import UserResetPassword from "@/views/user/UserResetPassword.vue";
import UserAvatar from "@/views/user/UserAvatar.vue";
import index from "@/views/layout/index.vue";
import UserIndex from "@/views/user/UserIndex.vue";
import Login from "@/views/Login.vue";


//定义路由关系
const routes = [
    {path: '/login', component: Login, meta: {title: '登录页'}},
    {
        //重定向路由redirect
        path: '/', component: index, redirect: '/notice', meta: {title: '首页', requiresAuth: true}, children: [
            {
                path: '/notice',
                component: Notice,
                meta: {title: '公告', requiresAuth: true}
            },
            {
                path: '/charityAccount',
                component: CharityAccount,
                meta: {title: '公益端账号管理', requiresAuth: true}
            },
            {
                path: '/donationRecord',
                component: DonationRecord,
                meta: {title: '捐赠记录跟踪', requiresAuth: true}
            },
            {
                path: '/system', meta: {title: '业务管理', requiresAuth: true}, children: [
                    {
                        path: '/system/recipientLocation',
                        component: RecipientLocation,
                        meta: {title: '受捐地管理', requiresAuth: true}
                    },
                    {
                        path: '/system/recipientManagement',
                        component: RecipientManagement,
                        meta: {title: '接受方管理', requiresAuth: true}
                    },
                    {
                        path: '/system/collectorManagement',
                        component: CollectorManagement,
                        meta: {title: '回收员管理', requiresAuth: true}
                    },
                    {
                        path: '/system/recyclingAppointment',
                        component: RecyclingAppointment,
                        meta: {title: '回收预约管理', requiresAuth: true}
                    },
                ]
            },
            {path: '/charityRanking', component: CharityRanking, meta: {title: '公益榜单', requiresAuth: true}},

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
            }
        ]
    },
];

//创建路由器
const router = createRouter({
    history: createWebHistory(),
    routes: routes,
})

//导出路由器
export default router
