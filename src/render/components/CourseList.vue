<script setup lang="ts">
import { ref, watch } from 'vue'
import { useIpc } from '@render/plugins/ipc'
import { ElMessage } from 'element-plus'
const props = defineProps({
  isLoggedIn: {
    type: Boolean,
    required: true,
    default: false,
  },
})

const ipc = useIpc()

const courses = ref<Course[] | null>(null)
const loading = ref(false)
const total = ref(1820)
const currentPage = ref(1)

const handlePageChange = async (page: number) => {
  currentPage.value = page
  await loadData(currentPage.value)
}

async function loadData(page: number) {
  loading.value = true
  try {
    const { data } = await ipc.send<Course[]>('get_courses', page)
    courses.value = data
  }
  catch (error) {
    ElMessage.error(error.message)
  }
  finally {
    loading.value = false
  }
}
const formatQuantity = (quantity: Course): string => {
  return `全${quantity.videoNum}集`
}
// 选中数据在左侧列表展示
function handleSelect(selectData) {
//   console.log(selectData)
//   defaultData.listData = val
}
watch(() => props.isLoggedIn, async (isLoggedIn) => {
  if (isLoggedIn)
    await loadData(currentPage.value)
})
</script>

<template>
  <div v-if="isLoggedIn">
    <el-table
      v-loading="loading" :data="courses" style="width: 100%"
      @selection-change="handleSelect"
    >
      <el-table-column type="selection" />
      <el-table-column label="课程图片">
        <template #default="{ row }">
          <img :src="row.imgUrl" alt="Course image" style="width: 100px; height: 60px;">
        </template>
      </el-table-column>
      <el-table-column label="课程名字">
        <template #default="{ row }">
          <a :href="`https://www.zjce.gov.cn${row.url}`">{{ row.name }}</a>
        </template>
      </el-table-column>
      <el-table-column prop="videoNum" label="视频数量" :formatter="formatQuantity" />
    </el-table>
    <el-pagination
      v-model:current-page="currentPage"
      layout="prev, pager, next"
      :total="total"
      :page-size="20"
      @current-change="handlePageChange"
    />
    <div v-if="!loading" style="margin-top: 20px">
      <el-button>
        开始学习
      </el-button>
    </div>
  </div>
</template>

<style>
a {
  color: inherit; /* 继承父元素的文本颜色 */
  text-decoration: none; /* 去掉下划线 */
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

a:hover {
  box-shadow: none; /* 鼠标移上去取消阴影 */
}
</style>
