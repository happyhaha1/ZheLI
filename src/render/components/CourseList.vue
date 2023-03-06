<script setup lang="ts">
// import { watch } from 'vue'
import { useCoursesStore } from '@render/store'
import { ElMessage } from 'element-plus'
defineProps({
    isLoggedIn: {
        type: Boolean,
        required: true,
        default: false,
    },
})
const colors = [
    { color: '#f56c6c', percentage: 20 },
    { color: '#e6a23c', percentage: 40 },
    { color: '#5cb87a', percentage: 60 },
    { color: '#1989fa', percentage: 80 },
    { color: '#6f7ad3', percentage: 100 },
]

const coursesStore = useCoursesStore()

async function loadData() {
    try {
        await coursesStore.get_courses()
    } catch (error) {
        ElMessage.error(error.message)
    }
}
const formatQuantity = (quantity: Course): string => {
    return `全${quantity.videoNum}集`
}

const formatProgress = (quantity: Course): string => {
    return quantity.progress === 0 ? '未开始学习' : `${quantity.progress}%`
}
// 选中数据在左侧列表展示
function handleSelect(selectData) {
    coursesStore.selectionCouers = selectData
}
</script>

<template>
  <div v-if="coursesStore.isSync">
    <el-progress :percentage="coursesStore.syncProgress" type="dashboard" :color="colors" />
  </div>
  <div v-if="isLoggedIn">
    <el-table
      v-loading="coursesStore.$loading.get_courses" :data="coursesStore.cousers" style="width: 100%" height="250"
      @selection-change="handleSelect"
    >
      <el-table-column fixed type="selection" />
      <el-table-column label="课程图片">
        <template #default="{ row }">
          <img :src="row.imgUrl" alt="img" style="width: 100px; height: 60px;">
        </template>
      </el-table-column>
      <el-table-column label="课程名字" width="200">
        <template #default="{ row }">
          <a :href="`https://www.zjce.gov.cn${row.url}`" target="_blank">{{ row.name }}</a>
        </template>
      </el-table-column>
      <el-table-column prop="videoNum" label="视频数量" :formatter="formatQuantity" />
      <el-table-column prop="progress" label="视频进度" :formatter="formatProgress" />
    </el-table>
    <el-pagination
      v-model:current-page="coursesStore.meta.pageNo"
      v-model:page-size="coursesStore.meta.pageSize"
      class="pagination-wrapper"
      layout="sizes, prev, pager, next, total"
      :total="coursesStore.meta.total"
      :page-sizes="[10, 20, 30]"
      @current-change="loadData"
      @size-change="loadData"
    />

    <div v-if="!coursesStore.$loading.get_courses" style="margin-top: 20px">
      <el-button>
        开始学习
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
a {
  color: inherit; /* 继承父元素的文本颜色 */
  text-decoration: none; /* 去掉下划线 */
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

a:hover {
  box-shadow: none; /* 鼠标移上去取消阴影 */
}
</style>
