<template>
  <el-form :rules="rules" :model="PwdData" ref="formRef">
    <el-form-item label="旧密码" style="width: 400px;" prop="oldPassword">
      <el-input v-model="PwdData.oldPassword" type="password" show-password></el-input>
    </el-form-item>
    <el-form-item label="新密码" style="width: 400px;" prop="newPassword">
      <el-input v-model="PwdData.newPassword" type="password" show-password></el-input>
    </el-form-item>
    <el-form-item label="确认新密码" style="width: 400px;" prop="rePassword">
      <el-input v-model="PwdData.rePassword" type="password" show-password></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="UpdatePwd">提交修改</el-button>
    </el-form-item>
  </el-form>
</template>
<script setup>
import {userInfoService, userUpdatePwdService} from '@/api/user';
import {ElMessage, ElMessageBox} from 'element-plus'
import {ref} from 'vue'
import {useTokenStore} from "@/stores/token.js";

const formRef = ref(null);
//密码的校验函数
const CheckRePassword = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请再次输入确认密码"));
  } else if (value !== PwdData.value.newPassword) {
    callback(new Error("两次输入的密码不正确"));
  } else {
    callback();
  }
};
const ChecknewPassword = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请输入新密码"));
  } else if (value === PwdData.value.oldPassword) {
    callback(new Error("新密码不能与旧密码相同"));
  } else {
    callback();
  }
};
const rules = {
  oldPassword: [
    {required: true, message: "请输入旧密码", trigger: "blur"},
    {
      min: 5,
      max: 16,
      message: "格式不正确,长度应该为5~16位",
      trigger: "blur",
    },
  ],
  newPassword: [
    {
      required: true, validator: ChecknewPassword, trigger: "blur"
    },
  ],
  rePassword: [{required: true, validator: CheckRePassword, trigger: "blur"}],
}

//密码的数据模型
const PwdData = ref(
    {
      oldPassword: "",
      newPassword: "",
      rePassword: ""
    }
)
const tokenStore = useTokenStore()
//修改密码接口的函数
const UpdatePwd = () => {
  ElMessageBox.confirm(
      '确定要修改吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    //如果输入框为空,不提交更新,并且弹出rules提示
    // 手动触发表单验证
    const valid = await formRef.value.validate();

    // 如果验证失败，直接返回，不执行后续操作
    if (!valid) return;
    let result = await userUpdatePwdService(PwdData.value)
    ElMessage({
      showClose: true,
      message: '更改成功',
      type: 'success',
    })
    setTimeout(() => {
      window.location.reload()
    }, 1500) // 延迟1.5秒刷新，让用户看到成功提示
    // tokenStore.removeToken()
  })
}
</script>
