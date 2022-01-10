<template>
  <div id="map"></div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { Loader } from "@googlemaps/js-api-loader"
import { apiKey } from "@/secrets/secrets"
import { LatLng } from "@/utils/defines"
import { darkStyle } from "@/utils/darkStyle"
import { SystemThemeConfig } from "@/utils/defines"

const ZOOM = 13  // it's OK that constant value
const initCenter = getUserCurrentPosition()

const loader = new Loader({
  apiKey: apiKey,
  version: "weekly",
});

loader.load().then((google) => {
  new google.maps.Map(document.getElementById("map") as HTMLElement, {
    center: initCenter,
    zoom: ZOOM,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    zoomControl: false,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_BOTTOM,
    },
    styles: shouldDarkMode() ? darkStyle : null,
  });
});

function getUserCurrentPosition(): LatLng {
  return {
    lat: 35.6987,
    lng: 139.374,
  }
}

function shouldDarkMode(): boolean {
  const config = getSystemThemeConfig()
  return config != SystemThemeConfig.LIGHT ? true : false
}

function getSystemThemeConfig(): SystemThemeConfig {
  return SystemThemeConfig.DARK
}


</script>

<style lang="scss" scoped>
#map {
  height: 100%;
}
</style>
