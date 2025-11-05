<template>
  <div>共{{ app.usersMap.size }}台设备在线</div>
</template>
<script setup lang="ts">
import { useAppStore } from "@/client/stores/app";

const app = useAppStore();
</script>

<style lang="scss" scoped></style>
