<template>
  <div>{{ session.isTargetJoin ? "会话进行中" : "等待对方加入" }}</div>
</template>
<script setup lang="ts">
import { useSessionStore } from "@/stores/session";

const session = useSessionStore();
</script>

<style lang="scss" scoped></style>
