<script setup lang="ts">
import UserInfo from './components/UserInfo.vue'
</script>

<template>
  <el-container>
    <el-header>
      浙里学习
      <p>
        Powered by Happyhaha
      </p>
    </el-header>
    <el-main>
      <UserInfo />
    </el-main>
  </el-container>
  <el-footer>
    Copyright © 2021 浙里学习  Powered by Happyhaha
  </el-footer>
</template>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
.logo {
    width: 400px;
    border-radius: 1rem;
    box-shadow: 0 0 #0000, 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
</style>
