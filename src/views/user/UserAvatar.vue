<template>
  <div class="user-info-head" @click="editCropper()">
    <img :src="options.img || Default" title="点击上传头像" class="img-circle img-lg"/>
    <el-dialog :title="title" v-model="open" width="800px" append-to-body @opened="modalOpened" @close="closeDialog">
      <el-row>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <vue-cropper
              ref="cropper"
              :img="options.img"
              :info="true"
              :autoCrop="options.autoCrop"
              :autoCropWidth="options.autoCropWidth"
              :autoCropHeight="options.autoCropHeight"
              :fixedBox="options.fixedBox"
              :outputType="options.outputType"
              @realTime="realTime"
              v-if="visible"
          />
        </el-col>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <div class="avatar-upload-preview">
            <img :src="options.previews.url || Default" :style="options.previews.img"/>
          </div>
        </el-col>
      </el-row>
      <br/>
      <el-row>
        <el-col :lg="2" :md="2">
          <el-upload
              action="#"
              :http-request="requestUpload"
              :show-file-list="false"
              :before-upload="beforeUpload"
          >
            <el-button>
              选择
              <el-icon class="el-icon--right">
                <Upload/>
              </el-icon>
            </el-button>
          </el-upload>
        </el-col>
        <el-col :lg="{ span: 1, offset: 2 }" :md="2">
          <el-button :icon="Plus" @click="changeScale(1)"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button :icon="Minus" @click="changeScale(-1)"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button :icon="RefreshLeft" @click="rotateLeft()"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button :icon="RefreshRight" @click="rotateRight()"></el-button>
        </el-col>
        <el-col :lg="{ span: 2, offset: 6 }" :md="2">
          <el-button type="primary" @click="uploadImg()">提 交</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup>
import "vue-cropper/dist/index.css"
import {VueCropper} from "vue-cropper"
import {uploadAvatar} from "@/api/uploadFile.js"
import {Minus, Plus, RefreshLeft, RefreshRight, Upload} from '@element-plus/icons-vue'

import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import {useUserInfoStore} from "@/stores/user.js";
import {userUpdateSercice} from "@/api/user.js";
import Default from "@/assets/images/default.png";

const userStore = useUserInfoStore().getInfo();
const userInfo = useUserInfoStore()

const {proxy} = getCurrentInstance()

const open = ref(false)
const visible = ref(false)
const title = ref("修改头像")



//图片裁剪数据
const options = reactive({
  img: userInfo.info.imagesUrl,     // 裁剪图片的地址
  autoCrop: true,            // 是否默认生成截图框
  autoCropWidth: 200,        // 默认生成截图框宽度
  autoCropHeight: 200,       // 默认生成截图框高度
  fixedBox: true,            // 固定截图框大小 不允许改变
  outputType: "png",         // 默认生成截图为PNG格式
  filename: 'avatar.png',        // 文件名称
  previews: {}               //预览数据
})

/** 编辑头像 */
async function editCropper() {
  open.value = true
}

/** 打开弹出层结束时的回调 */
function modalOpened() {
  visible.value = true
}

/** 覆盖默认上传行为 */
function requestUpload() {
}

/** 向左旋转 */
function rotateLeft() {
  proxy.$refs.cropper.rotateLeft()
}

/** 向右旋转 */
function rotateRight() {
  proxy.$refs.cropper.rotateRight()
}

/** 图片缩放 */
function changeScale(num) {
  num = num || 1
  proxy.$refs.cropper.changeScale(num)
}

/** 上传预处理 */
function beforeUpload(file) {
  if (file.type.indexOf("image/") == -1) {
    proxy.$modal.msgError("文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。")
  } else {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      options.img = reader.result
      options.filename = file.name
    }
  }
}

/** 上传图片 */
function uploadImg() {
  proxy.$refs.cropper.getCropBlob(data => {
    let formData = new FormData()
    formData.append("file", data, options.filename)
    uploadAvatar(formData).then(response => {
      open.value = false
      const newImageUrl = response.data;
      options.img = newImageUrl;
      // options.img = response.data
      userStore.imagesUrl = options.img
      userInfo.setInfo({ ...userStore, imagesUrl: newImageUrl }); // 更新全局状态中的头像字段
      proxy.$modal.msgSuccess("修改成功")
      visible.value = false
      //将图片的url路径上传到用户信息
      userUpdateSercice({imagesUrl: options.img});
    })
  })
}

/** 实时预览 */
function realTime(data) {
  options.previews = data
}

/** 关闭窗口 */
function closeDialog() {
  options.img = userStore.imagesUrl
  options.visible = false
}

watch(
    () => userInfo.info.imagesUrl,
    (newUrl) => {
      options.img = newUrl || Default;
    }
);
</script>

<style lang='scss' scoped>
.user-info-head {
  position: relative;
  display: inline-block;
  height: 115px;

  .img-lg {
    width: 120px;
    height: 116px;
  }

  .img-circle {
    border-radius: 50%; // 圆形头像
    object-fit: cover; // 覆盖模式，保证图片不失真
  }
}


.user-info-head:hover:after {
  content: "+";
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  color: #eee;
  background: rgba(0, 0, 0, 0.5);
  font-size: 24px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  cursor: pointer;
  line-height: 110px;
  border-radius: 50%;
  text-align: center;
}

.avatar-upload-preview {
  position: absolute;
  top: 50%;
  transform: translate(50%, -50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  box-shadow: 0 0 4px #ccc;
  overflow: hidden;
}
</style>
