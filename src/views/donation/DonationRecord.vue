<template>
  <div class="donation-info">
    <!-- 表单筛选区域 -->
    <el-form :inline="true" label-width="90px">
      <el-form-item label="捐赠单号" style="width: 240px">
        <el-input v-model="queryParams.donationNumber" clearable placeholder="请输入捐赠单号"
                  @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item label="受捐地名称" style="width: 240px">
        <el-input v-model="queryParams.recipientArea" clearable placeholder="请输入受捐地名称"
                  @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery" :icon="Search">搜索</el-button>
        <el-button @click="resetQuery" :icon="Refresh">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 操作按钮区域 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5" :offset="22">
        <el-tooltip content="隐藏搜索" placement="top">
          <el-button plain :icon="Search" @click="hideSearch" circle></el-button>
        </el-tooltip>
      </el-col>
      <el-col :span="1.5">
        <el-tooltip content="刷新" placement="top">
          <el-button plain :icon="Refresh" @click="refreshData" circle></el-button>
        </el-tooltip>
      </el-col>
    </el-row>

    <!-- 数据表格区域 -->
    <el-table v-loading="loading" :data="tableData" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" align="center" type="index" width="60px"/>
      <el-table-column label="捐赠单号" align="center" prop="donationNumber" width="150px"/>
      <el-table-column label="受捐地区" align="center" prop="recipientArea" width="150px"/>
      <el-table-column label="处理人" align="center" prop="processors" width="150px"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link style="color: #409eff" :icon="Search" @click="handleView(scope.row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页区域 -->
    <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-size="tableData.pageSize"
        :current-page="tableData.pageNum"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
    />

    <!-- 查看详情弹窗 -->
    <el-dialog :title="detailDialogTitle" v-model="detailDialogVisible" width="60%">
      <el-table :data="[detailData]" border>
        <el-table-column prop="recipientArea" label="受捐地区" align="center"/>
        <el-table-column prop="processors" label="处理人" align="center"/>
        <el-table-column prop="feedbackContent" label="反馈内容" align="center">
          <template #default="scope">
            {{ scope.row.feedbackContent || '暂无反馈内容' }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center"/>
        <el-table-column prop="updateTime" label="更新时间" align="center"/>
      </el-table>

      <!-- 视频展示区域 -->
      <div style="margin-top: 20px;">
        <p style="font-weight: bold;">反馈视频：</p>
        <div v-if="detailData.feedbackVideo">
          <vue3-video-play
              :src="detailData.feedbackVideo" style="width: 100%; height: 300px;"
          />
        </div>
        <div v-else>
          <p>暂时没有视频</p>
        </div>
      </div>

      <template #footer>
    <span class="dialog-footer">
      <el-button @click="detailDialogVisible = false">关 闭</el-button>
    </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {reactive, ref} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import {
  getDonationByIdService,
  getDonationListService,
} from "@/api/donation";
import {Delete, EditPen, Plus, Refresh, Search} from "@element-plus/icons-vue";

const queryParams = reactive({
  donationNumber: '',
  recipientArea: '',
  pageNum: 1,
  pageSize: 10
});
const loading = ref(true);
const tableData = ref([]);
const total = ref(0);
const multipleSelection = ref([]);
const detailDialogVisible = ref(false);
const detailDialogTitle = ref('查看详情');
const detailData = ref({});
const singleSelection = ref(null);
// 弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref('新增捐赠信息');
const formRef = ref(null);
const formData = ref({
  id: '',
  recipientAreaName: '',
  recipientAreaId: null,
  feedbackContent: '',
  feedbackVideo: null
});

const isFeedbackMode = ref(false);

// 受捐地选择弹窗
const recipientSelectorVisible = ref(false);
const recipientQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  areaName: ''
});
const recipientTotal = ref(0);
const recipientList = ref([]);
const selectedRecipient = ref(null);

// 视频上传相关
const videoPreviewUrl = ref(null);


// 处理查询
const handleQuery = () => {
  getList();
};

// 重置查询参数
const resetQuery = () => {
  Object.assign(queryParams, {
    donationNumber: '',
    recipientArea: '',
    pageNum: 1,
    pageSize: 10
  });
  handleQuery();
};

// 处理分页大小变化
const handleSizeChange = (val) => {
  queryParams.pageSize = val;
  loading.value = true;
  setTimeout(() => {
    getList();
    loading.value = false;
  }, 1000);
};

// 处理当前页变化
const handleCurrentChange = (val) => {
  queryParams.pageNum = val;
  loading.value = true;
  setTimeout(() => {
    getList();
    loading.value = false;
  }, 1000);
};

// 隐藏搜索
const hideSearch = () => {
  // 隐藏搜索表单的逻辑
  console.log('隐藏搜索');
};

// 刷新数据
const refreshData = () => {
  loading.value = true;
  setTimeout(() => {
    getList();
    loading.value = false;
  }, 1000);
};

// 获取数据列表
const getList = async () => {
  loading.value = true;
  try {
    const result = await getDonationListService(queryParams);
    tableData.value = result.data.records || [];
    total.value = result.data.total || 0;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 处理选择变化
const handleSelectionChange = (selection) => {
  multipleSelection.value = selection;
};

// 处理删除
const handleDelete = (row) => {
  let ids = [];
  if (row) {
    ids.push(row.id);
  } else {
    if (multipleSelection.value.length === 0) {
      ElMessage.warning("请至少选择一条数据");
      return;
    }
    ids = multipleSelection.value.map(item => item.id);
    console.log(ids)
  }

  if (ids.length === 0) {
    ElMessage.warning("请选择要删除的数据");
    return;
  }

  ElMessageBox.confirm(`是否确定删除这些数据项？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteDonationService(ids);
      ElMessage.success('删除成功');
      await getList();
    } catch (error) {
      console.error(error);
    } finally {
      loading.value = false;
    }
  });
};

// 处理查看详情
const handleView = async (row) => {
  detailDialogTitle.value = '查看详情';
  const response = await getDonationByIdService(row.id);
  detailData.value = response.data;
  detailDialogVisible.value = true;
};



// 页面加载时获取数据
getList();
</script>

<style lang="scss" scoped>
.donation-info {
  .el-form-item {
    margin-bottom: 15px;
  }

  .el-table {
    margin-top: 15px;
  }

  .el-pagination {
    margin-top: 15px;
    text-align: right;
  }
}

.bold-label {
  font-weight: bold;
}

.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}


</style>
