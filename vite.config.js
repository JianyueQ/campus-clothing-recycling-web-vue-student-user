import {fileURLToPath, URL} from 'node:url'
import Icons from 'unplugin-icons/vite'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'


// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue({}),
        Icons({
            // 自动加载本地 SVG 图标（无需手动创建组件）
            compiler: 'vue3',
            autoInstall: true,
            // 指定 SVG 图标存放目录（可选）
            iconDirs: ['src/assets/icons/svg'],
        }),
        Components({
            resolvers: [ElementPlusResolver()]
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    server: {
        proxy: {
            '/api': {//获取路径中包含/api的请求
                target: 'http://127.0.0.1:8888',  //获取后台所在的源
                changeOrigin: true,  //修改源
                rewrite: (path) => path.replace(/^\/api/, '')  // 将/api替换为空字符串
            }
        },
        allowedHosts: [
            'frp-act.com'
        ]
    }
})
