<script setup lang="ts">
import { useIpc } from '@render/plugins/ipc'
import { ElMessage } from 'element-plus'
defineProps({
  title: {
    type: String,
    default: 'Vite + Electron & Esbuild',
  },
})

const ipc = useIpc()

function login() {
  ipc.send('login')
}
async function get_user_info() {
  try {
    const { data } = await ipc.send<User>('get_user_info')
    ElMessage({
      message: data.name,
      type: 'success',
    })
  }
  catch (error) {
    ElMessage.error(error.message)
  }
}
</script>

<template>
  <h1>{{ title }}</h1>

  <div style="margin-top: 20px">
    <p>
      <el-button type="primary" @click="login">
        登录
      </el-button>
    </p>
    <p>
      <el-button type="primary" @click="get_user_info">
        获取用户信息
      </el-button>
    </p>
    <p>
      <el-button type="primary" c>
        测试获取课程信息
      </el-button>
    </p>
  </div>
</template>

<style></style>
