import { logger } from './logger'
import { GM_getValue, GM_registerMenuCommand, GM_setValue } from '$'

export function useOption(key: string, title: string, defaultValue: boolean) {
  logger.log('GM_getValue', GM_getValue)
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
      logger.log('intervalForEach')
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
      logger.log('intervalQuerySelectorAll')
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

        logger.log('tryTimes', tryTimes)

        if (tryTimes >= maxTryTimes) {
          logger.log('timeout')

          clearInterval(timer)
          reject(new Error('timeout'))
        }
      }
    }, delay)
  })
}
