// ==UserScript==
// @name         bili-cleaner
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  clear bilibili followers
// @author       kwongliegaai
// @match        https://space.bilibili.com/*/fans/follow*
// @match        https://space.bilibili.com/*/favlist*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @grant        GM_unregisterMenuCommand
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue

// ==/UserScript==

// @ts-check
/* eslint-disable no-console */

/**
 * @typedef {import('./index.d')}
 */

(function () {
  'use strict'

  const ASSERT_PAGE_LOAD_TIME = 1000

  /**
   * @type {HTMLButtonElement[]}
   */
  let btnList = []

  /**
   * @type {HTMLButtonElement | null}
   */
  let nextPageButton = null

  const autoNextPage = useOption('bc_auto_next_page', 'Auto next page', false)

  /**
   * Create UI for the options
   *
   * @template T
   * @param {string} key
   * @param {string} title
   * @param {T} defaultValue
   * @returns {{ value: T }}
   */
  function useOption(key, title, defaultValue) {
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

  /**
   * @param {string} keyword
   */
  function update(keyword) {
    return new Promise((resolve, reject) => {
      btnList = Array.from(
        /** @type {NodeListOf<HTMLButtonElement>} */
        (document.querySelectorAll('.be-dropdown-item')),
      )
        .filter(item => item.innerHTML.includes(keyword))

      nextPageButton = document.querySelector('.be-pager-next')

      console.log('----------------')
      console.log('update success')
      console.log(btnList)
      console.log(nextPageButton)
      console.log('----------------')

      if (btnList.length)
        resolve(true)
      else
        reject(new Error('not find cancel btn'))
    })
  }

  /**
   * click all cancel btn every delay time
   *
   * @param {number} delay
   * @returns {Promise<string>}
   */
  function cancelAll(delay) {
    return new Promise((resolve, reject) => {
      let cur = 0
      /**
       * @type {NodeJS.Timer | number}
       */
      let timer = -1

      if (!btnList.length)
        reject(new Error('btnList is empty'))

      timer = setInterval(() => {
        if (cur !== btnList.length) {
          btnList[cur].click()
          cur++
        }
        else {
          clearInterval(timer)
          timer = -1
          resolve('完成')
        }
      }, delay)
    })
  }

  function toNextPage() {
    return new Promise((resolve) => {
      nextPageButton?.click()
      setTimeout(() => {
        resolve(true)
      }, ASSERT_PAGE_LOAD_TIME)
    })
  }

  async function run() {
    if (!window.confirm('need clean ?'))
      return

    const keyword = window.prompt('keyword', '')

    if (!(keyword && keyword.trim())) {
      alert('请输入内容')
      return
    }

    // await update(keyword)
    while (true) {
      try {
        await update(keyword)
        await cancelAll(250)
        if (autoNextPage.value)
          await toNextPage()
      }
      catch (error) {
        break
      }
    }
  }

  window.onload = function () {
    setTimeout(() => {
      run()
    }, ASSERT_PAGE_LOAD_TIME)
  }
})()
