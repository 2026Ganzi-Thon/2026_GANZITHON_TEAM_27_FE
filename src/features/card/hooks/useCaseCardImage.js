import { useEffect, useState } from 'react'
import { renderCaseCard } from '../renderCaseCard'

const IDLE = { status: 'idle', blob: null, url: null, width: 0, height: 0 }
const LOADING = { status: 'loading', blob: null, url: null, width: 0, height: 0 }

/**
 * 사건 카드 PNG를 만들어서 화면에 보여줄 주소(`url`)와 함께 돌려주는 hook.
 * 문구가 바뀌면 다시 만들고, 화면을 떠나면 만든 주소를 정리한다.
 *
 * @param {{ number: string, thought: string, finalStatement: string, emotionChange: string } | null} content 카드 문구. `null`이면 만들지 않는다
 * @returns {{ status: 'idle' | 'loading' | 'ready' | 'error', blob: Blob | null, url: string | null, width: number, height: number }}
 */
export const useCaseCardImage = (content) => {
  // 어떤 문구로 만든 결과인지 함께 저장해서, 문구가 바뀌면 이전 결과를 쓰지 않는다.
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!content) return undefined

    let cancelled = false
    let objectUrl = null

    renderCaseCard(content)
      .then(({ blob, width, height }) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setResult({ content, status: 'ready', blob, url: objectUrl, width, height })
      })
      .catch(() => {
        if (!cancelled) setResult({ content, ...IDLE, status: 'error' })
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [content])

  if (!content) return IDLE
  if (result?.content !== content) return LOADING
  return result
}
