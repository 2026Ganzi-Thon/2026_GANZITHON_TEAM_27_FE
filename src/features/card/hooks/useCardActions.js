import { useState } from 'react'
import { downloadImage, shareImage } from '../shareCard'
import { getCardFileName } from '../utils'

/**
 * 카드 이미지를 저장하거나 공유하는 동작과, 그 결과 안내 문구를 다룬다.
 *
 * @param {Blob | null} blob 카드 PNG. 아직 만들어지지 않았으면 `null`
 * @param {{ number: string } | null} content 카드 문구(파일 이름에 쓴다)
 * @returns {{ save: () => void, share: () => Promise<void>, message: string }}
 */
export const useCardActions = (blob, content) => {
  const [message, setMessage] = useState('')

  /** 이미지를 파일로 저장한다. */
  const save = () => {
    if (!blob || !content) return
    downloadImage(blob, getCardFileName(content))
    setMessage('이미지를 저장했어요.')
  }

  /** 이미지를 공유한다. 공유를 지원하지 않는 브라우저에서는 저장을 안내한다. */
  const share = async () => {
    if (!blob || !content) return
    try {
      const result = await shareImage(blob, {
        fileName: getCardFileName(content),
        title: '사건 카드',
      })
      if (result === 'shared') setMessage('공유했어요.')
      else if (result === 'unsupported') {
        setMessage('이 브라우저에서는 공유를 지원하지 않아요. 이미지 저장을 이용해 주세요.')
      } else setMessage('')
    } catch {
      setMessage('공유하지 못했어요. 잠시 후 다시 시도해 주세요.')
    }
  }

  return { save, share, message }
}
