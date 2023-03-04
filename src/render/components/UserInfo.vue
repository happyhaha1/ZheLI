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
// ipc.on('login_success', async () => {
//   await loadData()
// })
async function logout() {
  try {
    const { data } = await ipc.send('logout')
    ElMessage({
      message: data,
      type: 'success',
    })
    user.value = null
  }
  catch (error) {
    ElMessage.error(error.message)
  }
}
</script>

<template>
  <el-row v-if="user" class="user-info">
    <el-col :span="4">
      <el-avatar :src="user.avatarUrl" :size="80" />
    </el-col>
    <el-col :span="20">
      <div class="name">
        {{ user.name }}
      </div>
      <div class="company">
        {{ user.company }}
      </div>
      <div class="logout">
        <el-button @click="logout">
          退出登录
        </el-button>
      </div>
    </el-col>
  </el-row>
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

<style>
.user-info {
  align-items: center;
}

.name {
  font-size: 24px;
  font-weight: bold;
}

.company {
  margin-top: 10px;
}

.logout {
  margin-top: 20px;
}
</style>
