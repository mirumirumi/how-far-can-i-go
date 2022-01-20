<template>
  <div id="map"></div>
  <div class="ui_wrap">
    <div class="search">
      <input type="text" id="search" class="input" autocomplete="off" placeholder="Search for..." v-model="query" @keydown="keydownForGeo" :style="attachDarkStyleUI">
      <SvgIcon icon="search" :color="isDarkCurrent ? '#fff' : '#d2d2d2'" @click="geocode" />
      <ul v-show="selectingGeocode && !isInputting">
        <li v-for="g, i in geocodeResults" @click="selectGeocode(i)" :key="g" @keydown="selectByKeys" :tabindex="301 + i" :id="`geo${ (301 + i).toString() }`">{{ makeReadableGeo(g.address_components) }}</li>
      </ul>
      <div class="loading" v-if="isInputting">
        <LoadSpinner />
      </div>
      <div class="transparent_filter"></div>
    </div>
    <div class="transportation">
      <button type="button" id="transportation" class="input select_button" @click="select(`tp`)" :style="[attachDarkStyleUI, attachDarkStyleDownArrow]">
        <SvgIcon :icon="store.state.transportation" :color="isDarkCurrent ? '#fff' : '#4e4e4e'" />
        {{ store.state.transportation.charAt(0).toUpperCase() + store.state.transportation.slice(1) }}
      </button>
      <ul v-show="selectingTp && isOpenBack">
        <li @click="selectTp(`walking`)" id="walking" tabindex="101" @keydown="selectByKeys">
          <SvgIcon icon="walking" :color="'#4e4e4e'" />
          Walking
        </li>
        <li @click="selectTp(`cycling`)" id="cycling" tabindex="102" @keydown="selectByKeys">
          <SvgIcon icon="cycling" :color="'#4e4e4e'" />
          Cycling
        </li>
        <li @click="selectTp(`driving`)" id="driving" tabindex="103" @keydown="selectByKeys">
          <SvgIcon icon="driving" :color="'#4e4e4e'" />
          Driving
        </li>
      </ul>
    </div>
    <div class="time">
      <button type="button" id="time" class="input select_button" @click="select(`time`)" v-html="`${ store.state.time } min`" :style="[attachDarkStyleUI, attachDarkStyleDownArrow]"></button>
      <ul v-show="selectingTime && isOpenBack">
        <li v-for="i in 30" :value="i" :key="i" @click="selectTime(i)" :id="`min${ (200 + i).toString() }`" :tabindex="200 + i" @keydown="selectByKeys">{{ i }} min</li>
      </ul>
    </div>
    <div class="side_menu_button">
      <button type="button" id="side_menu_button" class="input" @click="openSideMenu" :style="attachDarkStyleUI">
        <SvgIcon icon="chevron-left" :color="isDarkCurrent ? '#fff' : '#4e4e4e'"></SvgIcon>
      </button>
    </div>
  </div>
  <div class="ui_bottom_wrap">
    <div class="url_box balloon_menu" v-if="isOpenSaveBox">
      <input type="text" id="url" class="input" autocomplete="off" readonly v-model="currentFullUrl" @focus="focusedURLInput">
      <div class="description">
        <span>You can use this URL to save the map and to share it with your friends!</span>
      </div>
    </div>
    <button type="button" class="button fill submit" @click="saveMap" :style="attachDarkStylePrimaryButton">
      Save or Share
      <span class="dropdown-caret"></span>
    </button>
  </div>
  <transition name="slide">
    <div class="side_menu_wrap" v-if="isOpenSideMenu" :style="attachDarkStyleUI">
      <div class="close">
        <SvgIcon icon="close" :color="isDarkCurrent ? '#fff' : '#d5d5d5'" @click="closeSelections" />
      </div>
      <div class="settings">
        <div class="setting_item">
          <div class="setting_title">
            <span>
              Walking Speed
            </span>
          </div>
          <div class="setting_content">
            <input type="number" min="40" max="4000" v-model="walkingSpeed" class="number_input" @change="validateSpeed" :style="attachDarkStyleText"><span class="unit" :style="attachDarkStyleText">[m] / <span style="font-size: 1.3em; margin: 0 0.2em; padding: 0; vertical-align: baseline;">1</span>[min]</span>
            <span class="help">
              <SvgIcon icon="help" :color="isDarkCurrent ? '#fff' : '#b3b3b3'" />
            </span>
            <transition name="">
              <div class="help_balloon" :style="attachDarkStyleHelp">
                <div class="speed_set">
                  <SvgIcon icon="slow" :color="isDarkCurrent ? '#fff' : '#4e4e4e'" />
                  <div class="text">&nbsp;60m/min</div>
                </div>
                <div class="speed_set">
                  <SvgIcon icon="standard" :color="isDarkCurrent ? '#fff' : '#4e4e4e'" />
                  <div class="text">&nbsp;80m/min</div>
                </div>
                <div class="speed_set">
                  <SvgIcon icon="fast" :color="isDarkCurrent ? '#fff' : '#4e4e4e'" />
                  <div class="text" style="margin-left: -3px;">100m/min</div>
                </div>
                <span class="before" :style="attachDarkStyleDisplayNone"></span>
                <span class="after" :style="attachDarkStylePseudo"></span>
              </div>
            </transition>
          </div>
        </div>
        <div class="setting_item">
          <div class="setting_title">
            <span>Theme</span>
          </div>
          <div class="setting_content">
            <div class="radio_set">
              <input type="radio" id="light" value="light" name="theme" @change="selectTheme" v-model="themeChecked" :checked="themeChecked === `light`">
              <label for="light">Light</label>
            </div>
            <div class="radio_set">
              <input type="radio" id="dark" value="dark" name="theme" @change="selectTheme" v-model="themeChecked" :checked="themeChecked === `dark`">
              <label for="dark">Dark</label>
            </div>
            <div class="radio_set">
              <input type="radio" id="os_sync" value="os_sync" name="theme" @change="selectTheme" v-model="themeChecked" :checked="themeChecked === `os_sync`">
              <label for="os_sync">OS Sync</label>
            </div>
          </div>
        </div>
      </div>
      <ul class="links">
        <li><button type="button" style="display: inline;" @click="openLinks(`privacy`)">Privacy</button></li>
        <li><button type="button" style="display: inline;" @click="openLinks(`terms`)">Terms</button></li>
      </ul>
    </div>
  </transition>
  <teleport to="body">
    <TransparentBack v-if="isOpenBack" @click="closeSelections" />
    <TransparentBack v-if="isOpenBackForGeo" @click="closeSelections" :zIndex="11" />
    <transition name="fade">
      <LoadingBack v-if="isGettingTimeMap" />
    </transition>
    <transition name="fade">
      <ModalLink v-if="isOpenModalLink" :link="linkTo" />
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from "vue"
import { useStore } from "@/store"
import { useI18n } from "vue-i18n"
import { Loader } from "@googlemaps/js-api-loader"
import { LatLng } from "@/utils/defines"
import { darkStyle } from "@/utils/darkStyle"
import { apiKeyGoogle, appId, apiKeyTT } from "@/secrets/secrets"
import { tabindexToID, shouldDarkMode, getCountryDefaultPosition } from "@/utils/utils"
import axios from "axios"
import TimeMapRequest from "@/utils/TimeMapRequest"
import SvgIcon from "@/components/parts/SvgIcon.vue"
import ModalLink from "@/components/modules/ModalLink.vue"
import LoadSpinner from "@/components/parts/LoadSpinner.vue"
import LoadingBack from "@/components/modules/LoadingBack.vue"
import TransparentBack from "@/components/modules/TransparentBack.vue"

