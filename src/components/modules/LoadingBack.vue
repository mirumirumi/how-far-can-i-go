<template>
  <div class="loading_back">
    <div class="loaders">
      <div class="line-scale" style="transform: scale(1.13);">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "loaders.css"  // https://connoratherton.com/loaders
</script>

<style lang="scss" scoped>
.loading_back {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 13;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000000;
  opacity: 0.666;
  cursor: default;
  content: "";
  z-index: 999;
}
</style>
