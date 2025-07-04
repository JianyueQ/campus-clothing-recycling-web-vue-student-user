import {ElMessage} from "element-plus";

export default {
    // 错误消息
    msgError(content) {
        ElMessage.error(content)
    },
    msgSuccess(content) {
        ElMessage.success(content)
    }
}