const store = useStore()
const { t, locale } = useI18n({ useScope: "global" })
const toast: any = inject("toast")

onMounted(() => {
  (document.querySelector("#search") as HTMLElement).focus()
  locale.value = navigator.language
})

/**
 * timer
 */
const requestCount = ref(0)
setInterval(() => {
  requestCount.value = 0
}, 6000 * 10)  // 1min

/**
 * maps
 */
let map: any
let center = getCountryDefaultPosition()
let polygon: any
let paths: Array<LatLng> = [{ lat: 0, lng: 0 }]
const loader = new Loader({
  apiKey: apiKeyGoogle,
  version: "weekly",
})

loader.load().then(async (google) => {
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

  if (!(new URL(location.href).searchParams.get("coords"))) {
    // Because this await in loader.load() is resolved right in the middle of gettimemap() after loading the query parameters, the evaluation of center becomes wrong. Prevent it.
    center = await getUserCurrentPosition()
  }
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

  map.setCenter(center)
})

function getUserCurrentPosition(): Promise<LatLng> {
  let msg = t("toast.notSupportGetLocation")
  if (!navigator.geolocation) toast.error(msg)

  return new Promise<any>((resolve) => {  // eslint-disable-line
    navigator.geolocation.getCurrentPosition((location) => {
      resolve({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      })
    }, (e) => {
      msg = t("toast.failedGetLocation")
      console.log(e.code)
      switch (e.code) {
        case 0:
          msg += `${ t("toast.reason0") }`
          break
        case 1:
          msg += `${ t("toast.reason1") }`
          break
        case 2:
          msg += `${ t("toast.reason2") }`
          break
        case 3:
          msg += `${ t("toast.reason3") }`
          break
      }
      toast.error(msg)
      resolve(getCountryDefaultPosition())
    }, { enableHighAccuracy: true })
  })
}

