<script setup lang="ts">
import { useIpc } from '@render/plugins/ipc'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
const user = ref<User | null>(null)
const loading = ref(true)
const ipc = useIpc()
onMounted(async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 5000))
    const { data } = await ipc.send<User>('get_user_info')
    user.value = data
  }
  catch (error) {
    ElMessage.error(error.message)
  }
  finally {
    loading.value = false
  }
})

function login() {
  ipc.send('login')
}
async function get_user_info() {
  ipc.send('xxx')
}
</script>

<template>
  <div v-if="user">
    <el-avatar :src="user.avatarUrl" :size="80" />
    <div>{{ user.name }}</div>
    <div>{{ user.company }}</div>
  </div>
  <div v-else-if="user === null && !loading">
    <el-button @click="login">
      登录
    </el-button>
  </div>
  <div v-else-if="loading">
    Lodding....
  </div>
  <div style="margin-top: 20px">
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
