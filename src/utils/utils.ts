export const delay = ((msec: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, msec);
  })
})

export const tabindexToID = ((tabindex: number): string => {
  let result = ""
  switch (tabindex) {
    case 100:
      result = "walking"
      break
    case 101:
      result = "walking"
      break
    case 102:
      result = "cycling"
      break
    case 103:
      result = "driving"
      break
    case 104:
      result = "driving"
      break
    case 105:
      result = "min1"
      break
    case 106:
      result = "min1"
      break
    case 107:
      result = "min2"
      break
    case 108:
      result = "min3"
      break
    case 109:
      result = "min4"
      break
    case 110:
      result = "min5"
      break
    case 111:
      result = "min6"
      break
    case 112:
      result = "min7"
      break
    case 113:
      result = "min8"
      break
    case 114:
      result = "min9"
      break
    case 115:
      result = "min10"
      break
    case 116:
      result = "min11"
      break
    case 117:
      result = "min12"
      break
    case 118:
      result = "min13"
      break
    case 119:
      result = "min14"
      break
    case 120:
      result = "min15"
      break
    case 121:
      result = "min16"
      break
    case 122:
      result = "min17"
      break
    case 123:
      result = "min18"
      break
    case 124:
      result = "min19"
      break
    case 125:
      result = "min20"
      break
    case 126:
      result = "min21"
      break
    case 127:
      result = "min22"
      break
    case 128:
      result = "min23"
      break
    case 129:
      result = "min24"
      break
    case 130:
      result = "min25"
      break
    case 131:
      result = "min26"
      break
    case 132:
      result = "min27"
      break
    case 133:
      result = "min28"
      break
    case 134:
      result = "min29"
      break
    case 135:
      result = "min30"
      break
    case 136:
      result = "min30"
      break
  }
  return result
})
