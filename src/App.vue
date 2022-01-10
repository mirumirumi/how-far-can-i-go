<template>
  <main class="view_wrap">
    <router-view/>
  </main>
  <TheFooter></TheFooter>
</template>

<script setup lang="ts">
import TheFooter from "@/components/layouts/TheFooter.vue"
</script>

<style lang="scss">
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  color: $text;
  font-family: "Open Sans", Helvetica, "Lucida Sans Unicode", "Lucida Grande", Arial, Verdana, sans-serif;
}
#app, .view_wrap {
  height: 100%;
}
</style>
