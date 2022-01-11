<template>
  <div class="transparent_back"></div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.transparent_back {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 13;
  display: block;
  cursor: default;
  content: " ";
  background: transparent;
}
</style>
