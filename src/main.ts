import { matchRecords } from './states'
import { intervalForEach, intervalQuerySelectorAll, useCommand, useOption } from './utils'

const autoNextPage = useOption('auto_next_page', 'Auto Next Page', true)

function autoClick(innerText: string, opts?: { nextPage?: boolean }) {
  const {
    nextPage = true,
  } = opts || {}

  const nextPageBtn: HTMLButtonElement | undefined = nextPage ? document.querySelector('.be-pager-next') : undefined

  intervalQuerySelectorAll<HTMLButtonElement>(
    '.be-dropdown-item',
    { innerText },
  )
    .then((cancelBtnList) => {
      intervalForEach(cancelBtnList, (btn, idx) => {
        if (import.meta.env.DEV)
          console.log('btn', btn, idx)
        else
          btn.click()
      }, { delay: 1000 })
        .then(() => {
          if (nextPage && nextPageBtn) {
            nextPageBtn.click()
            autoClick(innerText, opts)
          }
        })
        .catch(({ message }: Error) => console.error(message))
    })
    .catch(({ message }: Error) => console.error(message))
}

async function unsubscribeAll() {
  const [favlistContainer] = await intervalQuerySelectorAll<HTMLDivElement>('#fav-list-container')
  await intervalForEach(Array.from({ length: 10 }), () => {
    favlistContainer.dispatchEvent(new WheelEvent('wheel', { deltaY: 9999 }))
  }, {
    delay: 1000,
  })

  const unsubscribeBtnList = await intervalQuerySelectorAll<HTMLButtonElement>('.be-dropdown-item', { innerText: '取消订阅' })
  intervalForEach(unsubscribeBtnList, btn => btn.click())
}

useCommand('Clean Favorite', () => {
  autoClick('取消收藏', { nextPage: autoNextPage.value })
}, { matchUrl: matchRecords.favList })

useCommand('Unsubscribe All', () => {
  unsubscribeAll()
}, { matchUrl: matchRecords.favList })

useCommand('Clean Follows', () => {
  autoClick('取消关注')
}, { matchUrl: matchRecords.follow })
