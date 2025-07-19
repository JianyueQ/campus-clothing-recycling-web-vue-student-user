<template>
  <div class="announcement">
    <!-- 表单筛选区域 -->
    <el-form :inline="true" label-width="80px">
      <el-form-item label="公告标题">
        <el-input v-model="queryParams.title" clearable placeholder="请输入公告标题" @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item label="类型" style="width: 280px;">
        <el-select v-model="queryParams.announcementType" placeholder="请选择类型" clearable>
          <el-option label="公告" :value="1"></el-option>
          <el-option label="通知" :value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery" :icon="Search">搜索</el-button>
        <el-button @click="resetQuery" :icon="Refresh">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮区域 -->
    <el-row  class="mb8" style="justify-content: space-between;">
      <el-col :span="1" :offset="22">
        <el-tooltip content="隐藏搜索" placement="top">
          <el-button plain :icon="Search" @click="hideSearch" circle></el-button>
        </el-tooltip>
      </el-col>
      <el-col :span="1">
        <el-tooltip content="刷新" placement="top">
          <el-button plain :icon="Refresh" @click="refreshData" circle></el-button>
        </el-tooltip>
      </el-col>
    </el-row>

    <!-- 数据表格区域 -->
    <el-table v-loading="loading" :data="tableData">
<!--      <el-table-column type="selection" width="55" align="center"/>-->
      <el-table-column label="序号" align="center" type="index" width="70px"/>
      <el-table-column label="公告标题" align="center" prop="title" width="250px"/>
      <el-table-column label="公告类型" align="center" prop="type" width="250px">
        <template #default="scope">
          <el-tag :type="scope.row.announcementType === '1' ? '' : 'warning'">
            {{ scope.row.announcementType === '1' ? '公告' : '通知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100px">
        <template #default="scope">
          <el-tag :type="scope.row.announcementStatus === '0' ? '' : 'info'">
            {{ scope.row.announcementStatus === '0' ? '正常' : '关闭' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="createBy" width="100px"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180px"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" :icon="Search" @click="handleView(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页区域 -->
    <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-size="queryParams.pageSize"
        :current-page="queryParams.pageNum"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
    />

    <!-- 查看详情弹窗 -->
    <el-dialog :title="detailDialogTitle" v-model="detailDialogVisible" width="50%">
      <el-form label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item>
              <template #label>
                <span class="bold-label">公告标题:</span>
              </template>
              <span class="form-value">{{ detailData.title || '-' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item>
              <template #label>
                <span class="bold-label">公告内容:</span>
              </template>
              <span class="form-value">{{ detailData.content || '-' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="bold-label">公告类型:</span>
              </template>
              <span class="form-value">{{ detailData.announcementType === '1' ? '公告' : '通知' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="bold-label">状态:</span>
              </template>
              <span class="form-value">{{ detailData.announcementStatus === '0' ? '正常' : '关闭' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="bold-label">创建时间:</span>
              </template>
              <span class="form-value">{{ detailData.createTime }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="bold-label">最后修改时间:</span>
              </template>
              <span class="form-value">{{ detailData.updateTime }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="bold-label">创建人:</span>
              </template>
              <span class="form-value">{{ detailData.createBy }}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
    <span class="dialog-footer">
      <el-button @click="detailDialogVisible = false">关 闭</el-button>
    </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import {ref, reactive} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import {Search, Refresh, Plus, EditPen, Delete} from "@element-plus/icons-vue";
import {
  getNoticeByIdService,
  getNoticeListService,
} from "@/api/notice.js";
const queryParams = reactive({
  title: '',
  createBy: '',
  announcementType: '',
  pageNum: 1,
  pageSize: 10
});

const loading = ref(true);
const tableData = ref([]);
const total = ref(2);


const handleQuery = () => {
  queryParams.pageNum = 1; // 重置到第一页
  getList();
};

const resetQuery = () => {
  Object.assign(queryParams, {
    title: '',
    createBy: '',
    announcementType: '',
    pageNum: 1,
    pageSize: 10
  });
  handleQuery();
};

// 刷新数据
const refreshData = () => {
  loading.value = true;
  //增加加载动画的时长,设置延迟
  setTimeout(() => {
    getList();
    loading.value = false;
  }, 1000);
};

const getList = async () => {
  loading.value = true;
  try {
    const res = await getNoticeListService(queryParams);
    tableData.value = res.data.records || [];
    total.value = res.data.total || 0;
  } catch (error) {
    console.error('获取公告列表失败:', error);
    // ElMessage.error('获取公告列表失败');
  } finally {
    loading.value = false;
  }
};
const handleSizeChange = (val) => {
  queryParams.pageSize = val;
  getList();
};

const handleCurrentChange = (val) => {
  queryParams.pageNum = val;
  getList();
};

// 查看详情弹窗相关
const detailDialogVisible = ref(false);
const detailDialogTitle = ref('查看详情');
const detailData = ref({});
// 查看详情
const handleView = async (row) => {
  try {
    const response = await getNoticeByIdService(row.id);
    detailData.value = response.data;
    detailDialogVisible.value = true;
  } catch (error) {
    // ElMessage.error('获取详情失败');
    console.error(error);
  }
};
// const allUser = ref([]);
//获取全部管理员用户
// function getInfoAll() {
//   getAllUserService().then(res => {
//     allUser.value = res.data;
//   })
// }

//获取全部管理员用户
// getInfoAll();
// 初始化加载数据
getList();
</script>

<style lang="scss" scoped>
.announcement {
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
  //加大字体
  font-size: 16px;
}
</style>

