<template>
  <input ref="fileUploaderRef" type="file" multiple style="display: none" />
</template>
<script setup lang="ts">
import { debug } from "@/utils";
import { onMounted, ref } from "vue";

const emits = defineEmits(["change"]);

const fileUploaderRef = ref<HTMLInputElement>();

const chooseFile = () => {
  fileUploaderRef.value?.click();
};
const fileChange = (event: Event) => {
  const target = event!.target as HTMLInputElement;
  if (!target.files) return;
  let arr = [];
  for (let i = 0; i < target.files.length; i++) {
    arr.push({
      name: target.files[i].name,
      type: target.files[i].type,
    });
  }
  debug({ files: arr });
  emits("change", target.files);
  // prepareTransfer(target.files)
};

onMounted(() => {
  fileUploaderRef.value?.addEventListener("change", fileChange);
});

defineExpose({ chooseFile });
</script>

<style lang="scss" scoped></style>
