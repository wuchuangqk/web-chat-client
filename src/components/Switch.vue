<template>
  <div class="win-radio" :class="{ active }" @click="setActive">
    <!-- <div class="win-radio__label">{{ active ? activedText : unActivedText }}</div> -->
    <div ref="outerRef" class="win-radio__outer">
      <div ref="innerRef" class="win-radio__inner" :style="{ left: left + 'px' }"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, useTemplateRef, ref, computed, nextTick } from 'vue';

const {
  activedText = '开',
  unActivedText = '关',
} = defineProps<{
  activedText?: string
  unActivedText?: string
}>()
const active = defineModel({ default: false })
const emit = defineEmits<{
  (e: 'change', value: boolean): void
}>()

const outerRef = useTemplateRef('outerRef')
const innerRef = useTemplateRef('innerRef')
const left = ref(0)

const setLeft = () => {
  if (active.value === true) {
    const style = getComputedStyle(outerRef.value!)
    const paddingLeft = parseFloat(style.getPropertyValue('padding-left'))
    const paddingRight = parseFloat(style.getPropertyValue('padding-right'))
    left.value = outerRef.value!.clientWidth - paddingLeft - paddingRight - innerRef.value!.offsetWidth
  } else {
    left.value = 0
  }
}
const setActive = () => {
  active.value = !active.value
  nextTick(() => {
    setLeft()
    emit('change', active.value)
  })
}

onMounted(() => {
  setLeft()
})
</script>

<style lang="scss" scoped>
.win-radio {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;

  &.active {
    .win-radio__outer {
      background-color: var(--theme-color);

      &:hover {
        background-color: #3db276;
      }
    }

    .win-radio__inner {
      background-color: #fff;
    }
  }
}

.win-radio__label {
  margin-right: 10px;
}

.win-radio__outer {
  height: 20px;
  width: 40px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  padding: 0 3px;
  background-color: #DBDBDB;
  // border: 1px solid #a2a2a2;
  box-sizing: border-box;

  &:hover {

    .win-radio__inner {
      transform: scale(1.1);
    }
  }
}

.win-radio__inner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #fff;
  transform: scale(1.0);
  transition: all 0.1s;
  position: relative;
  left: 0;
}
</style>