<template>
  <main class="view_wrap">
    <Suspense>
      <template #default>
        <router-view/>
      </template>
      <template #fallback>
        <DefaultMapView />
      </template>
    </Suspense>
  </main>
  <!-- <TheFooter></TheFooter> -->
</template>

<script setup lang="ts">
// import TheFooter from "@/components/layouts/TheFooter.vue"
import DefaultMapView from "./views/DefaultMapView.vue"
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
