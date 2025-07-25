import './assets/main.scss'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from '@/router'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import locale from 'element-plus/dist/locale/zh-cn.js'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import SvgIcon from "@/components/SvgIcon/index.vue";
import modalPlugin from "@/components/plugins/modalPlugin.js";
// svg图标

const app = createApp(App);
const pinia = createPinia();
const persist = createPersistedState();
import vue3videoPlay from "vue3-video-play/dist/index.mjs"; // 引入组件
import "vue3-video-play/dist/style.css"; // 引入css

pinia.use(persist)
app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale })
app.component('svg-icon', SvgIcon)
app.use(modalPlugin)
app.component('QuillEditor', QuillEditor)
app.use(vue3videoPlay);
app.mount('#app')
