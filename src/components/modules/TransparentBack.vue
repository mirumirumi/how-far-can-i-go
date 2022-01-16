<template>
  <div class="transparent_back"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const p = withDefaults(defineProps<{
  zIndex?: number
}>(), {
  zIndex: 13
})

const zIndex = ref(p.zIndex)
</script>

<style lang="scss" scoped>
.transparent_back {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: v-bind(zIndex);
  display: block;
  cursor: default;
  content: " ";
  background: transparent;
}
</style>
