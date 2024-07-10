import { is_debug, matchRecords } from './states'
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
        if (is_debug)
          console.log('btn', btn, idx)
        else
          btn.click()
      })
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

useCommand('Clean Favorite', () => {
  autoClick('取消收藏', { nextPage: autoNextPage.value })
}, { matchUrl: matchRecords.favList })

useCommand('Clean Follows', () => {
  autoClick('取消关注')
}, { matchUrl: matchRecords.follow })
