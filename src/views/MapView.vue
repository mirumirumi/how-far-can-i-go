<template>
  <div id="map"></div>
</template>

<script setup lang="ts">
import { inject, ref } from "vue"
import { Loader } from "@googlemaps/js-api-loader"
import { apiKey } from "@/secrets/secrets"
import { LatLng, SystemThemeConfig } from "@/utils/defines"
import { darkStyle } from "@/utils/darkStyle"

const toast: any = inject("toast")
const ZOOM = 15  // it's OK that constant value
const initialCenter = await getUserCurrentPosition()
const loader = new Loader({
  apiKey: apiKey,
  version: "weekly",
});

loader.load().then((google) => {
  new google.maps.Map(document.getElementById("map") as HTMLElement, {
    center: initialCenter,
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

function getUserCurrentPosition(): Promise<LatLng> {
    let msg = "Your device was not able to obtain information about your current location."
    if (!navigator.geolocation) toast.error(msg)
  
    return new Promise<any>((resolve, reject) => {   // eslint-disable-line
      navigator.geolocation.getCurrentPosition((location) => {
        resolve({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        })
      }, (e) => {
        msg = "Failed to get information about the current location."
        console.log(e.code);
        switch (e.code) {
          case 0:
            msg += "\nThe cause is unknown."
            break
          case 1:
            msg += "\nThe caluse is that location info acquisition was not allowed."
            break
          case 2:
            msg += "\nThe cause of this is due to signal conditions."
            break
          case 3:
            msg += "\nThis is a timeout error."
            break
        }
        toast.error(msg)
        reject(getCountryDefaultPosition())
      }, { enableHighAccuracy: true })
    })
}

function getCountryDefaultPosition(): LatLng {
  // [TODO] : ...?
  return {
    // Tokyo Sta.
    lat: 35.6809591,
    lng: 139.7673068,
  }
}

function shouldDarkMode(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
  // const config = getSystemThemeConfig()
  // return config != SystemThemeConfig.LIGHT ? true : false
}

// function getSystemThemeConfig(): SystemThemeConfig {
//   return SystemThemeConfig.LIGHT
// }

</script>

<style lang="scss" scoped>
#map {
  height: 100%;
}
</style>
<style lang="scss">
.c-toast-container {
  top: 4.44em;
}
.gmnoprint, .gm-style-cc {
  display: none !important;
}
</style>