/**
 * theme
 */
const themeChecked = ref("")
const isDarkCurrent = ref(false)

onMounted(() => {
  themeChecked.value = localStorage.getItem("theme") ?? "os_sync"
  isDarkCurrent.value = shouldDarkMode()
})

const selectTheme = (() => {
  const theme = themeChecked.value
  localStorage.setItem("theme", theme)
  switch (theme) {
    case "light":
      map.setOptions({ "styles": null })
      isDarkCurrent.value = false
      break
    case "dark":
      map.setOptions({ "styles": darkStyle })
      isDarkCurrent.value = true
      break
    case "os_sync":
      if (shouldDarkMode()) {
        map.setOptions({ "styles": darkStyle })
        isDarkCurrent.value = true
      } else {
        map.setOptions({ "styles": null })
        isDarkCurrent.value = false
      }
      break
  }
})

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
  // console.log(res?.data)
  selectingGeocode.value = true
  isOpenBackForGeo.value = true
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
  if (10 <= requestCount.value) {
    toast.error(t("toast.limit"))
    return
  }
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
  requestCount.value += 1
  isGettingTimeMap.value = false
  return
})

function makeRequest(): any {
  const result = TimeMapRequest
  result.departure_searches[0].id = "mirumi.me"
  result.departure_searches[0].coords.lat = center.lat
  result.departure_searches[0].coords.lng = center.lng
  result.departure_searches[0].travel_time = Math.round(store.state.time * 60 * (store.state.walkingSpeed / 80))
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
const isOpenSideMenu = ref(false)
const isOpenBack = ref(false)
const isOpenBackForGeo = ref(false)

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

const openSideMenu = (() => {
  isOpenSideMenu.value = true
  isOpenBack.value = true
})

const closeSelections = (() => {
  selectingTp.value = false
  selectingTime.value = false
  selectingGeocode.value = false
  isOpenSideMenu.value = false
  isOpenSaveBox.value = false
  isOpenBack.value = false
  isOpenBackForGeo.value = false
  isOpenModalLink.value = false
  const url = new URL(location.href)
  url.searchParams.delete("link")
  history.pushState("", "", url)
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
  if (!url.searchParams.get("speed")) addQueryParameter("speed", "80")
  isOpenSaveBox.value = true
  isOpenBack.value = true
})

function addQueryParameter(key: string, value: string): void {
  const url = new URL(currentFullUrl.value)
  url.searchParams.set(key, value)
  currentFullUrl.value = url.toString()
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
  const paramSpeed = url.searchParams.get("speed")
  if (paramSpeed) {
    store.commit("setWalkingSpeed", parseInt(paramSpeed))
    walkingSpeed.value = parseInt(paramSpeed)
  }

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

/**
 * side menu
 */
const walkingSpeed = ref(store.state.walkingSpeed)

const validateSpeed = (() => {
  if (walkingSpeed.value < 40) {
    walkingSpeed.value = 40
  } else if (4000 < walkingSpeed.value) {
    walkingSpeed.value = 4000
  }
  store.commit("setWalkingSpeed", walkingSpeed.value)
  addQueryParameter("speed", walkingSpeed.value.toString())
})

const isOpenModalLink = ref(false)
const linkTo = ref("")

const openLinks = ((to: string) => {
  isOpenModalLink.value = true
  isOpenBack.value = true
  isOpenSideMenu.value = false
  linkTo.value = to
  const url = new URL(location.href)
  url.searchParams.set("link", to)
  history.pushState("", "", url)
})

onMounted(() => {
  const url = new URL(location.href)
  if (!url.toString().includes("?")) return

  const paramLink = url.searchParams.get("link")
  if (paramLink === "privacy" || paramLink === "terms") {
    openLinks(paramLink)
  }
})

/**
 * dark mode styles
 */
const inlineStyleUI = {
  'color': "#ffffff",
  'background-color': "#5b5651 !important",
  'border-color': "#433e35 !important",
  'box-shadow': "1px 1px 2px 0px rgba(158, 124, 92, 0.19) !important",
}
const attachDarkStyleUI = computed(() => {
  if (isDarkCurrent.value) return inlineStyleUI; return {}
})
const inlineStylePrimaryButton = {
  'background-color': "#d35d33 !important",
  'border-color': "#d35d33 !important",
}
const attachDarkStylePrimaryButton = computed(() => {
  if (isDarkCurrent.value) return inlineStylePrimaryButton; return {}
})
const inlineStyleDownArrow = {
  'background-image': "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 17'%3e%3cpath fill='none' stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e\") !important",
}
const attachDarkStyleDownArrow = computed(() => {
  if (isDarkCurrent.value) return inlineStyleDownArrow; return {}
})
const inlineStyleText = { 'color': "#ffffff" }
const attachDarkStyleText = computed(() => {
  if (isDarkCurrent.value) return inlineStyleText; return {}
})
const inlineStyleHelp = { 'background-color': "#3d3935 !important" }
const attachDarkStyleHelp = computed(() => {
  if (isDarkCurrent.value) return inlineStyleHelp; return {}
})
const inlineStyleDisplayNone = { 'display': "none !important" }
const attachDarkStyleDisplayNone = computed(() => {
  if (isDarkCurrent.value) return inlineStyleDisplayNone; return {}
})
const inlineStyleHelpPseudo = { 'border-left-color': "#3d3935 !important" }
const attachDarkStylePseudo = computed(() => {
  if (isDarkCurrent.value) return inlineStyleHelpPseudo; return {}
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
  width: calc(100% - 2%);
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
      z-index: 12;
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
      &:focus {
        border-color: #D9D9D9 !important;
        box-shadow: 2px 2px 4px 0px rgba($color: #000000, $alpha: 0.19) !important;
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
      &:focus {
        border-color: #D9D9D9 !important;
        box-shadow: 2px 2px 4px 0px rgba($color: #000000, $alpha: 0.19) !important;
      }
    }
  }
  .side_menu_button {
    position: absolute;
    right: 0;
    margin: 0;
    button {
      padding: 0 10px 0 0;
      min-width: 60px;
      background-color: #fff;
      border-radius: 29px 0 0 29px;
      cursor: pointer;
      svg {
        width: 0.7em;
      }
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
    background-color: #ffffff;
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
.side_menu_wrap {
  position: absolute;
  top: 0;
  right: 0;
  width: 350px;
  height: 100vh;
  padding: 1em 3em;
  background-color: #ffffff;
  box-shadow: -3px 0 2.5px 0 rgba($color: #000000, $alpha: 0.23);
  z-index: 14;
  .close {
    height: 40px;
    svg {
      position: absolute;
      top: 10px;
      bottom: auto;
      right: 13px;
    }
  }
  .settings {
    .setting_item {
      margin-bottom: 1.9em;
      padding-bottom: 2.15em;
      border-bottom: solid 1.5px #dedede;
      .setting_title{
        margin-bottom: 1.3em;
        span {
          font-size: 1.03em;
          font-weight: bold;
        }
      }
      .help {
        position: relative;
        display: inline-block;
        width: 18px;
        height: 18px;
        svg {
          top: 11.7px;
          bottom: 0;
          right: auto;
          left: 0.7em;
          width: 0.87em;
        }
      }
      .setting_content {
        position: relative;
        padding-left: 40px;
        .number_input {
          width: 4.7em;
          margin: 0 1em 0 0;
          padding: 0 0 4px;
          border: none;
          border-bottom: solid 1.7px #e3e3e3;
          background-color: transparent;
          color: #4e4e4e;
          font-size: 1.1em;
          font-weight: bold;
          outline: none;
          appearance: none;
          text-align: center;
          transition: 0.1s all ease-out;
          &::-webkit-outer-spin-button,
          &::-webkit-inner-spin-button {
            appearance: none;
          }
          input[type=number] {  // Firefox
            -moz-appearance: textfield;
          }
          &:focus {
            padding: 0 0 3.4px;
            border-color: #fa6e3d;
            border-width: 2.3px;
          }
        }
        .unit {
          display: inline-block;
          padding-bottom: 3px;
          font-size: 0.8em;
          color: #818181;
          vertical-align: bottom;
        }
        .radio_set {
          margin-bottom: 1px;
          input {
            width: 18px;
            height: 18px;
            margin: 0.333em 0.9em 0 0;
            vertical-align: top;
            border: 1.5px solid #c2c2c2;
            border-radius: 50%;
            background-color: #ffffff;
            appearance: none;
            outline: 0;
            transition: 0.13s all ease;
            &:checked {
              border-color: $primary;
              background-color: $primary;
              background-image: url('data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'-4 -4 8 8\'%3e%3ccircle r=\'2\' fill=\'%23fff\'/%3e%3c/svg%3e');
            }
            &:focus {
              box-shadow: 0 0 0 0.25rem rgba(242, 101, 11, 0.37)
            }
          }
          label {
            line-height: 1.7;
          }
        }
        .help_balloon {
          position: absolute;
          top: 0;
          bottom: 0;
          left: -172px;
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          row-gap: 1em;
          width: 199px;
          height: 133px;
          margin: auto;
          padding: 13px 0 13px 26px;
          border-radius: 7px;
          background-color: #fff;
          box-shadow: 2px 2px 4px 0px rgba(0,0,0, 0.19);
          > svg {
            top: 5px;
            bottom: auto;
            right: 10px;
            width: 0.8em;
          }
          .speed_set {
            position: relative;
            svg {
              left: -2.5em;
              height: 1.6em;
            }
            .text {
              font-weight: bold;
            }
          }
          .before {
            position: absolute;
            display: inline-block;
            content: "";
            right: -22px;
            border: 10px solid transparent;
            border-left-color: $balloon_border_color;
          }
          .after {
            position: absolute;
            display: inline-block;
            content: "";
            right: -20px;
            border: 10.9px solid transparent;
            border-left-color: #ffffff;
          }
        }
      }
    }
  }
  ul.links {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    text-align: center;
    li {
      display: inline;
      margin: auto 0.9em;
      button {
        display: inline;
        color: #BFBFBF;
        font-size: 1em;
        font-weight: bold;
        border: none;
        background: none;
        appearance: none;
        outline: 0;
        cursor: pointer;
      }
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
.help:hover ~ .help_balloon {
  display: flex !important;
}
.balloon_menu {
  &::before {
    position: absolute;
    display: inline-block;
    content: "";
    bottom: -16.1px;
    right: 25px;
    left: auto;
    border: 8px solid transparent;
    border-top-color: $balloon_border_color;
  }
  &::after {
    position: absolute;
    display: inline-block;
    content: "";
    bottom: -13.5px;
    right: 26px;
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
