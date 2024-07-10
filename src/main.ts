import { isMatch } from 'micromatch'
import { logger } from './logger'
import { is_debug } from './states'
import { intervalForEach, intervalQuerySelectorAll, useOption } from './utils'

const cleanFavorite = useOption('clean_favorite', 'clean favorite', false)

function cancelFavorite() {
  const nextPageBtn: HTMLButtonElement = document.querySelector('.be-pager-next')

  intervalQuerySelectorAll<HTMLButtonElement>(
    '.be-dropdown-item',
    { innerText: '取消收藏' },
  )
    .then((cancelBtnList) => {
      logger.log('cancelBtnList', cancelBtnList)

      intervalForEach(cancelBtnList, (btn, idx) => {
        if (is_debug)
          logger.log('btn', btn, idx)
        else
          btn.click()
      })
        .then(() => {
          nextPageBtn.click()
          cancelFavorite()
        })
        .catch(({ message }: Error) => logger.error(message))
    })
    .catch(({ message }: Error) => logger.error(message))
}

if (cleanFavorite.value)
  cancelFavorite()

logger.log('window.location.toString()', window.location.toString())

const isM = isMatch(window.location.toString(), 'https://space.bilibili.com/*/fans/follow*')
logger.log('isM', isM)
