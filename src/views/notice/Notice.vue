<template>
  <div class="app-container">
    <el-form label-width="68px">
      <el-form-item label="公告标题" prop="noticeTitle">
        <el-input
            placeholder="请输入公告标题"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const handleQuery = () => {
  // 实现搜索逻辑
  console.log('执行搜索')
}

const resetQuery = () => {
  // 实现重置逻辑
  console.log('重置搜索')
}
</script>

<style lang="scss" scoped>

</style>
