import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
// 추천 질문 패널 제목의 ∧ 화살표와 같은 에셋이다. 카드 글자색으로 보이도록 마스크로 칠한다.
import chevronUpUrl from '@/assets/defense/chevron-up.svg'
import { SummaryCard } from './SummaryCard'

/** 내용 한 줄 높이(px). 카드 내용 글자의 줄 높이(19.6px)와 같다. */
const LINE_HEIGHT = 19.6

/** 사용자가 "동작 줄이기"를 켰는지. matchMedia가 없는 환경(테스트 등)은 모션 없이 바로 바꾼다. */
const prefersReducedMotion = () =>
  typeof window.matchMedia !== 'function' ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * 펼치기 토글이 있는 사건요약 카드. 최종판결처럼 내용이 한 줄로 잘릴 때 전체 글을 펼쳐 본다.
 *
 * - 접힌 상태: 한 줄 + 말줄임(Figma 모양 그대로). 실제로 잘릴 때만 버튼을 보여준다(폭이 바뀌면 다시 잰다).
 * - 펼치면 내용 높이가 한 줄에서 전체 높이로 부드럽게(200ms) 늘고, 접으면 반대로 준다. "동작 줄이기"면 바로 바뀐다.
 * - 카드 전체를 눌러도(마우스·터치) 버튼과 같은 동작을 한다(`onCardClick`). 키보드·화면 읽기 프로그램은 버튼을 쓴다.
 *
 * TODO(피그마 확인 필요: 최종판결 펼치기 토글) Figma에 없는 토글이다. 추천 질문의 ∧ 화살표를 다시 써서 카드 오른쪽 위에 둔다.
 *
 * @param {object} props
 * @param {string} props.id 내용 요소 id (버튼의 aria-controls와 연결)
 * @param {string} props.title 카드 제목 (버튼을 "{title} 펼치기/접기"로 읽어 준다)
 * @param {string} props.content 내용 글
 * @param {'gray' | 'ink' | 'slate'} props.tone 카드 색
 * @param {string} [props.className] 바깥 여백 클래스
 */
export const ExpandableSummaryCard = ({ id, title, content, tone, className = '' }) => {
  const [expanded, setExpanded] = useState(false)
  // 여러 줄로 그리는 중인지(펼친 상태, 또는 접히는 모션이 끝나기 전)
  const [showFull, setShowFull] = useState(false)
  const [isTruncated, setIsTruncated] = useState(false)
  const wrapRef = useRef(null)
  const textRef = useRef(null)
  const cleanupRef = useRef(null)
  // 펼치기를 누른 순간의 내용 상자 높이(여러 줄로 바뀌기 전). 여기서부터 전체 높이로 늘린다.
  const expandFromRef = useRef(LINE_HEIGHT)

  // 접힌 상태에서 글이 실제로 잘리는지 잰다. 화면 폭이 바뀌면 다시 잰다.
  useLayoutEffect(() => {
    const text = textRef.current
    if (!text || showFull) return undefined
    const measure = () => setIsTruncated(text.scrollWidth > text.clientWidth + 0.5)
    measure()
    if (typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(measure)
    observer.observe(text)
    return () => observer.disconnect()
  }, [content, showFull])

  useEffect(() => () => cleanupRef.current?.(), [])

  /** 내용 상자 높이를 from에서 to로 옮기고, 끝나면 onDone을 부른다. 중간에 다시 누르면 지금 높이에서 되돌아간다. */
  const animateHeight = useCallback((from, to, onDone) => {
    cleanupRef.current?.()
    const wrap = wrapRef.current
    if (!wrap || prefersReducedMotion()) {
      onDone()
      return
    }
    wrap.style.height = `${from}px`
    wrap.getBoundingClientRect() // 시작 높이를 먼저 그리게 한다
    wrap.style.height = `${to}px`
    let timer
    const finish = () => {
      wrap.removeEventListener('transitionend', handleEnd)
      window.clearTimeout(timer)
      cleanupRef.current = null
      onDone()
    }
    const handleEnd = (event) => {
      if (event.target === wrap && event.propertyName === 'height') finish()
    }
    wrap.addEventListener('transitionend', handleEnd)
    // transitionend가 오지 않아도(탭 숨김 등) 끝낸다.
    timer = window.setTimeout(finish, 400)
    cleanupRef.current = () => {
      wrap.removeEventListener('transitionend', handleEnd)
      window.clearTimeout(timer)
      cleanupRef.current = null
    }
  }, [])

  // 펼칠 때: 여러 줄로 그린 뒤 한 줄 높이에서 전체 높이로 늘린다. 끝나면 높이를 풀어 폭이 바뀌어도 맞게 한다.
  useLayoutEffect(() => {
    if (!expanded || !showFull) return
    animateHeight(expandFromRef.current, textRef.current?.scrollHeight ?? LINE_HEIGHT, () => {
      if (wrapRef.current) wrapRef.current.style.height = ''
    })
  }, [expanded, showFull, animateHeight])

  const toggle = useCallback(() => {
    if (!expanded) {
      expandFromRef.current = wrapRef.current?.getBoundingClientRect().height || LINE_HEIGHT
      setExpanded(true)
      setShowFull(true)
      return
    }
    // 접을 때: 지금 높이에서 한 줄 높이로 줄인 뒤 한 줄(말줄임)로 바꾼다.
    setExpanded(false)
    const from = wrapRef.current?.getBoundingClientRect().height || LINE_HEIGHT
    animateHeight(from, LINE_HEIGHT, () => {
      setShowFull(false)
      if (wrapRef.current) wrapRef.current.style.height = ''
    })
  }, [expanded, animateHeight])

  const canToggle = isTruncated || showFull
  const buttonLabel = `${title} ${expanded ? '접기' : '펼치기'}`

  const action = canToggle ? (
    // 아이콘 중심이 제목 줄 가운데(카드 위 27.4px)와 카드 오른쪽 안쪽 여백(20px) 안에 오도록 44px 버튼을 둔다.
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        toggle()
      }}
      aria-expanded={expanded}
      aria-controls={id}
      aria-label={buttonLabel}
      className="absolute top-[5.4px] right-1.5 flex size-11 items-center justify-center rounded-full"
    >
      <span
        aria-hidden="true"
        className={`block size-4 bg-current transition-transform duration-200 ease-out motion-reduce:transition-none ${expanded ? 'rotate-0' : 'rotate-180'}`}
        style={{
          maskImage: `url("${chevronUpUrl}")`,
          WebkitMaskImage: `url("${chevronUpUrl}")`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
      />
    </button>
  ) : null

  return (
    <SummaryCard
      title={title}
      tone={tone}
      className={className}
      action={action}
      onClick={canToggle ? toggle : undefined}
    >
      <div
        ref={wrapRef}
        className="mt-[3.18px] overflow-hidden transition-[height] duration-200 ease-out motion-reduce:transition-none"
      >
        <p
          ref={textRef}
          id={id}
          className={`text-sm leading-[19.6px] ${showFull ? 'break-words whitespace-pre-wrap' : 'truncate'}`}
        >
          {content || '—'}
        </p>
      </div>
    </SummaryCard>
  )
}
