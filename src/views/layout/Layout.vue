<template>
  <!-- element-plus中的容器 -->
  <div class="layout">
    <el-container class="layout-container">
      <el-menu router text-color="rgb(191, 203, 217)" background-color="#2d3a4b"  :unique-opened="true">
        <!-- 添加侧边栏Logo和系统名称 -->
        <div class="sidebar-header">
          <img src="@/assets/logo/logo.png" alt="Logo" class="logo">
          <span class="system-name">公益端管理系统</span>
        </div>
        <el-menu-item index="/notice">
          <el-icon>
            <Tickets/>
          </el-icon>
          <template #title><span>公告</span></template>
        </el-menu-item>
        <el-menu-item index="/charityRanking">
          <el-icon>
            <TrendCharts/>
          </el-icon>
          <template #title><span>公益榜单</span></template>
        </el-menu-item>
        <el-menu-item index="/donationRecord">
          <el-icon>
            <Document/>
          </el-icon>
          <span>捐赠记录跟踪</span>
        </el-menu-item>
        <el-sub-menu index="/system">
          <template #title>
            <el-icon>
              <Tools/>
            </el-icon>
            <span>业务管理</span>
          </template>
          <el-menu-item index="/system/recipientLocation">
            <el-icon>
              <Location/>
            </el-icon>
            <span>受捐地管理</span>
          </el-menu-item>
          <el-menu-item index="/system/recipientManagement">
            <el-icon>
              <UserFilled/>
            </el-icon>
            <span>接受方管理</span>
          </el-menu-item>
          <el-menu-item index="/system/collectorManagement">
            <el-icon>
              <Avatar/>
            </el-icon>
            <span>回收员管理</span>
          </el-menu-item>
          <el-menu-item index="/system/recyclingAppointment">
            <el-icon>
              <Van/>
            </el-icon>
            <span>回收预约管理</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/charityAccount">
          <el-icon>
            <Tools/>
          </el-icon>
          <span>公益端账号管理</span>
        </el-menu-item>
        <!-- element-plus子菜单标签 -->
        <el-sub-menu index="/user">
          <template #title>
            <el-icon>
              <UserFilled/>
            </el-icon>
            <span>个人中心</span>
          </template>
          <el-menu-item index="/user/info">
            <el-icon>
              <User/>
            </el-icon>
            <span>基本资料</span>
          </el-menu-item>
<!--          <el-menu-item index="/user/avatar">-->
<!--            <el-icon>-->
<!--              <Crop/>-->
<!--            </el-icon>-->
<!--            <span>更换头像</span>-->
<!--          </el-menu-item>-->
          <el-menu-item index="/user/resetpassword">
            <el-icon>
              <EditPen/>
            </el-icon>
            <span>更换密码</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
      <!-- 右侧侧边栏 -->
      <el-container class="container-right">
        <!-- 头部区域 -->
        <el-header class="header-container">
          <div class="header-top">
            <el-breadcrumb class="breadcrumb" separator="/">
              <transition-group name="slide-fade">
                <el-breadcrumb-item v-for="(item, index) in breadcrumbData" :key="item.path">
                  <!-- 不可以点击项 -->
                  <span v-if="index !== 0" class="no-redirect">{{ item.meta.title }}</span>
                  <!-- 可以点击项 -->
                  <a v-else class="redirect" @click.prevent="onLinkClick(item)">首页</a>
                </el-breadcrumb-item>
              </transition-group>
            </el-breadcrumb>
            <!-- 头像及名字容器 -->
            <div class="avatar-container">
              <el-dropdown placement="bottom-end" @command="handleCommand">
                <span class="el-dropdown__box">
                  <el-avatar :src="userData.imagesUrl || Default" class="avatar"/>
                  <strong class="username">{{ userData.name }}</strong>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :icon="User" command="info">基本资料</el-dropdown-item>
                    <el-dropdown-item :icon="Crop" command="info">更换头像</el-dropdown-item>
                    <el-dropdown-item :icon="EditPen" command="resetpassword">更换密码</el-dropdown-item>
                    <el-dropdown-item :icon="SwitchButton" command="logout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <div class="header-right">
            <el-divider></el-divider>
            <el-tabs v-model="activeTab" class="nav-tabs custom-tabs" type="card" @tab-remove="removeTab"
                     @tab-click="handleTabClick">
              <el-tab-pane label="公告" name="/notice" :closable="false"></el-tab-pane>
              <!-- 动态增加标签页 -->
              <el-tab-pane v-for="item in tabs" :key="item.path" :label="item.title" :name="item.path"
                           closable></el-tab-pane>
            </el-tabs>
          </div>
        </el-header>
        <!-- 头部区域 -->

        <!-- 中间区域 -->
        <el-main>
          <router-view v-slot="{ Component }">
            <transition name="slide" mode="out-in">
              <component :is="Component"/>
            </transition>
          </router-view>
        </el-main>
        <!-- 底栏容器 -->
        <el-footer> 校园公益平台 ©2025 Created by jk6</el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import {
  UserFilled,
  User,
  EditPen,
  Crop,
  SwitchButton, Tickets, TrendCharts, Document, Location, Avatar, Van, Tools, ArrowRight,
} from "@element-plus/icons-vue";
import Default from "@/assets/images/default.png"
import {useUserInfoStore} from "@/stores/user.js";
import {logoutService, userInfoService} from "@/api/user.js";
import {useRouter} from "vue-router";
import {ElMessage, ElMessageBox} from "element-plus";
import {useTokenStore} from "@/stores/token.js";
import {useRoute} from 'vue-router'
import { ref, watch} from "vue";

