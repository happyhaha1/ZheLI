<script setup lang="ts">
import { NButton } from 'naive-ui'
function click(): void {
    console.log('helllo')
    window.electron.ipcRenderer.send('test')
}
</script>

<template>
    <n-button type="primary" size="large" @click="click"> 使用playwright </n-button>
</template>

<style lang="less"></style>
