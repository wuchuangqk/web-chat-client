<template>
  <div class="flex shrink-0 py-1 px-4 items-center text-[#999]">
    <span class="mr-3">{{ memberList.length }}台设备在线</span>
    <ToolTip v-for="user in memberList" :key="user.socketId" class="mr-3">
      <template #refence>
        <Avatar :user="user" />
      </template>
      <template #content>
        <div class="whitespace-nowrap">
          <span class="text-[#999] mr-1">[{{ user.equipment }}]</span>
          <span>{{ user.name }}</span>
        </div>
      </template>
    </ToolTip>
  </div>
</template>
<script setup lang="ts">
import { useAppStore } from "@/client/stores/app";
import Avatar from "./Avatar.vue";
import ToolTip from "./ToolTip.vue";
import { memberList } from "../stores/room";

const store = useAppStore();
</script>

<style lang="scss" scoped></style>