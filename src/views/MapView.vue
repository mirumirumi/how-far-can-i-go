<template>
  <div id="map"></div>
  <div class="ui_wrap">
    <div class="search">
      <input type="text" id="search" class="input" autocomplete="off" placeholder="Search for..." v-model="query" @keydown="keydownForGeo">
      <SvgIcon icon="search" @click="geocode" />
      <ul v-show="selectingGeocode && !isInputting">
        <li v-for="g, i in geocodeResults" @click="selectGeocode(i)" :key="g" @keydown="selectByKeys" :tabindex="301 + i" :id="`geo${ (301 + i).toString() }`">{{ makeReadableGeo(g.address_components) }}</li>
      </ul>
      <div class="loading" v-if="isInputting">
        <LoadSpinner />
      </div>
      <div class="transparent_filter"></div>
    </div>
    <div class="transportation">
      <button type="button" id="transportation" class="input select_button" @click="select(`tp`)">
        <SvgIcon :icon="store.state.transportation" />
        {{ store.state.transportation.charAt(0).toUpperCase() + store.state.transportation.slice(1) }}
      </button>
      <ul v-show="selectingTp && isOpenBack">
        <li @click="selectTp(`walking`)" id="walking" tabindex="101" @keydown="selectByKeys">
          <SvgIcon icon="walking" />
          Walking
        </li>
        <li @click="selectTp(`cycling`)" id="cycling" tabindex="102" @keydown="selectByKeys">
          <SvgIcon icon="cycling" />
          Cycling
        </li>
        <li @click="selectTp(`driving`)" id="driving" tabindex="103" @keydown="selectByKeys">
          <SvgIcon icon="driving" />
          Driving
        </li>
      </ul>
    </div>
    <div class="time">
      <button type="button" id="time" class="input select_button" @click="select(`time`)" v-html="`${ store.state.time } min`"></button>
      <ul v-show="selectingTime && isOpenBack">
        <li v-for="i in 30" :value="i" :key="i" @click="selectTime(i)" :id="`min${ (200 + i).toString() }`" :tabindex="200 + i" @keydown="selectByKeys">{{ i }} min</li>
      </ul>
    </div>
  </div>
  <div class="ui_bottom_wrap">
    <div class="url_box balloon_menu" v-if="isOpenSaveBox">
      <input type="text" id="url" class="input" autocomplete="off" readonly v-model="currentFullUrl" @focus="focusedURLInput">
      <div class="description">
        <span>You can use this URL to save the map and to share it with your friends!</span>
      </div>
    </div>
    <button type="button" class="button fill submit" @click="saveMap">
      Save or Share
      <span class="dropdown-caret"></span>
    </button>
  </div>
  <teleport to="body">
    <TransparentBack v-if="isOpenBack" @click="closeSelections" />
    <TransparentBack v-if="isOpenBackGeo" @click="closeSelections" :zIndex="11" />
    <transition name="fade">
      <LoadingBack v-if="isGettingTimeMap" />
    </transition>
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
import LoadingBack from "@/components/modules/LoadingBack.vue"
import SvgIcon from "@/components/parts/SvgIcon.vue"
import LoadSpinner from "@/components/parts/LoadSpinner.vue"
import { tabindexToID } from "@/utils/utils"

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
let polygon: any
let paths: Array<LatLng> = [{ lat: 0, lng: 0 }]
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

  let marker = makeMarker()
  marker.addListener("click", markerEventCallbackClick)
  marker.addListener("dragend", markerEventCallbackDragend)

  function makeMarker(): any {
    return new google.maps.Marker({
      map:       map,
      position:  center,
      draggable: true,
      animation: google.maps.Animation.DROP,
    })
  }

  map.addListener("center_changed", () => {
    if (center.lat !== map.getCenter().lat()  && center.lng !== map.getCenter().lng()) return
    switchNewMarker()
    drawPolygon()
  })

  map.addListener("click", async (e: any) => {
    center = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    }
    switchNewMarker()
    query.value = `${ center.lat } ${ center.lng }`
    await getTimeMap()
    drawPolygon()
  })

  function switchNewMarker(): void {
    marker.setMap(null)
    marker = makeMarker()
    marker.addListener("click", markerEventCallbackClick)
    marker.addListener("dragend", markerEventCallbackDragend)
  }

  function markerEventCallbackClick() {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null)
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE)
    }
  }

  async function markerEventCallbackDragend() {
    center = {
      lat: marker.getPosition().lat(),
      lng: marker.getPosition().lng(),
    }
    query.value = `${ center.lat } ${ center.lng }`
    await getTimeMap()
    drawPolygon()
  }

  polygon = makePolygon(paths)
  polygon.setMap(map)

  function makePolygon(paths: Array<LatLng>): any {
    return new google.maps.Polygon({
      paths:         paths,
      strokeColor:   "#ff8138",
      strokeOpacity: 0.77,
      strokeWeight:  3,
      fillColor:     "#ff8138",
      fillOpacity:   0.31,
    })
  }

  function drawPolygon() :void {
    polygon.setMap(null)
    polygon = makePolygon(paths)
    polygon.setMap(map)
  }
})

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
const regexpCoords = /(\d+\.?(\d+)?) *,? *(\d+\.?(\d+)?)/gmi

