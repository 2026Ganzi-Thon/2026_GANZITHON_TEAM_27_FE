import { useState } from 'react'
import { downloadImage } from '../saveCard'
import { getCardFileName } from '../utils'

/**
 * 카드 이미지를 저장하는 동작과, 그 결과 안내 문구를 다룬다.
 * ("공유하기"는 게시판 공유 화면으로 이동하는 링크라서 여기서 다루지 않는다.)
 *
 * @param {Blob | null} blob 카드 PNG. 아직 만들어지지 않았으면 `null`
 * @param {{ number: string } | null} content 카드 문구(파일 이름에 쓴다)
 * @returns {{ save: () => void, message: string }}
 */
export const useCardActions = (blob, content) => {
  const [message, setMessage] = useState('')

  /** 이미지를 파일로 저장한다. */
  const save = () => {
    if (!blob || !content) return
    downloadImage(blob, getCardFileName(content))
    setMessage('이미지를 저장했어요.')
  }

  return { save, message }
}
