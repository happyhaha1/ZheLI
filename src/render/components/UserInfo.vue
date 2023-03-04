<script setup lang="ts">
import { useIpc } from '@render/plugins/ipc'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import CourseList from './CourseList.vue'
const user = ref<User | null>(null)
const loading = ref(true)
const ipc = useIpc()

async function loadData() {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const { data } = await ipc.send<User>('get_user_info')
    user.value = data
  }
  catch (error) {
    ElMessage.error(error.message)
  }
  finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadData()
})

function login() {
  ipc.send('login')
}
ipc.on('login_success', async () => {
  await loadData()
})
</script>

<template>
  <div v-if="user">
    <el-avatar :src="user.avatarUrl" :size="80" />
    <div>{{ user.name }}</div>
    <div>{{ user.company }}</div>
    <div>
      <el-button @click="login">
        退出登录
      </el-button>
    </div>
  </div>
  <div v-else-if="user === null && !loading">
    <el-button @click="login">
      登录
    </el-button>
  </div>
  <div v-else-if="loading">
    Lodding....
  </div>
  <CourseList :is-logged-in="user != null" />
</template>

<style></style>