const TokenStore = useTokenStore();
const getUserInfo = useUserInfoStore().getInfo();
const removeUserInfo = useUserInfoStore();
const router = useRouter();
const route = useRoute();
const userData = ref(
    {
      name: getUserInfo.name,
      imagesUrl: getUserInfo.imagesUrl,
      email: getUserInfo.email,
      contactInfo: getUserInfo.contactInfo,
      sex: getUserInfo.sex,
      userType: getUserInfo.userType,
      createTime: getUserInfo.createTime
    }
)

const userInfo =async () => {
  // 调用查询用户信息接口,将信息存入持久化存储
  const result = await userInfoService();
  const infoStore = useUserInfoStore();
  infoStore.setInfo(result.data);
  userData.value = result.data;
}
userInfo();

// 生成数组数据
const breadcrumbData = ref([]);
const getBreadcrumbData = () => {
  breadcrumbData.value = route.matched.filter((item) => {
    return item.meta && item.meta.title;
  });
};

// 标签页相关逻辑
const tabs = ref([]);
const activeTab = ref();

const addTab = (newRoute) => {
  // 排除“公告”路径的标签页添加逻辑
  if (newRoute.path === '/notice') return;
  const existedTab = tabs.value.find(tab => tab.path === newRoute.path);
  if (!existedTab) {
    tabs.value.push({
      title: newRoute.meta.title,
      path: newRoute.path,
    });
  }
  activeTab.value = newRoute.path;

};

const removeTab = (targetName) => {
  let tabsList = [...tabs.value]; // 创建一个副本
  let activeName = activeTab.value;
  if (activeName === targetName) {
    tabsList.forEach((tab, index) => {
      if (tab.path === targetName) {
        let nextTab = tabsList[index + 1] || tabsList[index - 1];
        if (nextTab) {
          activeTab.value = nextTab.path;
        } else {
          activeTab.value = '/notice'; // 默认跳转到公告页面
        }
      }
    });
  }

  tabs.value = tabsList.filter(tab => tab.path !== targetName);
};
const updateActiveTab = (path) => {
  // 如果是 /notice，则直接设置 activeTab
  if (path === '/notice') {
    activeTab.value = '/notice';
    return;
  }

  const existedTab = tabs.value.find(tab => tab.path === path);
  if (existedTab) {
    activeTab.value = existedTab.path;
  }
};
// 监听路由发生改变时触发
watch(
    route,
    (newRoute) => {
      getBreadcrumbData();
      addTab(newRoute);
      updateActiveTab(newRoute.path);


      // 更新左侧菜单的选中状态
      const menuItems = document.querySelectorAll('.el-menu-item');
      menuItems.forEach(item => {
        item.classList.remove('is-active');
      });
      const activeMenuItem = document.querySelector(`.el-menu-item[data-index="${newRoute.path}"]`);
      if (activeMenuItem) {
        activeMenuItem.classList.add('is-active');
      }

    },
    {
      immediate: true,
    }
);
// 处理点击事件
const onLinkClick = (item) => {
  router.push(item.path);
};
const handleTabClick = (tab) => {
  router.push(tab.props.name);
  updateActiveTab(tab.props.name);
};

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm(
        '确定要退出登录吗？',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    ).then(async () => {
      const result = await logoutService();
      ElMessage({
        type: 'success',
        message: result.data,
      })
      TokenStore.removeToken();
      removeUserInfo.removeInfo();
      //调用接口登出
      await router.push('/login');

    })
  } else {
    router.push('/user/' + command)
  }
}


