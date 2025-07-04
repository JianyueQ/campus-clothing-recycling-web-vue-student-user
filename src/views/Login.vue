<template>
  <!-- 登录模块 -->
  <div class="login-container">
    <el-form ref="form" autocomplete="off" :model="loginData" :rules="rules">
      <div class="title">
        <span>校园公益平台</span>
      </div>
      <el-form-item prop="username">
        <el-input :prefix-icon="User" placeholder="请输入用户名" type="username"
                  v-model="loginData.username"/>
      </el-form-item>
      <el-form-item prop="password">
        <el-input :prefix-icon="Lock" placeholder="请输入密码" type="password" show-password
                  v-model="loginData.password"/>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <div class="captcha-container">
          <el-input
              :prefix-icon="Key"
              v-model="loginData.code"
              size="large"
              auto-complete="off"
              placeholder="验证码"
          >
          </el-input>
          <div class="login-code">
            <img :src="verifyCodeImage" @click="refreshVerifyCode" class="login-code-img"/>
          </div>
        </div>
      </el-form-item>
      <el-form-item class="flex">
        <div class="flex">
          <el-checkbox>记住密码</el-checkbox>
          <!--          <el-link type="primary" :underline="false">忘记密码？</el-link>-->
        </div>
      </el-form-item>
      <!-- 登录按钮 -->
      <el-form-item>
        <el-button class="button" type="primary" auto-insert-space @click="login" :loading="loading">登录</el-button>
      </el-form-item>
    </el-form>
    <el-footer class="footer">
      <!--      校园公益平台 2025 Created by jk6-->
    </el-footer>
  </div>
</template>

<script setup>
import {ref} from "vue";
import {User, Lock, Key} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";
import {loginUserService} from "@/api/user.js";
import {useTokenStore} from "@/stores/token.js";
import router from "@/router/index.js";
import {useUserInfoStore} from "@/stores/user.js";
import {getVerifyCodeService, refreshVerifyCodeService} from "@/api/verifyCode.js";

const form = ref(); // 获取 el-form 实例
const loginErrorCount = ref(0); // 登录失败次数
const isLocked = ref(false);   // 是否被锁定
const lockDuration = 30;       // 锁定时间（秒）
const loading = ref(false)  //控制登录按钮的加载状态
const setUserInfo = useUserInfoStore() // 获取用户信息存储实例
// 验证码开关
const captchaEnabled = ref(true)
// 注册开关
const register = ref(false)
const verifyCodeImage = ref('') // 验证码图片

//用于登录的数据模型
const loginData = ref({
  username: "",
  password: "",
  code: "",
  uuid: "",
})
//清空数据模型
const clearData = () => {
  loginData.value = {
    username: "",
    password: "",
    code: "",
    uuid: "",
  };
};
//定义表单校验规则
const rules = {
  username: [
    {required: true, message: "用户名不能为空", trigger: "blur"},
  ],
  password: [
    {required: true, message: "密码不能为空", trigger: "blur"},
  ],
  code: [
    { required: true, message: "验证码不能为空", trigger: "blur" },
  ]
}
// 初始化获取验证码图片
const initVerifyCode = async () => {
  const response = await getVerifyCodeService();
  loginData.value.uuid = response.data.uuid
  // 设置图片
  verifyCodeImage.value = 'data:image/png;base64,' + response.data.image
}
initVerifyCode();
//刷新图片
const refreshVerifyCode = async () => {

  const response = await refreshVerifyCodeService(loginData.value.uuid);
  verifyCodeImage.value = 'data:image/png;base64,' + response.data
}
// 调用登录接口
const login = async () => {
  const valid = await form.value.validate().catch(() => false);
  if (!valid) return;
  if (isLocked.value) {
    ElMessage({
      showClose: true,
      message: `操作过于频繁，请 ${lockDuration} 秒后再试`,
      type: 'warning'
    });
    return;
  }
  loading.value = true;
  try {
    const result = await loginUserService(loginData.value);
    const tokenStore = useTokenStore();
    tokenStore.setToken(result.data.token);
    // setUserInfo.setInfo({name: result.data.name});
    ElMessage({message: '登录成功', type: 'success'});
    // 跳转逻辑可以在这里添加
    router.push('/');
  } catch (error) {
    loginErrorCount.value += 1;
    if (loginErrorCount.value >= 5) {
      isLocked.value = true;
      let count = lockDuration;
      const timer = setInterval(() => {
        count--;
        if (count <= 0) {
          isLocked.value = false;
          clearInterval(timer);
        }
      }, 1000);
    }
    loading.value = false;
  }

};

</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url('@/assets/login_db.png');
  background-size: cover;
  background-position: center;

  .title {
    text-align: center;
    font-size: 23px;
    //下边距
    margin-bottom: 20px;
  }

  .el-form {
    width: 400px;
    padding: 20px;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 10px;
    backdrop-filter: blur(5px);
  }

  .button {
    width: 400px;
  }

  .captcha-container {
    display: flex;
    align-items: center;
    gap: 10px; // 验证码输入框和图片之间的间距
    width: 100%;

    .el-input {
      flex: 1; // 输入框占据剩余空间
      //height: 5vh;
    }

    .login-code {
      display: flex;
      align-items: center;

      img {
        height: 40px;
        cursor: pointer;
        vertical-align: middle;
      }
    }
  }

  .footer {
    position: absolute;
    bottom: 20px;
    width: 100%;
    text-align: center;
    font-size: 14px;
    color: #070707;
  }
}
</style>
