<template>
  <div class="charity-account">
    <!-- 表单筛选区域 -->
    <el-form :inline="true" label-width="80px">
      <el-form-item label="账号名称" style="width: 240px">
        <el-input v-model="queryParams.username" clearable placeholder="请输入账号名称" @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item label="联系方式" style="width: 270px">
        <el-input v-model="queryParams.contactInfo" clearable placeholder="请输入联系方式" @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item label="状态" style="width: 270px">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="正常" value="0"></el-option>
          <el-option label="禁用" value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" style="width: 370px">
        <el-date-picker
            v-model="dateRange"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery" :icon="Search">搜索</el-button>
        <el-button @click="resetQuery" :icon="Refresh">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮区域 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain :icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain :icon="EditPen" @click="handleUpdate()"
                   :disabled="multipleSelection.length !== 1 || !canEditAccount(multipleSelection[0])">修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain :icon="Delete" @click="handleDelete()"
                   :disabled="multipleSelection.length < 1">
          删除
        </el-button>
      </el-col>
      <el-col :span="1.5" :offset="17">
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
      <el-table-column label="序号" align="center" type="index" width="70px"/>
      <el-table-column label="用户昵称" align="center" prop="name" width="130px"/>
      <el-table-column label="账号名称" align="center" prop="username" width="150px"/>
      <el-table-column label="联系方式" align="center" prop="contactInfo" width="150px"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="200px"/>
      <el-table-column label="创建人" align="center" prop="createUser" width="100px">
        <template #default="scope">
          <div v-for="item in allUser" :key="item.id">
            <span v-if="item.id==scope.row.createUser">{{ item.username }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="账号状态" align="center" width="100px">
        <template #default="scope">
          <el-switch
              :disabled="!isSuperAdmin"
              v-model="scope.row.status"
              active-value="0"
              inactive-value="1"
              @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link style="color: #409eff" :icon="Search" @click="handleView(scope.row)">查看详情</el-button>
          <el-button link style="color: #409eff" :icon="EditPen" @click="handleUpdate(scope.row)"
                     :disabled="!canEditAccount(scope.row)">修改
          </el-button>
          <el-button link style="color: #409eff" :icon="Delete" @click="handleDelete(scope.row)"
                     :disabled="!canEditAccount(scope.row)" v-if="scope.row.id !== 1">删除
          </el-button>
          <el-button link style="color: #409eff" :icon="Refresh" @click="handleResetPassword(scope.row)"
                     :disabled="!canEditAccount(scope.row)">重置密码
          </el-button>
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
    <!-- 弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="50%">
      <el-form :model="dialogForm" label-width="120px" :rules="rules">
        <el-form-item label="用户昵称" prop="name">
          <el-input v-model="dialogForm.name" placeholder="请输入用户昵称"></el-input>
        </el-form-item>
        <el-form-item label="账号名称" prop="userInfo.username">
          <el-input v-model="dialogForm.userInfo.username" placeholder="请输入账号名称"
                    :disabled="dialogType === 'edit'"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="userInfo.password" v-if="dialogType === 'add'">
          <el-input v-model="dialogForm.userInfo.password" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="dialogForm.sex">
            <el-radio :value="1">男</el-radio>
            <el-radio :value="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="超级管理员" prop="superAdmin">
          <el-radio-group v-model="dialogForm.userInfo.superAdmin" :disabled="!isSuperAdmin">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="邮箱" prop="userInfo.email">
          <el-input v-model="dialogForm.userInfo.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="联系方式" prop="contactInfo">
          <el-input v-model="dialogForm.contactInfo" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="dialogForm.remark" type="textarea" placeholder="请输入备注"></el-input>
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
                <span class="bold-label">用户昵称:</span>
              </template>
              <span class="form-value">{{ detailData.name || '-'}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="bold-label">账号名称:</span>
              </template>
              <span class="form-value">{{ detailData.userInfo?.username }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="bold-label">联系方式:</span>
              </template>
              <span class="form-value">{{ detailData.contactInfo || '-'}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="bold-label">性别:</span>
              </template>
              <span class="form-value">{{ detailData.sex === 1 ? '男' : '女' }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="bold-label">账号状态:</span>
              </template>
              <span class="form-value">{{ detailData.status === 0 ? '正常' : '禁用' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="bold-label">超级管理员:</span>
              </template>
              <span class="form-value">{{ detailData.userInfo?.superAdmin === 1 ? '是' : '否' }}</span>
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
          <el-col :span="12">
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="bold-label">创建人:</span>
              </template>
              <div v-for="item in allUser" :key="item.id">
                <span v-if="item.id==detailData.createUser">{{ item.username }}</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="bold-label">最后修改人:</span>
              </template>
              <div v-for="item in allUser" :key="item.id">
                <span v-if="item.id==detailData.updateUser">{{ item.username }}</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="bold-label">邮箱:</span>
              </template>
              <span class="form-value">{{ detailData.userInfo?.email || '-'}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="bold-label">备注:</span>
              </template>
              <span class="form-value">{{ detailData.remark || '-' }}</span>
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

    <!-- 重置密码结果弹窗 -->
    <el-dialog v-model="resetPasswordDialogVisible" title="密码已重置" width="40%">
      <div style="text-align: center; font-size: 16px;">
        <p>您重置的密码为：</p>
        <p style="margin: 20px 0; font-weight: bold; font-size: 20px; color: #f56c6c;">{{ resetPasswordValue }}</p>
        <el-button type="primary" :icon="DocumentCopy" @click="copyPassword">复制密码</el-button>
        <p style="margin-top: 10px; font-size: 12px; color: #999;">请尽快修改并妥善保管新密码</p>
      </div>
      <template #footer>
    <span class="dialog-footer">
      <el-button @click="resetPasswordDialogVisible = false">关闭</el-button>
    </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, reactive, getCurrentInstance} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import {Delete, DocumentCopy, EditPen, Plus, Refresh, Search} from "@element-plus/icons-vue";
import {
  getCharityAccountService,
  updateCharityAccountService,
  updateCharityAccountStatusService,
  addCharityAccountService,
  getCharityAccountByIdService, deleteCharityAccountService, resetCharityAccountPasswordService
} from "@/api/charityAccount.js";
import {getAllUserService} from "@/api/user.js";
import {useUserInfoStore} from "@/stores/user.js";

const validatePhone = (rule, value, callback) => {
  if (value === '' || value === null) {
    callback(); // 如果值为空，直接通过校验
  } else {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(value)) {
      callback(new Error('请输入正确的联系方式'));
    } else {
      callback();
    }
  }
};

const rules = reactive({
  name: [
    {required: true, message: '用户昵称不能为空', trigger: 'blur'}
  ],
  'userInfo.username': [
    {required: true, message: '账号名称不能为空', trigger: 'blur'}
  ],
  'userInfo.password': [
    {required: true, message: '密码不能为空', trigger: 'blur'}
  ],
  sex: [
    {required: true, message: '请选择性别', trigger: 'change'}
  ],
  contactInfo: [
    // { required: true, message: '联系方式不能为空', trigger: 'blur' }
    {validator: validatePhone, trigger: ['blur', 'change']}
  ],
  'userInfo.email': [
    // { required: true, message: '邮箱不能为空', trigger: 'blur' },
    {type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']}
  ],
});
// 表单查询参数
const queryParams = reactive({
  name: '',
  username: '',
  contactInfo: '',
  status: '',
  beginTime: '',
  endTime: '',
  pageNum: 1,
  pageSize: 10
});
// 表格加载状态
const loading = ref(true);
// 表格数据
const tableData = ref([]);
// 总条数
const total = ref(0);
// 多选数组
const multipleSelection = ref([]);
// 单个选择
const single = ref(true);
// 多个选择
const multiple = ref(true);
//从持久化存储中获取超级管理员标识
const superAdmin = useUserInfoStore()

// 弹窗相关数据
const dialogVisible = ref(false);// 是否显示弹出层
const dialogTitle = ref('新增账户');
const dialogType = ref('add'); // 'add' 或 'edit'
const isSuperAdmin = ref(false); // 是否为超级管理员
const dialogForm = reactive({
  id: '',
  name: '',
  sex: '',
  contactInfo: '',
  remark: '',
  userInfo: {
    id: '',
    superAdmin: 0,
    email: '',
    username: '',
    password: '',
  }
});

// 查看详情弹窗相关
const detailDialogVisible = ref(false);
const detailDialogTitle = ref('查看详情');
const detailData = ref({});
const getUserUsername = (userId) => {
  const user = allUser.value.find(user => user.id === userId);
  return user ? user.username : '未知';
};
// 查看详情
const handleView = async (row) => {
  try {
    const response = await getCharityAccountByIdService(row.id);
    detailData.value = response.data;
    detailDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取详情失败');
    console.error(error);
  }
};


// 查询方法
const handleQuery = () => {
  getList();
};
const dateRange = ref([]) // 定义一个日期范围变量
const {proxy} = getCurrentInstance()
// 重置方法
const resetQuery = () => {
  Object.assign(queryParams, {
    name: '',
    username: '',
    contactInfo: '',
    status: '',
    beginTime: '',
    endTime: '',
    pageNum: 1,
    pageSize: 10,
  });
  dateRange.value = [];
  handleQuery();
};
// 定义 addDateRange 方法
const addDateRange = (params, dateRange) => {
  const [start, end] = dateRange;
  if (start && end) {
    params.beginTime = start;
    params.endTime = end;
  }
  return params;
};
// 获取数据列表
const getList = async () => {
  loading.value = true;
  try {
    // 使用 addDateRange 方法处理日期范围
    const params = addDateRange({...queryParams}, dateRange.value);
    // 调用接口获取数据
    const result = await getCharityAccountService(params);
    tableData.value = result.data.records || [];
    total.value = result.data.total || 0;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 表格选中事件
const handleSelectionChange = (selection) => {
  multipleSelection.value = selection;
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
  console.log('handleSelectionChange:', multipleSelection.value);
};

// 新增操作
const handleAdd = () => {
  // 打开新增弹窗
  dialogTitle.value = '新增账户';
  dialogType.value = 'add';
  if (superAdmin.getInfo().superAdmin === 1) {
    isSuperAdmin.value = true;
  }
  Object.assign(dialogForm, {
    name: '',
    sex: '',
    remark: '',
    contactInfo: '',
    userInfo: {
      superAdmin: 0,
      email: '',
      username: '',
      password: '',
    }
  });
  dialogVisible.value = true;
};

// 修改操作
const handleUpdate = async (row) => {
  if (row) { // 单行修改
    dialogTitle.value = '修改账户';
    dialogType.value = 'edit';
    if (superAdmin.getInfo().superAdmin === 1) {
      isSuperAdmin.value = true;
    }
    // Object.assign(dialogForm, row);
    console.log('row:', row)
    // Object.assign(dialogForm, {
    //   name: '',
    //   sex: '',
    //   remark: '',
    //   contactInfo: '',
    //   userInfo: {
    //     superAdmin: 0,
    //     email: '',
    //     username: '',
    //     password: '',
    //   }
    // });
    const response = await getCharityAccountByIdService(row.id);
    Object.assign(dialogForm, response.data);
    dialogVisible.value = true;
  } else if (multipleSelection.value.length === 1) {
    const selectedRow = multipleSelection.value[0];
    console.log('Selected row:', selectedRow);
    dialogTitle.value = '修改';
    dialogType.value = 'edit';
    if (superAdmin.getInfo().superAdmin === 1) {
      isSuperAdmin.value = true;
    }
    // Object.assign(dialogForm, selectedRow);
    const response = await getCharityAccountByIdService(selectedRow.id);
    Object.assign(dialogForm, response.data);
    dialogVisible.value = true;
  }
};
// 弹窗提交处理
const handleDialogSubmit = async () => {
  try {
    // await dialogFormRef.value.validate(); // 触发表单验证
    let result;
    if (dialogType.value === 'add') {
      // 调用新增接口
      result = await addCharityAccountService(dialogForm);
      ElMessage.success('新增成功');
    } else if (dialogType.value === 'edit') {
      // 调用修改接口
      result = await updateCharityAccountService(dialogForm);
      ElMessage.success('修改成功');
    }
    // 刷新数据
    await getList();
    dialogVisible.value = false;
  } catch (error) {
    console.error(error);
    // ElMessage.error('操作失败');
  }
};
// 删除操作
const handleDelete = (row) => {
  // console.log('handleDelete called with row:', row);
  let ids = [];
  if (row) {
    // 单行删除
    ids.push(row.id);
  } else {
    // 批量删除
    // console.log('multipleSelection:', multipleSelection.value);
    if (multipleSelection.value.length === 0) {
      ElMessage.warning("请至少选择一条数据");
      return;
    }
    ids = multipleSelection.value.map(item => item.id);
  }
  if (ids.includes(1)) {
    ElMessage.warning("不能删除超级管理员账号");
    return;
  }
  if (ids.length === 0) {
    ElMessage.warning("请选择要删除的数据");
    return;
  }
  ElMessageBox.confirm(`是否确定删除这些数据项,删除可能会带来不方便的问题,请不要随意删除,最好联系删除该数据的相关人员,以免照成不必要的困扰!`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCharityAccountService(ids);
      ElMessage.success('删除成功');
      await getList(); // 刷新列表
    } catch (error) {
      console.error(error);
      // ElMessage.error('删除失败');
    } finally {
      loading.value = false;
    }
  });
};
// 分页 size 改变时触发
const handleSizeChange = (val) => {
  queryParams.pageSize = val;
  loading.value = true;
  //增加加载动画的时长,设置延迟
  setTimeout(() => {
    getList();
    loading.value = false;
  }, 1000);
};
// 分页 page 改变时触发
const handleCurrentChange = (val) => {
  queryParams.pageNum = val;
  loading.value = true;
  //增加加载动画的时长,设置延迟
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
  //增加加载动画的时长,设置延迟
  setTimeout(() => {
    getList();
    loading.value = false;
  }, 1000);
};
// 更新账号状态
const handleStatusChange = async (row) => {
  // console.log('handleStatusChange called:', row);
  try {
    // // 调用接口更新账号状态
    const result = await updateCharityAccountStatusService(row.id, row.status);
    ElMessage.success(result.data || '状态更新成功');
  } catch (error) {
    // 如果更新失败，恢复原始状态
    row.status = row.status === "1" ? "0" : "1";
    console.error(error);
  }
};
//全部管理员数据模型
const allUser = ref([]);

//获取全部管理员用户
function getInfoAll() {
  getAllUserService().then(res => {
    allUser.value = res.data;
  })
}

//根据超级管理员标识,获取权限
function getInfoBySuper() {
  const superAdmin1 = superAdmin.getInfo().superAdmin;
  if (superAdmin1 === 1) {
    isSuperAdmin.value = true;
  }
}

const canEditAccount = (row) => {
  const currentUser = superAdmin.getInfo();
  if (currentUser.superAdmin === 1) return true; // 超级管理员可编辑所有
  return row.id === currentUser.id; // 普通管理员只能编辑自己
};

//重置按钮相关功能
const resetPasswordDialogVisible = ref(false);
const resetPasswordValue = ref('');
const handleResetPassword = async (row) => {
  try {
    // 弹出确认框
    await ElMessageBox.confirm('此操作将重置该账号的密码，是否继续？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // 调用接口
    const response = await resetCharityAccountPasswordService(row.id);
    resetPasswordValue.value = response.data;
    resetPasswordDialogVisible.value = true;

  } catch (error) {
    if (error !== 'cancel') {
      // ElMessage.error('重置失败，请稍后再试');
      console.error(error);
    }
  }
};
const copyPassword = () => {
  if (!resetPasswordValue.value) return;
  navigator.clipboard.writeText(resetPasswordValue.value)
      .then(() => {
        ElMessage.success('密码已复制到剪贴板');
      })
      .catch(() => {
        ElMessage.error('复制失败，请手动复制');
      });
};

//调用获取权限函数
getInfoBySuper();
//调用获取全部管理员函数
getInfoAll();
// 初始化调用
getList();
</script>

<style lang="scss" scoped>
.charity-account {
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