</script>
<style lang="scss" scoped>
.layout {
  //border-radius: 80px;
  .layout-container {
    display: flex; // 确保子元素横向排列
    height: 100vh;

    overflow-x: hidden; // 防止横向滚动

    .el-menu {
      border-right: none;
      width: 200px;
      flex-shrink: 0; // 不收缩
      overflow-y: auto; // 左侧边栏独立滚动

      /* 默认情况下隐藏滚动条 */
      &::-webkit-scrollbar {
        display: none; /* 隐藏滚动条 */
      }

      /* 鼠标悬停时显示滚动条 */
      &:hover {
        &::-webkit-scrollbar {
          display: block; /* 显示滚动条 */
          width: 6px; /* 滚动条宽度 */
        }

        &::-webkit-scrollbar-thumb {
          background-color: #1e5faa; /* 滑块颜色 */
          border-radius: 3px; /* 滑块圆角 */
        }

        &::-webkit-scrollbar-track {
          background-color: transparent; /* 轨道颜色 */
        }
      }

      .el-menu-item {
        height: 60px;
        //调整文字大小
        font-size: 15px;
      }

      // 子菜单背景颜色
      .el-sub-menu {
        &.is-active {
          background-color: #1a222b; // 激活状态的背景颜色
        }

        .el-menu-item {
          background-color: #1f2d3d; // 默认背景颜色

          &:hover,
          &.is-active {
            background-color: #1a222b; // 悬停和激活状态的背景颜色
          }
        }
      }

      .sidebar-header {
        display: flex;
        align-items: center;
        padding: 16px;
        //background-color: #2d3a4b;
        color: #fff;

        .logo {
          width: 32px;
          height: 32px;
          margin-right: 8px;
        }

        .system-name {
          font-size: 16px;
          font-weight: bold;
        }
      }
    }

    .container-right {
      overflow-y: auto; // 右侧边栏独立滚动
      overflow-x: hidden; // 防止横向滚动
      .el-header {
        display: flex;
        flex-direction: column; // 垂直排列子元素
        background-color: #ffffff;
        padding: 0 0px; // 调整内边距
        height: 100px;


        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px; // 固定高度
          margin-top: 10px; // 添加顶部间距
          padding: 0 20px;

          .breadcrumb {
            font-size: 14px; // 面包屑字体大小
            color: #666; // 面包屑字体颜色
            margin-left: 0; // 与左边相隔距离

            .slide-fade-enter-active,
            .slide-fade-leave-active {
              transition: all 0.5s ease;
            }

            .slide-fade-enter-from {
              opacity: 0;
              transform: translateX(-20px);
            }

            .slide-fade-leave-to {
              opacity: 0;
              transform: translateX(20px);
            }
          }

          .avatar-container {
            display: flex;
            align-items: center;

            .el-dropdown__box {
              display: flex;
              align-items: center; // 确保 avatar 和 username 上下居中
              .avatar {
                margin-right: 10px; // 头像与名字间隔
              }

              .username {
                font-size: 16px; // 字体更大
                color: #333; // 字体颜色
                margin-right: 20px; // 名字与下拉菜单间隔
                font-weight: bold; // 字体加粗
              }
            }
          }
        }

        .el-divider {
          margin: 5px;
        }

        .custom-tabs {
          padding: 0 5px;

          ::v-deep .el-tabs__nav-scroll { // 使用 ::v-deep 穿透scoped样式限制
            display: flex;
            align-items: center;

            .el-tabs__nav {
              border: none; /* 移除默认边框 */
              .el-tabs__active-bar {
                display: none; /* 隐藏默认的活动指示条 */
              }

              .el-tabs__item {
                /* 设置每个标签项的样式 */
                background-color: #f5f7fa; /* 背景颜色 */
                border: 1px solid #dcdfe6; /* 边框 */
                //border-radius: 4px; /* 圆角 */
                padding: 6px 12px; /* 内边距 */
                margin-right: 5px; /* 标签项之间的间隔 */
                transition: all 0.3s; /* 平滑过渡效果 */

                /* 悬停和激活状态的样式 */
                &:hover,
                &.is-active {
                  background-color: #ffffff; /* 悬停和激活时的背景颜色 */
                  border-color: #409eff; /* 悬停和激活时的边框颜色 */
                }
              }
            }
          }
        }

      }

      .el-main {
        overflow-x: hidden; // 防止横向滚动
        position: relative; // 父容器相对定位

        .slide-enter-active,
        .slide-leave-active {
          transition: all 0.5s ease;
          position: absolute; // 绝对定位
          width: 100%; // 固定宽度
        }

        .slide-enter-from {
          opacity: 0;
          transform: translateX(-30px);
        }

        .slide-leave-to {
          opacity: 0;
          transform: translateX(30px);
        }
      }

      .el-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #666;
      }
    }
  }
}

</style>

