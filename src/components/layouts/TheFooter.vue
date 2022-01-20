<template>
  <div class="footer_wrap">
    <footer>
      <SvgIcon icon="twitter" color="#d4d4d4" />      
      <SvgIcon icon="github" color="#d4d4d4" />      
    </footer>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from "@/components/parts/SvgIcon.vue"
</script>

<style scoped lang="scss">
.footer_wrap {
  position: absolute;
  bottom: 5px;
  left: 0;
  width: 100%;
  footer {
    width: 100%;
    height: 100%;
    text-align: center;
    svg {
      position: static;
      display: inline-block;
      margin: auto 9px;
      height: 1.3em;
    }
  }
}
</style>
