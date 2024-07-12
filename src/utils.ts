import { isMatch } from 'micromatch'
import { objectKeys } from '@antfu/utils'
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
  },
) {
  return new Promise((resolve) => {
    const {
      delay = 500,
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
    from?: Element
    delay?: number
    textContent?: string
    attrs?: Record<string, string>
    noAttrs?: Record<string, string>
    maxTryTimes?: number
  },
): Promise<Array<T>> {
  const {
    from = document,
    delay = 500,
    textContent = '',
    maxTryTimes = 5,
    attrs = {},
    noAttrs = {},
  } = opts || {}

  let tryTimes = 0
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      console.log('intervalQuerySelectorAll')
      const elList = Array.from(
        from.querySelectorAll(selector) as NodeListOf<T>,
      )
        .filter((el) => {
          if (textContent && !el.innerHTML.includes(textContent))
            return false

          const attrkeys = objectKeys(attrs)
          if (attrkeys.length)
            return attrkeys.every(key => el.getAttribute(key) === attrs[key])

          const noAttrKeys = objectKeys(noAttrs)
          if (noAttrKeys.length)
            return noAttrKeys.every(key => el.getAttribute(key) !== noAttrs[key])

          return true
        })

      if (elList && elList.length) {
        clearInterval(timer)
        resolve(Array.from(elList))
      }
      else {
        tryTimes++

        console.log('tryTimes', tryTimes)

        if (tryTimes >= maxTryTimes) {
          console.log('timeout', selector)

          clearInterval(timer)
          reject(new Error('timeout'))
        }
      }
    }, delay)
  })
}
