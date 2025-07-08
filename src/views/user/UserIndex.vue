<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="8" :xs="24">
        <el-card class="box-card">
          <template v-slot:header>
            <div class="clearfix">
              <span>个人信息</span>
            </div>
          </template>
          <div class="user-info">
            <div class="avatar-container">
              <userAvatar/>
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <div>
                  <el-icon>
                    <user/>
                  </el-icon>
                  用户昵称
                </div>
                <div class="pull-right">{{ userData.name }}</div>
              </li>
              <li class="list-group-item">
                <div>
                  <el-icon>
                    <phone/>
                  </el-icon>
                  手机号码
                </div>
                <div class="pull-right">{{ userData.contactInfo }}</div>
              </li>
              <li class="list-group-item">
                <div>
                  <el-icon>
                    <Promotion/>
                  </el-icon>
                  用户邮箱
                </div>
                <div class="pull-right">{{ userData.email }}</div>
              </li>
              <li class="list-group-item">
                <div>
                  <el-icon>
                    <Avatar/>
                  </el-icon>
                  所属角色
                </div>
                <div class="pull-right">{{ userData.userType }}</div>
              </li>
              <li class="list-group-item">
                <div>
                  <el-icon>
                    <Timer/>
                  </el-icon>
                  创建日期
                </div>
                <div class="pull-right">{{ userData.createTime }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16" :xs="24">
        <el-card>
          <template v-slot:header>
            <div class="clearfix">
              <span>基本资料</span>
            </div>
          </template>
          <el-tabs v-model="selectedTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo :user="UserInfo"/>
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <UserResetPassword/>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import UserInfo from "@/views/user/UserInfo.vue";
import {onMounted, ref, watch} from "vue";
import {useRoute} from "vue-router";
import UserResetPassword from "@/views/user/UserResetPassword.vue";
import {Avatar, Phone, Promotion, Timer, User} from "@element-plus/icons-vue";
import {useUserInfoStore} from '@/stores/user';
import {computed} from 'vue';
import UserAvatar from "@/views/user/UserAvatar.vue";
import {userInfoService} from "@/api/user.js";

const selectedTab = ref("userinfo")
const route = useRoute()
const store = useUserInfoStore();


const userData = ref(
    {
      name: "",
      contactInfo: "",
      email: "",
      sex: "",
      imagesUrl: "",
      createTime: "",
      userType: "",
    }
)
const roleMap = {
  1: '学生',
  2: '回收员',
  3: '公益管理员'
};

//获取用户信息
const getUserInfo = async () => {
  const result = await userInfoService();
  const roleName = computed(() => {
    return roleMap[result.data.userType] || '未知角色';
  });
  userData.value = {
    name: result.data.name,
    contactInfo: result.data.contactInfo,
    email: result.data.email,
    sex: result.data.sex,
    userType: roleName,
    createTime: result.data.createTime,
  }
  useUserInfoStore().setInfo(result.data);
}
getUserInfo();

</script>

<style scoped lang="scss">
.app-container {
  .box-card {
    .user-info {
      .avatar-container {
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
        position: relative;

        //.el-avatar {
        //  cursor: pointer;
        //  transition: filter 0.3s;
        //}

        //.plus-icon {
        //  position: absolute;
        //  top: 50%;
        //  left: 50%;
        //  transform: translate(-50%, -50%);
        //  font-size: 24px;
        //  color: #ffffff;
        //  background-color: rgba(0, 0, 0, 0.7);
        //  border-radius: 50%;
        //  width: 40px;
        //  height: 40px;
        //  display: flex;
        //  align-items: center;
        //  justify-content: center;
        //  opacity: 0;
        //  transition: opacity 0.3s;
        //
        //  // 鼠标悬停时显示 + 号图标
        //  .avatar-container:hover & {
        //    opacity: 1  !important;
        //  }
        //}
        // 鼠标悬停时头像变暗
        //&:hover .el-avatar {
        //  filter: brightness(0.7);
        //}
      }

      .list-group {
        list-style: none; // 移除项目符号
        padding: 0; // 移除默认内边距

        .list-group-item {
          display: flex;
          align-items: center;
          justify-content: space-between; // 左右对齐
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .el-icon {
            margin-right: 1px;
            color: #999;
          }

          .label {
            flex: 1;
            color: #999;
            font-size: 14px;
          }

          .value {
            flex: 1;
            text-align: right;
            font-size: 16px;
          }
        }
      }
    }
  }
}
</style>
