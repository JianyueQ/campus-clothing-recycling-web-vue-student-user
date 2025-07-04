<template>
  <el-form :rules="rules" :model="userData">
    <el-form-item label="用户昵称" style="width: 600px;" prop="name">
      <el-input v-model="userData.name"></el-input>
    </el-form-item>
    <el-form-item label="手机号码" style="width: 600px;" prop="contactInfo">
      <el-input v-model="userData.contactInfo"></el-input>
    </el-form-item>
    <el-form-item label="用户邮箱" style="width: 600px;" prop="email">
      <el-input v-model="userData.email"></el-input>
    </el-form-item>
    <el-form-item label="用户性别" style="width: 600px;">
      <el-radio-group v-model="userData.sex">
        <el-radio :value="1">男</el-radio>
        <el-radio :value="0">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="UpdateUser">保存</el-button>
      <!--              <el-button @click="closeForm">关闭</el-button>-->
    </el-form-item>
  </el-form>
</template>
<script setup>
import {userInfoService, userUpdateSercice} from '@/api/user';
import {useUserInfoStore} from '@/stores/user';
import {ElMessage, ElMessageBox} from 'element-plus';
import {inject, onMounted, ref} from "vue";

const store = useUserInfoStore().getInfo();
const userData = ref(
    {
      name: "",
      contactInfo: "",
      email: "",
      sex: "",
    }
)
//清除userData数据
const clearUserData = () => {
  userData.value = {
    name: "",
    contactInfo: "",
    email: "",
    sex: "",
  }
}

const rules = {
  name: [
    {required: true, message: "请输入输入用户名称", trigger: "blur"},
  ],
  email: [
    {required: true, message: "请输入用户邮箱", trigger: "blur"},
    {type: 'email', message: "邮箱格式不正确", trigger: "blur"}
  ],
  contactInfo: [
    {required: true, message: "请输入输入手机号", trigger: "blur"},
    {pattern: /^1[3-9]\d{9}$/, message: "手机号格式不正确", trigger: "blur"}
  ],
}

const UpdateUser = async () => {
  // 显示确认弹窗
  await ElMessageBox.confirm('确定要保存修改吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  });
  // 调用API
  const result = await userUpdateSercice(userData.value);
  // 成功处理
  ElMessage.success(result.message || '更新成功');
  //强制页面刷新
  window.location.reload();
}
//获取用户信息
const getUserInfo = async () => {
  const result = await userInfoService();
  userData.value = {
    name: result.data.name,
    contactInfo: result.data.contactInfo,
    email: result.data.email,
    sex: result.data.sex
  }
  useUserInfoStore().setInfo(result.data);
}
getUserInfo();
</script>
<style scoped lang="scss">
.user-profile {
  display: flex;

  .left-panel {
    width: 300px;
    padding: 20px;
    border-right: 1px solid #ebeef5;

    .avatar-container {
      text-align: center;
      margin-bottom: 20px;

      .el-avatar {
        border: 2px solid #fff;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
    }

    .info-list {
      .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        padding: 5px 0;
        border-bottom: 1px solid #f0f0f0;

        .label {
          color: #999;
          font-size: 14px;
        }

        .value {
          font-size: 16px;
        }
      }
    }
  }

  .right-panel {
    flex: 1;
    padding: 20px;

    .el-tabs {
      margin-top: 10px;
    }

    .el-form {
      max-width: 600px;

      .el-form-item {
        margin-bottom: 20px;

        .el-input,
        .el-radio-group {
          width: 100%;
        }
      }
    }

    .el-button {
      margin-right: 10px;
    }
  }
}

</style>
