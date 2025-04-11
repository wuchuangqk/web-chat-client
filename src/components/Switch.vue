<template>
  <div class="win-radio" :class="{ active }" @click="setActive">
    <!-- <div class="win-radio__label">{{ active ? activedText : unActivedText }}</div> -->
    <div ref="outerRef" class="win-radio__outer">
      <div ref="innerRef" class="win-radio__inner"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick } from 'vue';

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

const setActive = () => {
  active.value = !active.value
  nextTick(() => {
    emit('change', active.value)
  })
}
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
      left: 22px;
      transition: left 0.2s;
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
  position: relative;

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