watch(query, async (newQuery: string) => {
  if (newQuery === "") {
    isFormattedInput.value = false
    selectingGeocode.value = false
    return
  }
  if (newQuery === geoSelected) return
  if (newQuery.search(regexpCoords) !== -1) {
    center = {
      lat: parseFloat(newQuery.replace(regexpCoords, "$1")),
      lng: parseFloat(newQuery.replace(regexpCoords, "$3")),
    }
    return
  }
  isInputting.value = true
  clearTimeout(timerID)
  timerID = setTimeout(geocode, 777)
})

const keydownForGeo = (async (e: KeyboardEvent) => {
  if (e.key === "Enter" && query.value.search(regexpCoords) !== -1) {
    query.value = `${ center.lat } ${ center.lng }`
    execWhenQueryIsCoords()
    return
  }
  if (e.key === "ArrowDown" && !isInputting.value) {
    setTimeout(() => {
      document.getElementById("geo301")?.focus()
    }, 1)  // https://bit.ly/321pc3k
  }
})

async function execWhenQueryIsCoords(): Promise<void> {
  center = {
    lat: parseFloat(query.value.replace(regexpCoords, "$1")),
    lng: parseFloat(query.value.replace(regexpCoords, "$3")),
  }
  await getTimeMap()
  map.setCenter(center)
  return
}

