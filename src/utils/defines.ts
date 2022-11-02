export const MAX_LOAD_MAP_LIMIT = 63
export const MAX_GEOCODE_LIMIT  = 21

export interface LatLng {
  lat: number,
  lng: number,
}

export enum SystemThemeConfig {
  LIGHT = "light",
  DARK = "dark",
  OS_Sync = "os",
}

export enum Transportation {
  WALKING = "walking",
  CYCLING = "cycling",
  DRIVING = "driving",
}
