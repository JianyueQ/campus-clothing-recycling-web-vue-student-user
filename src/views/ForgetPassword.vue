<template>
  <div class="reset-container">
    <el-form :model="formData" :rules="rules" ref="formRef" class="reset-form">
      <h2>忘记密码</h2>

      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" />
      </el-form-item>

      <el-form-item label="新密码" prop="password">
        <el-input v-model="formData.password" type="password" show-password />
      </el-form-item>

      <el-form-item label="确认新密码" prop="rePassword">
        <el-input v-model="formData.rePassword" type="password" show-password />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm" style="width: 100%">重置密码</el-button>
      </el-form-item>

      <div class="back-login">
        <el-link @click="goToLogin">返回登录</el-link>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { forgetPasswordService } from '@/api/user'
import router from '@/router/index'

const formRef = ref(null)
const formData = ref({
  username: '',
  email: '',
  password: '',
  rePassword: ''
})

// 验证确认密码是否一致
const validateRePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入确认密码'))
  } else if (value !== formData.value.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 验证新密码是否与用户名或邮箱相关
const validatePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入新密码'))
  } else if (value.includes(formData.value.username) || value.includes(formData.value.email)) {
    callback(new Error('密码不能包含用户名或邮箱'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    // { validator: validatePassword, trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  rePassword: [
    { required: true, message: '请输入确认密码', trigger: 'blur' },
    { validator: validateRePassword, trigger: 'blur' }
  ]
}

const submitForm = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    await ElMessageBox.confirm(
        '确定要重置密码吗？',
        '提示',
        { type: 'warning' }
    )

    await forgetPasswordService(formData.value)
    ElMessage.success('密码重置成功')
    await router.push('/login')
  } catch (error) {
    // ElMessage.error('密码重置失败')
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f5f7fa;
}

.reset-form {
  width: 400px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.reset-form h2 {
  text-align: center;
  margin-bottom: 20px;
}

.back-login {
  text-align: center;
}
</style>