const geocode = (async () => {
  if (query.value == "") return
  if (query.value.search(regexpCoords) !== -1) {
    execWhenQueryIsCoords()
    return
  }
  geocodeResults.value.splice(0)
  let res = null
  try {
    res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${ query.value }&key=${ apiKeyGoogle }`)
  } catch (e) {
    console.log(e)
  }
  console.log(res?.data)
  selectingGeocode.value = true
  isOpenBackGeo.value = true
  res?.data.results.forEach((r: any) => {
    geocodeResults.value.push(r)
  })
  isInputting.value = false
  return
})

const selectGeocode = (async (index: number) => {
  center = {
    lat: geocodeResults.value[index].geometry.location.lat,
    lng: geocodeResults.value[index].geometry.location.lng,
  }

  await getTimeMap()
  map.setCenter(center)
  map.fitBounds(makeBoundsFitted())

  const result = makeReadableGeo(geocodeResults.value[index].address_components)
  geoSelected = result
  query.value = result
  isFormattedInput.value = true
  closeSelections()
})

function makeBoundsFitted(): any {
  const result = { north: -90, east: -180, south: 90, west: 180 }
  for (const p of paths) {
    if (result.north < p.lat) result.north = p.lat
    if (result.east  < p.lng) result.east  = p.lng
    if (result.south > p.lat) result.south = p.lat
    if (result.west  > p.lng) result.west  = p.lng
  }
  return result
}

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
const isGettingTimeMap = ref(false)
const getTimeMap = (async () => {
  if (query.value === "") return
  addQueryParameter("coords", `${ center.lat } ${ center.lng }`)

  isGettingTimeMap.value = true
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
  paths = res?.data.results[0].shapes[0].shell
  isGettingTimeMap.value = false
  return
})

function makeRequest(): any {
  const result = TimeMapRequest
  result.departure_searches[0].id = "mirumi.me"
  result.departure_searches[0].coords.lat = center.lat
  result.departure_searches[0].coords.lng = center.lng
  result.departure_searches[0].travel_time = store.state.time * 60
  result.departure_searches[0].transportation.type = store.state.transportation
  return result
}

/**
 * ui
 */
const selectTp = (async (type: string) => {
  store.commit("setTransportation", type)
  closeSelections()
  await getTimeMap()
  polygon.setPaths(paths)
  addQueryParameter("type", type)
})

const selectTime = (async (time: number) => {
  store.commit("setTime", time)
  closeSelections()
  await getTimeMap()
  polygon.setPaths(paths)
  addQueryParameter("time", time.toString())
})

const selectingTp = ref(false)
const selectingTime = ref(false)
const isOpenBack = ref(false)
const isOpenBackGeo = ref(false)

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
  setTimeout(() => {
    document.getElementById(store.state.transportation)?.focus()
    document.getElementById(`min2${ store.state.time < 10 ? "0" + store.state.time.toString() : store.state.time.toString() }`)?.focus()
  }, 1)  // https://bit.ly/321pc3k
}

const selectByKeys = ((e: KeyboardEvent) => {
  e.preventDefault()
  const now = (document.activeElement as HTMLElement).tabIndex
  if (!now) return

  if (e.key === "Enter") {
    if (300 <= now) selectGeocode(now - 301)
    else if (now <= 104) selectTp(tabindexToID(now))
    else selectTime(parseInt(tabindexToID(now).slice(3)) - 200)
  }

  let to = 0
  if (e.key === "ArrowUp") {
    to = now - 1
  } else if (e.key === "ArrowDown") {
    to = now + 1
  }
  const result = tabindexToID(to, geocodeResults.value.length)
  setTimeout(() => document.getElementById(result)?.focus(), 1)
})

const closeSelections = (() => {
  selectingTp.value = false
  selectingTime.value = false
  selectingGeocode.value = false
  isOpenSaveBox.value = false
  isOpenBack.value = false
  isOpenBackGeo.value = false
})

document.addEventListener("keydown", (e) => {
  if (e.key == "Escape") closeSelections()
})

/**
 * save map
 */
const currentFullUrl = ref(location.href)
const isOpenSaveBox = ref(false)
const saveMap = (() => {
  const url = new URL(currentFullUrl.value)
  if (!url.searchParams.get("coords")) addQueryParameter("coords", `${ center.lat } ${ center.lng }`)
  if (!url.searchParams.get("type")) addQueryParameter("type", "walking")
  if (!url.searchParams.get("time")) addQueryParameter("time", "10")
  isOpenSaveBox.value = true
  isOpenBack.value = true
})

function addQueryParameter(key: string, value: string): void {
  const url = new URL(currentFullUrl.value)
  url.searchParams.set(key, value)
  window.history.pushState("", "", url)
  currentFullUrl.value = location.href
}

/**
 * read query parameters
 */
onMounted(async () => {
  const url = new URL(location.href)
  if (!url.toString().includes("?")) return

  const paramCoords = url.searchParams.get("coords")
  if (paramCoords) query.value = paramCoords
  const paramType = url.searchParams.get("type")
  if (paramType) store.commit("setTransportation", paramType)
  const paramTime = url.searchParams.get("time")
  if (paramTime) store.commit("setTime", paramTime)

  const tempLat = parseFloat(query.value.replace(regexpCoords, "$1"))
  const tempLng = parseFloat(query.value.replace(regexpCoords, "$3")) 

  if (!isNaN(tempLat) && !isNaN(tempLng)) {
    center = {
      lat: tempLat,
      lng: tempLng,
    }
  }

  await getTimeMap()
  try {
    map.setCenter(center)
    map.fitBounds(makeBoundsFitted())
  } catch {1}  // For some reason, setCenter() here gives an error only when there are no coords in the query parameters (it works fine). I couldn't figure out why, so I had no choice but to enclose it.
})

const focusedURLInput = ((e: any) => {
  e.target.select()
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
      padding-right: 3em;
      font-weight: normal;
      z-index: 12;
    }
    svg {
      right: 1.5em;
      z-index: 7;
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
      right: 3em;
      margin: auto;
      width: 1em;
      height: 2em;
      background: linear-gradient(90deg, hsla(0, 0%, 100%, 0), #fff);
      z-index: 6;
      pointer-events: none;
      transition: all 0.23s ease-in-out;
    }
    #search:focus ~ .transparent_filter {
      display: none;
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
    &:focus {
      border-color: #D9D9D9 !important;
      box-shadow: 2px 2px 4px 0px rgba($color: #000000, $alpha: 0.19) !important;
    }
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
      z-index: 130;
      &:hover {
        background-color: #eaeaea;
      }
      &:focus {
        background-color: #eaeaea;
        outline: 0;
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
$balloon_border_color: #e2dedc;
.ui_bottom_wrap {
  position: absolute;
  bottom: 3.7%;
  right: 3.3%;
  .url_box {
    position: absolute;
    bottom: 57.5px;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: 7px;
    width: 300px;
    height: 110px;
    padding: 1.08em 1.1em 1em;
    background-color: #fff;
    border: solid 1px $balloon_border_color;
    border-radius: 7px;
    box-shadow: 1px 1px 5px 0px rgba($color: #000000, $alpha: 0.21);
    z-index: 130;
    .input {
      width: 100%;
      padding: 5px 9px;
      border: solid 1px #e4e4e4;
      border-radius: 6px;
      background-color: #f6f8fa;
      color: #37342f;
      font-family: ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace;
      vertical-align: middle;
      outline: none;
      appearance: none;
    }
    .description {
      line-height: 1.1;
      span {
        color: #7c7877;
        font-size: 0.8em;
      }
    }
  }
  button {
    font-size: 1.03em;
    font-weight: 700;
    border-radius: 7px;
    box-shadow: 2px 2px 4px 0px rgba($color: #000000, $alpha: 0.19);
    .dropdown-caret {
      display: inline-block;
      width: 0;
      height: 0;
      margin: 0 0 1px 3.5px;
      vertical-align: middle;
      content: "";
      border-style: solid;
      border-width: 4px 4px 0;
      border-right-color: transparent;
      border-bottom-color: transparent;
      border-left-color: transparent;
    }
  }
}
svg {
  top: 0;
  bottom: 0;
  margin: auto;
  width: 1.3em;
  cursor: pointer;
}
.balloon_menu {
  &::before {
    position: absolute;
    display: inline-block;
    content: "";
    bottom: -16px;
    right: 25px;
    left: auto;
    border: 8px solid transparent;
    border-top-color: $balloon_border_color;
  }
  &::after {
    position: absolute;
    display: inline-block;
    content: "";
    bottom: -13.6px;
    right: 25.6px;
    left: auto;
    border: 7px solid transparent;
    border-top-color: #ffffff;
  }
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

