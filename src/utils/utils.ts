export const delay = ((msec: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, msec);
  })
})

export const tabindexToID = ((tabindex: number, maxLength = 0): string => {
  let result = ""
  if (tabindex === 100 || tabindex === 101) {
    result = "walking"
  } else if (tabindex === 102) {
    result = "cycling"
  } else if (tabindex === 103 || tabindex === 104) {
    result = "driving"
  } else if (tabindex === 200 || tabindex === 201) {
    result = "min201"
  } else if (202 <= tabindex && tabindex <= 229) {
    result = "min" + tabindex.toString()
  } else if (tabindex === 230 || tabindex === 231) {
    result = "min230"
  } else if (tabindex === 300) {
    result = "search"
  } else if (301 <= tabindex && tabindex < 301 + maxLength) {
    result = "geo" + tabindex.toString()
  } else if (301 + maxLength <= tabindex) {
    result = "geo" + (maxLength - 1).toString()
  }
  return result
})
