<template>
  <svg width="23" height="23" viewBox="-4 -4 45 45" xmlns="http://www.w3.org/2000/svg" :stroke="color">
    <g fill="none" fill-rule="evenodd">
      <g transform="translate(1 1)" :stroke-width="3.7">
        <circle stroke-opacity=".5" cx="18" cy="18" r="18" />
        <path d="M36 18c0-9.94-8.06-18-18-18">
          <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" repeatCount="indefinite" dur="1s" />
        </path>
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  color?: string
}>(), {
  color: "#a8a8a8"
})
</script>

<style lang="scss" scoped>
</style>
