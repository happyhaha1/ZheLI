<script setup lang="ts">
import { useIpc } from '@render/plugins/ipc'
import { useUserStore } from '@render/store'
import { ElMessage } from 'element-plus'
import { onMounted } from 'vue'
import CourseList from './CourseList.vue'
const ipc = useIpc()

const userStore = useUserStore()

async function loadData() {
  try {
    await userStore.info()
  }
  catch (error) {
    ElMessage.error(error.message)
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
async function logout() {
  try {
    await userStore.logout()
    ElMessage.success('退成成功')
  }
  catch (error) {
    ElMessage.error(error.message)
  }
}
</script>

<template>
  <el-row v-if="userStore.isLoggedIn" class="user-info">
    <el-col :span="4">
      <el-avatar :src="userStore.avatarUrl" :size="80" />
    </el-col>
    <el-col :span="20">
      <div class="name">
        {{ userStore.name }}
      </div>
      <div class="company">
        {{ userStore.company }}
      </div>
      <div class="logout">
        <el-button @click="logout">
          退出登录
        </el-button>
      </div>
    </el-col>
  </el-row>
  <div v-else-if="!userStore.isLoggedIn && !userStore.$loading.info">
    <el-button @click="login">
      登录
    </el-button>
  </div>
  <div v-else-if="userStore.$loading.info">
    Lodding....
  </div>
  <CourseList :is-logged-in="userStore.isLoggedIn" />
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
