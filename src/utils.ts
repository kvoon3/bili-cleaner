import { isMatch } from 'micromatch'
import { GM_getValue, GM_registerMenuCommand, GM_setValue, GM_unregisterMenuCommand, monkeyWindow } from '$'

export function useOption(key: string, title: string, defaultValue: boolean) {
  if (typeof GM_getValue === 'undefined') {
    return {
      value: defaultValue,
    }
  }

  let value = GM_getValue(key, defaultValue)
  const ref = {
    get value() {
      return value
    },
    set value(v) {
      value = v
      GM_setValue(key, v)
      location.reload()
    },
  }

  GM_registerMenuCommand(`${title}: ${value ? '✅' : '❌'}`, () => {
    ref.value = !value
  })

  return ref
}

export function useCommand(title: string, callback: () => void, opts?: {
  matchUrl?: string | string[]
}) {
  const {
    matchUrl,
  } = opts || {}

  console.log('matchUrl', matchUrl)

  if (!matchUrl) {
    GM_registerMenuCommand(title, callback)
  }
  else {
    let commandId: string
    const setCommand = (url: string) => {
      const matchUrls = Array.isArray(matchUrl) ? matchUrl : [matchUrl]
      const isMatched = isMatch(url, matchUrls)

      if (isMatched)
        commandId = GM_registerMenuCommand(title, callback)
      else
        GM_unregisterMenuCommand(commandId)
    }

    setCommand(monkeyWindow.location.toString())
    if (monkeyWindow.onurlchange === null)
      monkeyWindow.addEventListener('urlchange', ({ url }) => setCommand(url))
  }
}

export function intervalForEach<T>(
  list: T[],
  callback: (item: T, idx: number) => void,
  opts?: {
    delay?: number
  }) {
  return new Promise((resolve) => {
    const {
      delay = 250,
    } = opts || {}

    if (!list.length) {
      resolve('empty list')
      return
    }

    let idx = 0

    const timer = setInterval(() => {
      console.log('intervalForEach')
      callback(list[idx], idx)

      if (idx === list.length - 1) {
        clearInterval(timer)
        resolve('fillfull')
      }
      else {
        idx++
      }
    }, delay)
  })
}

export function intervalQuerySelectorAll<T extends Element>(
  selector: string,
  opts?: {
    delay?: number
    innerText?: string
    maxTryTimes?: number
  },
): Promise<Array<T>> {
  const {
    delay = 300,
    innerText = '',
    maxTryTimes = 5,
  } = opts || {}

  let tryTimes = 0
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      console.log('intervalQuerySelectorAll')
      const elList = Array.from(
        document.querySelectorAll(selector) as NodeListOf<T>,
      )
        .filter(el => innerText ? el.innerHTML.includes(innerText) : true)

      if (elList && elList.length) {
        clearInterval(timer)
        resolve(Array.from(elList))
      }
      else {
        tryTimes++

        console.log('tryTimes', tryTimes)

        if (tryTimes >= maxTryTimes) {
          console.log('timeout')

          clearInterval(timer)
          reject(new Error('timeout'))
        }
      }
    }, delay)
  })
}
