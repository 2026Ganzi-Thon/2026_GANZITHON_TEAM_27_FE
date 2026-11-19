import { useState } from 'react'
import { downloadImage } from '../saveCard'
import { getCardFileName } from '../utils'

const MOBILE_UA = /iPhone|iPad|iPod|Android/i

/**
 * 카드 이미지를 저장하거나 인스타그램 스토리로 공유하는 동작과 결과 안내 문구를 다룬다.
 * - 모바일 브라우저가 파일 공유(`navigator.canShare({ files })`)를 지원하면 OS 공유 시트(인스타그램 스토리 선택 가능)를 연다.
 * - 지원하지 않으면 PNG를 자동 저장하고, 모바일에서는 `instagram://story-camera`를 열어 바로 불러올 수 있게 안내한다.
 *
 * @param {Blob | null} blob 카드 PNG. 아직 만들어지지 않았으면 `null`
 * @param {{ number: string, finalStatement?: string } | null} content 카드 문구(파일 이름에 쓴다)
 * @returns {{ save: () => void, shareToStory: () => Promise<void>, message: string }}
 */
export const useCardActions = (blob, content) => {
  const [message, setMessage] = useState('')

  /** 이미지를 파일로 저장한다. */
  const save = () => {
    if (!blob || !content) return
    downloadImage(blob, getCardFileName(content))
    setMessage('이미지를 저장했어요.')
  }

  /** 인스타그램 스토리 공유를 실행한다. */
  const shareToStory = async () => {
    if (!blob || !content) return
    const fileName = getCardFileName(content)
    const file = new File([blob], fileName, { type: 'image/png' })

    if (
      typeof navigator !== 'undefined' &&
      navigator.share &&
      navigator.canShare?.({ files: [file] })
    ) {
      try {
        await navigator.share({
          files: [file],
          title: '생각법정 사건 카드',
          text: content.finalStatement ?? '',
        })
        setMessage('공유를 완료했어요.')
        return
      } catch (error) {
        if (error?.name === 'AbortError') return
      }
    }

    // 웹에서는 인스타 스토리에 이미지를 직접 주입할 수 없어 저장 후 스토리 카메라를 연다.
    downloadImage(blob, fileName)
    if (typeof navigator !== 'undefined' && MOBILE_UA.test(navigator.userAgent)) {
      window.location.href = 'instagram://story-camera'
    }
    setMessage('카드를 저장했어요. 인스타그램 스토리에서 불러와 공유해 주세요.')
  }

  return { save, shareToStory, message }
}
