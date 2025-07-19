<template>
  <!-- 注册模块 -->
  <div class="register-container">
    <el-form ref="form" autocomplete="off" :model="registerData" :rules="rules">
      <div class="title">
        <span>校园公益平台-用户端 - 注册</span>
      </div>
      <el-form-item prop="username">
        <el-input :prefix-icon="User" placeholder="请输入用户名" type="username" v-model="registerData.username"/>
      </el-form-item>
      <el-form-item prop="password">
        <el-input :prefix-icon="Lock" placeholder="请输入密码" type="password" show-password v-model="registerData.password"/>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input :prefix-icon="Lock" placeholder="请确认密码" type="rePassword" show-password v-model="registerData.rePassword"/>
      </el-form-item>
      <el-form-item prop="email">
        <el-input :prefix-icon="Message" placeholder="请输入邮箱" type="email" v-model="registerData.email"/>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <div class="captcha-container">
          <el-input
              :prefix-icon="Key"
              v-model="registerData.code"
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
        <div class="flex" style="display: flex; justify-content: space-between; width: 100%;">
            <el-link type="primary" :underline="false">忘记密码？</el-link>
            <el-link type="primary" :underline="false" style="margin-left: 10px;"  @click="goToLogin">返回登录</el-link>
        </div>
      </el-form-item>
      <!-- 注册按钮 -->
      <el-form-item>
        <el-button class="button" type="primary" auto-insert-space @click="register" :loading="loading">注册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { User, Lock, Key, Message } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { registerUserService } from "@/api/user.js";
import { useRouter } from "vue-router";
import { getVerifyCodeService, refreshVerifyCodeService } from "@/api/verifyCode.js";

const router = useRouter();
const form = ref(); // 获取 el-form 实例
const loading = ref(false); // 控制注册按钮的加载状态
const captchaEnabled = ref(true);
const verifyCodeImage = ref(''); // 验证码图片

// 用于注册的数据模型
const registerData = ref({
  username: "",
  password: "",
  rePassword: "",
  email: "",
  code: "",
  uuid: "",
});

// 定义表单校验规则
const rules = {
  username: [
    { required: true, message: "用户名不能为空", trigger: "blur" },
  ],
  password: [
    { required: true, message: "密码不能为空", trigger: "blur" },
  ],
  rePassword: [
    { required: true, message: "确认密码不能为空", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== registerData.value.password) {
          callback(new Error("两次输入密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: "邮箱不能为空", trigger: "blur" },
    {
      type: "email",
      message: "请输入正确的邮箱地址",
      trigger: ["blur", "change"],
    },
  ],
  code: [
    { required: true, message: "验证码不能为空", trigger: "blur" },
  ],
};

// 初始化获取验证码图片
const initVerifyCode = async () => {
  const response = await getVerifyCodeService();
  registerData.value.uuid = response.data.uuid;
  verifyCodeImage.value = 'data:image/png;base64,' + response.data.image;
};
initVerifyCode();

// 刷新图片
const refreshVerifyCode = async () => {
  const response = await refreshVerifyCodeService(registerData.value.uuid);
  verifyCodeImage.value = 'data:image/png;base64,' + response.data;
};

// 调用注册接口
const register = async () => {
  const valid = await form.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    const result = await registerUserService(registerData.value);
    ElMessage({ message: '注册成功', type: 'success' });
    // 注册成功后跳转到登录页面
    await router.push('/login');
  } catch (error) {
    // ElMessage({ message: '注册失败', type: 'error' });
  } finally {
    loading.value = false;
  }
};

// 定义 goToRegister 方法
const goToLogin = () => {
  router.push('/login'); // 跳转到注册页面
};
</script>

<style lang="scss" scoped>
.register-container {
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
    width: 100%;
  }

  .captcha-container {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;

    .el-input {
      flex: 1;
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
}
</style>
