<template>
  <div id="map"></div>
  <div class="ui_wrap">
    <div class="search">
      <input type="text" id="search" class="input" autocomplete="off" placeholder="Search for..." v-model="query">
      <SvgIcon icon="search" @click="geocode" v-if="!isFormattedInput" />
      <ul v-if="selectingGeocode">
        <li v-for="g, i in geocodeResults" @click="selectGeocode(i)" :key="g">{{ makeReadableGeo(g.address_components) }} </li>
      </ul>
      <div class="loading" v-if="isInputting">
        <LoadSpinner />
      </div>
      <div class="transparent_filter" v-if="isFormattedInput"></div>
    </div>
    <div class="transportation">
      <button type="button" id="transportation" class="input select_button" @click="select(`tp`)">
        <SvgIcon :icon="store.state.transportation" />
        {{ store.state.transportation.charAt(0).toUpperCase() + store.state.transportation.slice(1) }}
      </button>
      <ul v-if="selectingTp && isOpenBack">
        <li @click="selectTp(`walking`)" :class="{highlight: condSelected.includes(`walking`)}">
          <SvgIcon icon="walking" />
          Walking
        </li>
        <li @click="selectTp(`cycling`)" :class="{highlight: condSelected.includes(`cycling`)}">
          <SvgIcon icon="cycling" />
          Cycling
        </li>
        <li @click="selectTp(`driving`)" :class="{highlight: condSelected.includes(`driving`)}">
          <SvgIcon icon="driving" />
          Driving
        </li>
      </ul>
    </div>
    <div class="time">
      <button type="button" id="time" class="input select_button" @click="select(`time`)" v-html="`${ store.state.time } min`"></button>
      <ul v-if="selectingTime && isOpenBack">
        <li v-for="i in 30" :value="i" :key="i" @click="selectTime(i)" :class="{highlight: condSelected.includes(i)}">{{ i }} min</li>
      </ul>
    </div>
  </div>
  <teleport to="body">
    <TransparentBack v-if="isOpenBack" @click="closeSelections" />
  </teleport>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, watch } from "vue"
import { useStore } from "@/store"
import axios from "axios"
import { Loader } from "@googlemaps/js-api-loader"
import { LatLng, SystemThemeConfig } from "@/utils/defines"
import { darkStyle } from "@/utils/darkStyle"
import TimeMapRequest from "@/utils/TimeMapRequest"
import { apiKeyGoogle, appId, apiKeyTT } from "@/secrets/secrets"
import TransparentBack from "@/components/modules/TransparentBack.vue"
import SvgIcon from "@/components/parts/SvgIcon.vue"
import LoadSpinner from "@/components/parts/LoadSpinner.vue"

/* eslint-disable */
const store = useStore()
const toast: any = inject("toast")

onMounted(() => {
  (document.querySelector("#search") as HTMLElement).focus()
})

/**
 * maps
 */
let map: any
let center = await getUserCurrentPosition()
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

  let marker = makeMarker(map, center)

  function makeMarker(map: any, position: LatLng): any {
    return new google.maps.Marker({
      map:       map,
      position:  position,
      draggable: true,
      animation: google.maps.Animation.DROP,
    })
  }

  map.addListener("center_changed", () => {
    if (center.lat !== map.getCenter().lat()  && center.lng !== map.getCenter().lng()) return
    marker.setMap(null)
    marker = makeMarker(map, center)
  })

  map.addListener("click", (e: any) => {
    const tempCenter = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    }
    center = tempCenter
    marker.setMap(null)
    marker = makeMarker(map, tempCenter)
  })

  marker.addListener("click", () => {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null)
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE)
    }
  })
})
/* eslint-enable */

