<script setup lang="ts">
import { useIpc } from '@render/plugins/ipc'
import { useAppStore, useCoursesStore, useUserStore } from '@render/store'
import { ElMessage } from 'element-plus'
import { onMounted } from 'vue'
import CourseList from './CourseList.vue'
const ipc = useIpc()

const userStore = useUserStore()
const appStore = useAppStore()
const coursesStore = useCoursesStore()
async function loadData() {
    try {
        await userStore.info()
    } catch (error) {
        ElMessage.error(error.message)
    }
}

function login() {
    ipc.send('login')
}
ipc.on('login_success', async () => {
    await loadData()
})
ipc.on('sync_current', async (count: number, allPage: number) => {
    await coursesStore.get_courses()
    if (count === allPage) {
        ElMessage.success('课程全部同步完全')
        coursesStore.isSync = false
    } else {
        coursesStore.syncProgress = Math.floor((count / allPage) * 100)
    }
})
ipc.on('current_study_state', async (course: Course, percentage: number) => {
    // await loadData()
    coursesStore.receive(course, percentage)
})
ipc.on('finish_success', async () => {
    await coursesStore.empty()
    ElMessage.success('取消成功')
    coursesStore.get_courses()
})
ipc.on('stduy_error', async (e) => {
    await coursesStore.empty()
    ElMessage({
        showClose: true,
        message: `报错啦${e.message}`,
        type: 'error',
        duration: 0,
    })
})
async function logout() {
    try {
        await userStore.logout()
        ElMessage.success('退出成功')
    } catch (error) {
        ElMessage.error(error.message)
    }
}
onMounted(async () => {
    await loadData()
})
async function handleChange() {
    try {
        await appStore.chageShow()
        ElMessage.success('修改成功')
    } catch (error) {
        ElMessage.error(error.message)
    }
}
async function syncUserInfo() {
    try {
        await userStore.syncInfo()
        ElMessage.success('同步成功')
    } catch (error) {
        ElMessage.error(error.message)
    }
}
async function syncCourse() {
    try {
        await coursesStore.sync_coures()
        ElMessage.success('开始同步')
    } catch (error) {
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
        {{ userStore.company }}
        {{ userStore.name }}
      </div>
      <div class="company">
        <el-button class="btn" :disabled="coursesStore.isSync" @click="syncUserInfo">
          同步用户信息
        </el-button>
        <el-button class="btn" type="primary" :loading="coursesStore.isSync" :disabled="userStore.$loading.syncInfo" @click="syncCourse">
          同步课程信息
        </el-button>
      </div>
      <div class="logout">
        <el-switch
          v-model="appStore.show" style="--el-switch-on-color: #13ce66" active-text="显示浏览器"
          inactive-text="不显示浏览器" @change="handleChange"
        />
        <el-button class="btn" @click="logout">
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
.btn {
  margin-left: 20px;
}
</style>
