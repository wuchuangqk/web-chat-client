<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName" />
  </svg>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  icon: string, // 图标名称
  className?: string, // 自定义类名
  color?: string, // 颜色
}>(), {
  className: '',
  color: '',
})
const iconName = computed(() => `#icon-${props.icon}`)
const svgClass = computed(() => {
  if (props.className) {
    return `svg-icon ${props.className}`
  }
  return 'svg-icon'
})
</script>

<style scope lang="scss">
.sub-el-icon,
.nav-icon {
  display: inline-block;
  font-size: 15px;
  margin-right: 12px;
  position: relative;
}

.svg-icon {
  position: relative;
  fill: currentColor;
  vertical-align: -2px;
}
</style>
