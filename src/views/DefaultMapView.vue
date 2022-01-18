<template>
  <div id="map"></div>
  <transition name="fade">
    <LoadingBack />
  </transition>
</template>

<script setup lang="ts">
import { darkStyle } from "@/utils/darkStyle"
import { apiKeyGoogle } from "@/secrets/secrets"
import { Loader } from "@googlemaps/js-api-loader"
import { shouldDarkMode, getCountryDefaultPosition } from "@/utils/utils"
import LoadingBack from "@/components/modules/LoadingBack.vue"

let map: any
let center = getCountryDefaultPosition()
const loader = new Loader({
  apiKey: apiKeyGoogle,
  version: "weekly",
})

loader.load().then((google) => {
  map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
    center:            center,
    zoom:              15,
    mapTypeControl:    false,
    fullscreenControl: false,
    streetViewControl: false,
    zoomControl:       false,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_BOTTOM,
    },
    styles: shouldDarkMode() ? darkStyle : null,
  })
})
</script>

<style lang="scss" scoped>
</style>
