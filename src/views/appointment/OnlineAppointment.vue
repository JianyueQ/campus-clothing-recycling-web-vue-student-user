<template>
  <div class="offline-delivery">
    <!-- 表单筛选区域 -->
    <el-form :inline="true" label-width="80px">
      <el-form-item label="订单号" style="width: 280px;">
        <el-input v-model="queryParams.orderNumber" clearable placeholder="请输入订单号" @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item label="取件状态" style="width: 280px;">
        <el-select v-model="queryParams.pickupStatus" placeholder="请选择状态" clearable>
          <el-option label="待取件" :value="0"></el-option>
          <el-option label="取件中" :value="1"></el-option>
          <el-option label="已取件" :value="2"></el-option>
          <el-option label="已取消" :value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery" :icon="Search">搜索</el-button>
        <el-button @click="resetQuery" :icon="Refresh">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮区域 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain :icon="Plus" @click="handleAdd">我要预约</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain :icon="EditPen" @click="handleUpdate()"
                   :disabled="multipleSelection.length !== 1 || hasCancelledOrder">修改信息
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain :icon="CloseBold" @click="handleUpdateStatus()"
                   :disabled="multipleSelection.length < 1 || hasCancelledOrder">
          取消预约
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain :icon="Delete" @click="handleDelete()" :disabled="multipleSelection.length < 1">
          删除信息
        </el-button>
      </el-col>
      <el-col :span="1.5" :offset="13">
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
      <el-table-column type="selection" width="55" align="center" :disabled="hasCancelledOrder.value"/>
      <el-table-column label="序号" align="center" type="index" width="60px"/>
      <el-table-column label="订单号" align="center" prop="orderNumber" width="200px"/>
      <el-table-column label="取件预约的时间" align="center" prop="pickupTime" width="200px"/>
      <el-table-column label="取件预约的地址" align="center" prop="pickupAddress" width="200px"/>
      <el-table-column label="联系电话" align="center" prop="phoneNumber" width="130px"/>
      <el-table-column label="取件状态" align="center" prop="pickupStatus" width="80px">
        <template #default="scope">
          <el-tag :type="getTagType(scope.row.pickupStatus)">
            {{ getTagText(scope.row.pickupStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160px"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" :icon="Search" @click="handleView(scope.row)">查看</el-button>
          <el-button link type="primary" :icon="EditPen" @click="handleUpdate(scope.row)"  v-if="scope.row.pickupStatus !== 2 && scope.row.pickupStatus !== 3 && scope.row.pickupStatus !== 1">修改</el-button>
          <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          <el-button link type="danger" :icon="Delete" @click="handleUpdateStatus(scope.row)"
                     v-if="scope.row.pickupStatus !== 2 && scope.row.pickupStatus !== 1"
                     :disabled="scope.row.pickupStatus === 3">取消
          </el-button>
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

    <!-- 取消原因输入弹窗 -->
    <el-dialog title="取消订单" v-model="cancelDialogVisible" width="30%">
      <el-form label-width="90px">
        <el-form-item label="取消原因：">
          <el-input v-model="cancelReason" type="textarea" :rows="3" placeholder="请输入取消原因"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmCancel">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="50%">
      <el-form :model="dialogForm" label-width="140px" :rules="rules" ref="dialogFormRef">
        <el-form-item label="取件预约的地址" prop="pickupAddress">
          <el-input v-model="dialogForm.pickupAddress" placeholder="请输入详细的取件预约的地址"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="phoneNumber">
          <el-input v-model="dialogForm.phoneNumber" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="取件预约的时间" prop="pickupTime">
          <el-date-picker
              v-model="dialogForm.pickupTime"
              type="datetime"
              placeholder="请选择取件预约时间"
              :disabled-date="disabledDate"
              :disabled-time="disabledTime"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleDialogSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看详情弹窗 -->
    <el-dialog :title="detailDialogTitle" v-model="detailDialogVisible" width="50%">
      <el-form label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="bold-label">订单号:</span>
              </template>
              <span class="form-value">{{ detailData.orderNumber || '-' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="bold-label">回收员:</span>
              </template>
              <span class="form-value">{{ detailData.recyclerName || '未指派' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item>
              <template #label>
                <span class="bold-label">姓名:</span>
              </template>
              <span class="form-value">{{ detailData.studentName || '-' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item>
              <template #label>
                <span class="bold-label">取件地址:</span>
              </template>
              <span class="form-value">{{ detailData.pickupAddress || '-' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="bold-label">联系电话:</span>
              </template>
              <span class="form-value">{{ detailData.phoneNumber || '-' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="bold-label">预约时间:</span>
              </template>
              <span class="form-value">{{ detailData.pickupTime || '-' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="bold-label">取件状态:</span>
              </template>
              <span class="form-value">{{
                  detailData.pickupStatus === 0 ? '待取件' :
                      detailData.pickupStatus === 1 ? '取件中' :
                          detailData.pickupStatus === 2 ? '已取件' : '已取消'
                }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="detailData.pickupStatus === 3">
              <template #label>
                <span class="bold-label">取消原因:</span>
              </template>
              <span class="form-value">{{ detailData.cancelReason || '-' }}</span>
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
                <span class="bold-label">更新时间:</span>
              </template>
              <span class="form-value">{{ detailData.updateTime }}</span>
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
import {ref, reactive, computed} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import {Search, Refresh, Plus, EditPen, Delete, CloseBold} from "@element-plus/icons-vue";
import {
  getOrderListOnlineService,
  deleteOrderService,
  cancelOrderService,
  addOrderOnlineService,
  updateOrderOnlineService,
  getOrderByIdOnlineService,
} from "@/api/order.js";
import {format} from "date-fns";
import * as sevendaysLater from "date-fns";

const hasCancelledOrder = computed(() => {
  return multipleSelection.value.some(item => item.pickupStatus === 3);
});

const getTagType = (status) => {
  if (status === 0) return '';
  if (status === 1) return 'warning';
  if (status === 2) return 'success';
  if (status === 3) return 'info';
  return '';
};

const getTagText = (status) => {
  if (status === 0) return '待取件';
  if (status === 1) return '取件中';
  if (status === 2) return '已取件';
  if (status === 3) return '已取消';
  return '未知';
};

const queryParams = reactive({
  orderNumber: '',
  studentId: '',
  pickupStatus: null,
  pageNum: 1,
  pageSize: 10
});

const loading = ref(true);
const tableData = ref([]);
const total = ref(0);
const multipleSelection = ref([]);

const handleQuery = () => {
  queryParams.pageNum = 1; // 重置到第一页
  getList();
};

const resetQuery = () => {
  Object.assign(queryParams, {
    orderNumber: '',
    studentId: '',
    pickupStatus: null,
    pageNum: 1,
    pageSize: 10
  });
  handleQuery();
};

const disabledDate = (time) => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(9, 0, 0, 0); // 设置为第二天 9:00:00
  tomorrow.setDate(now.getDate() + 1);

  const maxDate = new Date(now);
  maxDate.setHours(21, 0, 0, 0); // 设置为第7天 21:00:00
  maxDate.setDate(now.getDate() + 7);

  console.log('disabledDate called with:', time);
  return time.getTime() < tomorrow.getTime() || time.getTime() > maxDate.getTime();
};

const disabledTime = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  console.log('disabledTime called with:', date);
  return hours < 9 || hours >= 21 || (minutes !== 0 && seconds !== 0);
};


// 刷新数据
const refreshData = () => {
  loading.value = true;
  setTimeout(() => {
    getList();
    loading.value = false;
  }, 1000);
};

const getList = async () => {
  loading.value = true;
  try {
    const res = await getOrderListOnlineService(queryParams);
    tableData.value = res.data.records || [];
    total.value = res.data.total || 0;
  } catch (error) {
    console.error('获取订单列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSelectionChange = (selection) => {
  multipleSelection.value = selection;
};

// 弹窗相关数据
const dialogVisible = ref(false); // 是否显示弹出层
const dialogTitle = ref('新增订单'); // 弹窗标题
const dialogType = ref('add'); // 'add' 或 'edit'
const dialogForm = reactive({
  id: '',
  pickupAddress: '',
  phoneNumber: '',
  imagesUrl: [],
  pickupTime: '',
});
const rules = reactive({
  pickupAddress: [
    {required: true, message: '取件地址不能为空', trigger: 'blur'}
  ],
  phoneNumber: [
    {required: true, message: '联系电话不能为空', trigger: 'blur'},
    {pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur'}
  ],
  pickupTime: [ // 添加 pickupTime 验证规则
    {required: true, message: '请选择取件预约时间', trigger: 'change'}
  ],
});
const dialogFormRef = ref(null);

// 打开新增弹窗
const handleAdd = () => {
  dialogTitle.value = '新增订单';
  dialogType.value = 'add';
  Object.assign(dialogForm, {
    pickupAddress: '',
    phoneNumber: '',
    imagesUrl: [],
    pickupTime: '',
  });
  dialogVisible.value = true;
};

const handleUpdate = async (row) => {
  dialogTitle.value = '修改订单';
  dialogType.value = 'edit';
  // 如果是通过点击表格行触发，则直接使用 row
  if (row) {
    const response = await getOrderByIdOnlineService(row.id);
    Object.assign(dialogForm, response.data);
  } else {
    // 如果是通过多选操作触发且仅选中一行，则取第一个元素作为数据源
    if (multipleSelection.value.length === 1) {
      const response = await getOrderByIdOnlineService(multipleSelection.value[0].id);
      Object.assign(dialogForm, response.data);
    } else {
      ElMessage.warning("请选择一条数据进行修改");
      return;
    }
  }
  dialogVisible.value = true;
};

// 提交表单
const handleDialogSubmit = async () => {
  try {
    // 触发表单验证
    const valid = await dialogFormRef.value.validate();
    if (!valid) {
      ElMessage.error('请正确填写表单！');
      return;
    }

    // 使用 date-fns 格式化 pickupTime
    if (dialogForm.pickupTime) {
      dialogForm.pickupTime = format(new Date(dialogForm.pickupTime), 'yyyy-MM-dd HH:mm:ss');
    }

    // 确保 imagesUrl 是数组格式
    const payload = {
      ...dialogForm,
    };

    let result;
    if (dialogType.value === 'add') {
      // result = await addOrderOfflineService(dialogForm);
      result = await addOrderOnlineService(payload);
      ElMessage.success('新增成功');
    } else if (dialogType.value === 'edit') {
      result = await updateOrderOnlineService(dialogForm);
      ElMessage.success('修改成功');
    }
    await getList();
    dialogVisible.value = false;
  } catch (error) {
    console.error(error);
  }
};

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
  }

  ElMessageBox.confirm('此操作将永久删除该订单, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteOrderService(ids);
      ElMessage.success('删除成功');
      await getList();
    } catch (error) {
      console.error('删除订单失败:', error);
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
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
    const response = await getOrderByIdOnlineService(row.id);
    detailData.value = response.data;
    detailDialogVisible.value = true;
  } catch (error) {
    console.error(error);
  }
};

// 新增取消订单相关数据
const cancelDialogVisible = ref(false); // 是否显示取消原因弹窗
const cancelReason = ref(''); // 取消原因
let pendingCancelIds = []; // 待处理的取消订单ID
// 修改取消订单方法 - 第一部分
const handleUpdateStatus = (row) => {
  if (!row && multipleSelection.value.length < 1) {
    ElMessage.warning("请至少选择一条数据");
    return;
  }

  // 显示取消原因弹窗
  cancelReason.value = ''; // 清空之前的取消原因
  cancelDialogVisible.value = true;

  // 保存待取消的订单ID
  if (row) {
    pendingCancelIds = [row.id];
  } else {
    pendingCancelIds = multipleSelection.value.map(item => item.id);
  }
};
// 新增确认取消方法 - 处理实际的取消操作
const confirmCancel = async () => {
  if (!cancelReason.value.trim()) {
    ElMessage.warning("请输入取消原因");
    return;
  }

  try {
    await cancelOrderService({
      ids: pendingCancelIds,
      cancelReason: cancelReason.value
    });

    ElMessage.success('取消成功');
    await getList();
  } catch (error) {
    console.error('取消订单失败:', error);
    // ElMessage.error('取消失败，请重试');
  } finally {
    // 关闭弹窗并重置数据
    cancelDialogVisible.value = false;
    cancelReason.value = '';
    pendingCancelIds = [];
  }
};

// 取消订单
// const handleUpdateStatus = (row) => {
//   if (!row && multipleSelection.value.length < 1) {
//     ElMessage.warning("请至少选择一条数据");
//     return;
//   }
//   let ids = row ? [row.id] : multipleSelection.value.map(item => item.id);
//   ElMessageBox.confirm('确定要取消这些订单吗？', '提示', {
//     confirmButtonText: '确定',
//     cancelButtonText: '取消',
//     type: 'warning'
//   }).then(async () => {
//     try {
//       await cancelOrderService(ids);
//       ElMessage.success('取消成功');
//       await getList();
//     } catch (error) {
//       console.error('取消订单失败:', error);
//     }
//   }).catch(() => {
//     ElMessage.info('已取消操作');
//   });
// };


// 初始化加载数据
getList();
</script>

<style lang="scss" scoped>
.offline-delivery {
  .el-form-item {
    //左边距
    margin-left: -20px;
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
  font-size: 16px;
}

.image-preview.photo-wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

.image-preview-item {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.preview-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.preview-image:hover {
  transform: scale(1.1);
  cursor: pointer;
}


</style>
