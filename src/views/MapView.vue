<template>
  <div id="map"></div>
  <div class="ui_wrap">
    <div class="search">
      <input type="text" id="search" class="input" autocomplete="off" placeholder="Search for...">
      <SvgIcon icon="search" @click="geocode" />
    </div>
    <div class="transportation">
      <button type="button" id="transportation" class="input select_button" @click="select(`tp`)">
        <SvgIcon :icon="store.state.transportation" />
        {{ store.state.transportation.charAt(0).toUpperCase() + store.state.transportation.slice(1) }}
      </button>
      <ul v-if="selectingTp && isOpenBack">
        <li @click="selectTp(`walking`)">
          <SvgIcon icon="walking" />
          Walking
        </li>
        <li @click="selectTp(`cycling`)">
          <SvgIcon icon="cycling" />
          Cycling
        </li>
        <li @click="selectTp(`driving`)">
          <SvgIcon icon="driving" />
          Driving
        </li>
      </ul>
    </div>
    <div class="time">
      <button type="button" id="time" class="input select_button" @click="select(`time`)" v-html="`${ store.state.time } min`"></button>
      <ul v-if="selectingTime && isOpenBack">
        <li v-for="i in 30" :value="i" :key="i" @click="selectTime(i)">{{ i }} min</li>
      </ul>
    </div>
  </div>
  <teleport to="body">
    <TransparentBack v-if="isOpenBack" @click="closeSelections" />
  </teleport>
</template>

<script setup lang="ts">
import { inject, ref } from "vue"
import { Loader } from "@googlemaps/js-api-loader"
import { apiKey } from "@/secrets/secrets"
import { LatLng, SystemThemeConfig } from "@/utils/defines"
import { darkStyle } from "@/utils/darkStyle"
import TransparentBack from "@/components/modules/TransparentBack.vue"
import SvgIcon from "@/components/parts/SvgIcon.vue"
import { useStore } from "@/store"

const store = useStore()
const toast: any = inject("toast") // eslint-disable-line
const initialCenter = await getUserCurrentPosition()
const loader = new Loader({
  apiKey: apiKey,
  version: "weekly",
});

loader.load().then((google) => {
  new google.maps.Map(document.getElementById("map") as HTMLElement, {
    center:            initialCenter,
    zoom:              15,
    mapTypeControl:    false,
    fullscreenControl: false,
    streetViewControl: false,
    zoomControl:       false,
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
  return !window.matchMedia("(prefers-color-scheme: dark)").matches
  // const config = getSystemThemeConfig()
  // return config != SystemThemeConfig.LIGHT ? true : false
}

// function getSystemThemeConfig(): SystemThemeConfig {
//   return SystemThemeConfig.LIGHT
// }

const geocode = (() => {
  return
})

const selectTp = ((type: string) => {
  store.commit("setTransportation", type)
  closeSelections()
})
const selectTime = ((time: number) => {
  store.commit("setTime", time)
  closeSelections()
})

const selectingTp = ref(false)
const selectingTime = ref(false)
const isOpenBack = ref(false)
const select = (type: string) => {
  if (!isOpenBack.value) {
    if (type === "tp")    selectingTp.value   = true    
    if (type === "time")  selectingTime.value = true
    isOpenBack.value = true
  } else {
    if (type === "tp" && selectingTp.value) {
      selectingTp.value = false
      isOpenBack.value = false
    }
    if (type === "tp" && selectingTime.value) {
      selectingTp.value   = true
      selectingTime.value = false
    }
    if (type === "time" && selectingTp.value) {
      selectingTp.value   = false
      selectingTime.value = true
    }
    if (type === "time" && selectingTime.value) {
      selectingTime.value = false
      isOpenBack.value   = false
    }
  }
}

const closeSelections = (() => {
  selectingTp.value = false
  selectingTime.value = false
  isOpenBack.value = false
})

document.addEventListener("keydown", (e) => {
  if (e.key == "Escape") closeSelections()
})
</script>

<style lang="scss" scoped>
#map {
  height: 100%;
}
.ui_wrap {
  position: absolute;
  top: 2.3%;
  left: 2%;
  display: flex;
  > * {
    display: inline-block;
    margin-right: 1.3em;
    height: 46px;
  }
  .search {
    position: relative;
    input {
      width: 275px;
      font-weight: normal;
    }
    svg {
      right: 1.5em;
    }
  }
  .transportation {
    button {
      position: relative;
      width: 175px;
      padding-left: 29px;
      text-align: center;
      cursor: pointer;
      svg {
        left: 1.6em;
        height: 1.1em;
      }
    }
    li {
      padding-top: 0.5em;
      padding-bottom: 0.5em;
      padding-left: 1.9em;
      svg {
        left: 1.1em;
        height: 1.3em;
      }
    }
  }
  .time {
    button {
      width: 140px;
      padding-left: 9px;
      text-align: center;
      cursor: pointer;
    }
  }
  .transportation, .time {
    z-index: 130;
  }
  .input {
    min-width: 90px;
    height: 46px;
    padding-top: 2px;
    padding-left: 1.9em;
    padding-right: 1.3em;
    font-size: 1.03em;
    font-weight: 700;
    color: #4e4e4e;
    border: solid 0.333px #D9D9D9;
    border-radius: 29px;
    box-shadow: 2px 2px 4px 0px rgba($color: #000000, $alpha: 0.19);
    appearance: none;
  }
  ul {
    background-color: #fff;
    margin: 0.3em auto 0;
    padding: 0.4em 0 0.5em;
    width: 77%;
    max-height: 250px;
    border-radius: 5px;
    box-shadow: 2px 2px 4px 0px rgba(0,0,0, 0.19);
    overflow-y: auto;
    li {
      position: relative;
      margin: 0.05em 0 0.05em;
      text-align: center;
      cursor: pointer;
      &:hover {
        background-color: #eaeaea;
      }
    }
  }
  .select_button {
    background-color: #fff;
    background-image: url('data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%23343a40\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M2 5l6 6 6-6\'/%3e%3c/svg%3e');
    background-repeat: no-repeat;
    background-position: right 0.77rem center;
    background-size: 16px 12px;
  }
}
svg {
  top: 0;
  bottom: 0;
  margin: auto;
  width: 1.3em;
  cursor: pointer;
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

