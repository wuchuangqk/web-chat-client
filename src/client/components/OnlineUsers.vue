<template>
  <div
    v-if="session.target"
    class="flex shrink-0 py-1 px-4 items-center text-[#999]"
  >
    <span class="mr-3">对方信息</span>
    <ToolTip class="mr-3">
      <template #refence>
        <Avatar :user="session.target" />
      </template>
      <template #content>
        <div class="whitespace-nowrap">
          <span class="text-[#999] mr-1">[{{ session.target.type }}]</span>
          <span>{{ session.target.name }}</span>
        </div>
      </template>
    </ToolTip>
  </div>
</template>
<script setup lang="ts">
import { useAppStore } from "@/stores/app";
import { useSessionStore } from "@/stores/session";
import Avatar from "./Avatar.vue";
import ToolTip from "./ToolTip.vue";

const store = useAppStore();
const session = useSessionStore();
</script>

<style lang="scss" scoped></style>
