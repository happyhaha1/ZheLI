<script setup lang="ts">
import { ref } from 'vue'

defineProps({
  isLoggedIn: {
    type: Boolean,
    required: true,
    default: false,
  },
})
const courses = ref<Course[] | null>(null)

const total = ref(10)
const pageSize = ref(5)
const currentPage = ref(1)

const handlePageChange = (page: number) => {
  currentPage.value = page
}
</script>

<template>
  <div v-if="isLoggedIn">
    <el-table :data="courses" style="width: 100%">
      <el-table-column type="selection" />
      <el-table-column label="课程图片">
        <template #default="{ row }">
          <img :src="row.imgUrl" alt="Course image" style="width: 100px; height: 60px;">
        </template>
      </el-table-column>
      <el-table-column prop="name" label="课程名字" />
    </el-table>
    <el-pagination
      v-model:current-page="currentPage"
      :total="total"
      :page-size="pageSize"
      @current-change="handlePageChange"
    />
  </div>
</template>