function getUserCurrentPosition(): Promise<LatLng> {
  let msg = "Your device was not able to obtain information about your current location."
  if (!navigator.geolocation) toast.error(msg)

  return new Promise<any>((resolve) => {  // eslint-disable-line
    navigator.geolocation.getCurrentPosition((location) => {
      resolve({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      })
    }, (e) => {
      msg = "Failed to get information about the current location."
      console.log(e.code)
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
      resolve(getCountryDefaultPosition())
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

/**
 * theme
 */
function shouldDarkMode(): boolean {
  return !window.matchMedia("(prefers-color-scheme: dark)").matches
  // const config = getSystemThemeConfig()
  // return config != SystemThemeConfig.LIGHT ? true : false
}

// function getSystemThemeConfig(): SystemThemeConfig {
//   return SystemThemeConfig.LIGHT
// }


/**
 * geocoding
 */
let timerID = 0
let geoSelected = ""
const query = ref("")
const selectingGeocode = ref(false)
const geocodeResults = ref<Array<any>>([])
const isFormattedInput = ref(false)
const isInputting = ref(false)

watch(query, (newQuery: string) => {
  if (newQuery === "") {
    isFormattedInput.value = false
    selectingGeocode.value = false
    return
  }
  if (newQuery === geoSelected) return
  isInputting.value = true
  clearTimeout(timerID)
  timerID = setTimeout(geocode, 777)
})

const geocode = (async () => {
  geocodeResults.value.splice(0)
  let res = null
  try {
    res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${ query.value }&key=${ apiKeyGoogle }`)
  } catch (e) {
    console.log(e)
  }
  console.log(res?.data)
  selectingGeocode.value = true
  res?.data.results.forEach((r: any) => {
    geocodeResults.value.push(r)
  })
  isInputting.value = false
  return
})

const selectGeocode = ((index: number) => {
  center = {
    lat: geocodeResults.value[index].geometry.location.lat,
    lng: geocodeResults.value[index].geometry.location.lng,
  }
  map.setCenter(center)

  const result = makeReadableGeo(geocodeResults.value[index].address_components)
  geoSelected = result
  query.value = result
  isFormattedInput.value = true
  closeSelections()
})

const makeReadableGeo = ((address_components: Array<any>): string => {
  let names = ""
  for (let i = 5; 1 <= i; i--) {
    if (address_components[i] !== undefined) names += address_components[i].short_name.replace(/JP/gmi, "")
  }
  return `${ address_components[0].short_name } : ${ names === "" ? "日本" : names }`
})

/**
 * time map
 */
const getTimeMap = (async () => {
  const request = makeRequest()
  let res = null
  try {
    res = await axios.post("https://api.traveltimeapp.com/v4/time-map", 
      request
    , {
      headers: {
        "X-Application-Id": appId,
        "X-Api-Key": apiKeyTT,
        "Content-Type": "application/json; charset=UTF-8",
      },
    })
  } catch (e) {
    console.log(e)
  }
  console.log(res)
  return
})

function makeRequest(): any {
  const result = TimeMapRequest
  result.departure_searches[0].id = "mirumi.me"
  result.departure_searches[0].coords.lat = 35.8900822
  result.departure_searches[0].coords.lng = 139.45467
  result.departure_searches[0].travel_time = store.state.time * 60
  result.departure_searches[0].transportation.type = store.state.transportation
  return result
}

/**
 * ui
 */
const condSelected = ref(["walking", 10])
const selectTp = ((type: string) => {
  condSelected.value[0] = type
  store.commit("setTransportation", type)
  closeSelections()
})
const selectTime = ((time: number) => {
  condSelected.value[1] = time
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
  selectingGeocode.value = false
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
    width: 300px;
    input {
      position: relative;
      width: 100%;
      font-weight: normal;
    }
    svg {
      right: 1.5em;
    }
    ul {
      width: 90%;
      padding: 0.55em 0 0.5em;
      li {
        padding: 0.33em 1.1em 0.3em;
        font-size: 0.88em;
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow-x: hidden;
      }
    }
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 90%;
      height: 50px;
      background-color: #fff;
      margin: 0.3em auto 0;
      padding: 0.4em 0 0.5em;
      border-radius: 5px;
      box-shadow: 2px 2px 4px 0px rgba(0,0,0, 0.19);
      svg {
        transform: scale(1.5);
      }
    }
    .transparent_filter {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      right: 1.3em;
      margin: auto;
      width: 2em;
      height: 2em;
      background: linear-gradient(90deg, hsla(0, 0%, 100%, 0), #fff);
      z-index: 6;
      pointer-events: none;
      transition: all 0.23s ease-in-out;
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
  .highlight {
    background-color: #eaeaea;
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

