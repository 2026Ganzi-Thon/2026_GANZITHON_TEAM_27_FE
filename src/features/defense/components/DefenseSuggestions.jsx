import { useEffect, useRef } from 'react'
import chevronUpUrl from '@/assets/defense/chevron-up.svg'
import { SUGGESTION_OPTIONS } from '../utils'

/**
 * CSS에 적힌 transition 시간(지연 포함)의 최댓값을 ms로 읽는다. transitionend가 오지 않을 때의 안전장치에 쓴다.
 * @param {Element} element 움직이는 요소
 * @returns {number}
 */
const readTransitionMs = (element) => {
  const style = window.getComputedStyle(element)
  // 값을 읽을 수 없으면(CSS가 없는 환경 등) 0으로 본다.
  const toMs = (value = '') =>
    value.split(',').map((part) => {
      const number = parseFloat(part) * (part.includes('ms') ? 1 : 1000)
      return Number.isFinite(number) ? number : 0
    })
  const durations = toMs(style.transitionDuration)
  const delays = toMs(style.transitionDelay)
  return Math.max(0, ...durations.map((duration, i) => duration + (delays[i] ?? 0)))
}

/**
 * 추천 질문 패널 (Figma `추천질문` 1:1267, 393×852 — 노드 데이터 없이 내보낸 3배 PNG를 재서 맞췄다).
 *
 * - 헤더(y 110까지)는 선명하게 두고, 그 아래 대화 영역을 흐리게 한다(어두운 막 없음).
 * - 아래쪽에 "추천 질문 ∧" 제목과 보기 카드 3개를 놓는다. 마지막 카드는 화면 맨 아래에서 26.33px 위다.
 * - 닫기: 제목 버튼, 흐린 영역 클릭, Esc → `onClose`. 열리면 제목 버튼으로 포커스가 온다.
 *
 * 모션 (transform·opacity만 움직인다)
 * - 열릴 때(300ms, ease-out): 제목+카드 묶음이 아래에서 올라오고(바텀 시트), 흐림이 서서히 나타나고,
 *   제목 화살표가 ∨에서 ∧로 돌아간다. 카드는 50ms씩 시차를 두고 살짝(8px) 따라 올라온다.
 *   처음 그릴 때의 시작 모습은 CSS `@starting-style`(Tailwind `starting:`)로 정한다.
 * - 닫힐 때(200ms, ease-in): 반대로 내려가고 흐림이 사라진다. 다 내려간 뒤 `onExited`를 불러 화면에서 없앤다.
 *   닫히는 동안은 `inert`라서 다시 누르거나 포커스할 수 없다. 닫히는 중에 다시 열면 그 자리에서 되돌아 올라온다.
 * - "동작 줄이기"면 모션 없이 바로 열리고 닫힌다(닫힘은 화면 쪽에서 바로 없앤다).
 *
 * TODO(공통화 검토): 휴정 안내 모달(RecessModal)과 같은 "헤더 아래부터 backdrop-blur" 방식이다. 공통 배경 컴포넌트로 묶을지 검토한다.
 * TODO(피그마 확인 필요: 첫 보기 하늘색이 추천 강조인지 선택 상태인지) 지금은 첫 보기만 늘 하늘색으로 둔다.
 * TODO(피그마 확인 필요): 패널 모션은 Figma에 없어 바텀 시트 방식으로 정했다.
 *
 * @param {object} props
 * @param {string} props.id 패널 id (추천 질문 버튼의 aria-controls와 연결)
 * @param {boolean} props.open 열려 있는지 (false가 되면 닫히는 모션을 보여준 뒤 `onExited`를 부른다)
 * @param {(key: 'simplify' | 'not_sure' | 'skip') => void} props.onSelect 보기를 고르면 그 보기 key와 함께 호출한다
 * @param {() => void} props.onClose 패널 닫기 요청 핸들러
 * @param {() => void} props.onExited 닫히는 모션이 끝나면 호출한다 (화면에서 없앨 때)
 * @param {{simplify?: boolean, not_sure?: boolean, skip?: boolean}} [props.disabled] 보기별 비활성 여부
 */
export const DefenseSuggestions = ({ id, open, onSelect, onClose, onExited, disabled = {} }) => {
  const toggleRef = useRef(null)
  const sheetRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const onExitedRef = useRef(onExited)
  useEffect(() => {
    onCloseRef.current = onClose
    onExitedRef.current = onExited
  })

  // 열릴 때마다 제목 버튼으로 포커스를 옮기고, 열려 있는 동안 Esc로 닫는다.
  useEffect(() => {
    if (!open) return undefined
    toggleRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  // 닫히는 모션의 안전장치: transitionend가 오지 않아도(탭 숨김 등) 모션 시간이 지나면 없앤다.
  // 닫히는 중에 다시 열리면 이 타이머는 취소된다.
  useEffect(() => {
    if (open || !sheetRef.current) return undefined
    const timer = window.setTimeout(
      () => onExitedRef.current(),
      readTransitionMs(sheetRef.current) + 50,
    )
    return () => window.clearTimeout(timer)
  }, [open])

  /** 시트(제목+카드 묶음) 자신의 이동이 끝났을 때만 본다(카드의 시차 모션 이벤트는 무시). */
  const handleTransitionEnd = (event) => {
    if (event.target === event.currentTarget && !open) onExitedRef.current()
  }

  return (
    // 헤더(상태바 44 + 헤더 66 = 110) 아래만 덮는다. 헤더는 그대로 누를 수 있다.
    <div className="absolute inset-x-0 top-27.5 bottom-0 z-40 overflow-hidden" inert={!open}>
      {/* 흐린 배경: 누르면 닫힌다. 흐림 자체는 그대로 두고 투명도로 서서히 나타나고 사라진다. */}
      <div
        className={[
          'absolute inset-0 backdrop-blur-suggest transition-opacity motion-reduce:transition-none',
          open
            ? 'opacity-100 duration-300 ease-out starting:opacity-0'
            : 'opacity-0 duration-200 ease-in',
        ].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Figma: 제목 글자 y 608.33, 카드 y 644.33 / 709.33 / 774.33 (852 화면 기준, 아래에서부터 배치)
          화면 아래 여백 26.33px은 시트 안쪽 여백으로 둬서, 시트 높이만큼(100%) 내리면 완전히 가려진다. */}
      <div
        ref={sheetRef}
        id={id}
        role="region"
        aria-label="추천 질문"
        onTransitionEnd={handleTransitionEnd}
        className={[
          'absolute inset-x-0 bottom-0 flex flex-col pb-[26.33px] transition-transform motion-reduce:transition-none',
          open
            ? 'translate-y-0 duration-300 ease-out starting:translate-y-full'
            : 'translate-y-full duration-200 ease-in',
        ].join(' ')}
      >
        {/* 제목 "추천 질문" 17px SemiBold 검정 (글자 x 26.33) + 화살표 16×16 (x 94.17, y 610.17) */}
        <button
          ref={toggleRef}
          type="button"
          onClick={onClose}
          aria-expanded={open}
          aria-controls={id}
          className="relative ml-6.5 w-[84.17px] self-start text-left text-suggest-title leading-auto font-semibold text-black before:absolute before:-inset-y-3 before:inset-x-0"
        >
          추천 질문
          {/* 열릴 때 ∨(180°)에서 ∧(0°)로 돌아가고, 닫힐 때 다시 ∨로 돌아간다. */}
          <img
            src={chevronUpUrl}
            alt=""
            width={16}
            height={16}
            className={[
              'absolute top-[4.44px] left-[68.17px] max-w-none transition-transform motion-reduce:transition-none',
              open
                ? 'rotate-0 duration-300 ease-out starting:rotate-180'
                : 'rotate-180 duration-200 ease-in',
            ].join(' ')}
          />
        </button>

        <ul className="mt-[18.33px] flex flex-col gap-[13.67px]">
          {SUGGESTION_OPTIONS.map((option, index) => (
            // Figma 카드는 오른쪽 위 모서리만 각져 있다(왼쪽 위·아래와 오른쪽 아래는 둥글다).
            // 디자인 실수로 보고 네 모서리 모두 둥글게 한다(디자이너 확인 목록에 넣음).
            // 열릴 때만 카드가 50ms씩 시차를 두고 8px 아래에서 따라 올라온다(닫힐 때는 시트와 함께 내려간다).
            <li
              key={option.key}
              className={[
                'transition-[translate,opacity] duration-300 ease-out motion-reduce:transition-none',
                'starting:translate-y-2 starting:opacity-0',
                ['delay-0', 'delay-50', 'delay-100'][index],
              ].join(' ')}
            >
              <button
                type="button"
                // 닫히는 중(inert)에는 고르지 않는다. inert를 지원하지 않는 브라우저를 위해 코드로도 막는다.
                onClick={() => open && onSelect(option.key)}
                disabled={Boolean(disabled[option.key])}
                className={[
                  'ml-6.5 flex h-suggest-card w-83.5 items-center justify-center rounded-suggest text-xs leading-auto text-black shadow-suggest',
                  // TODO(피그마 확인 필요): 비활성 보기(쉽게 바꾸기 2회 사용 등) 디자인이 없어 흐리게만 한다.
                  'disabled:cursor-not-allowed disabled:opacity-60',
                  index === 0 ? 'bg-sky' : 'bg-surface',
                  // Figma 글자 위치 그대로: 첫 보기는 4.3px 오른쪽, 둘째 보기는 1px 왼쪽(셋째는 가운데).
                  ['pl-[8.6px]', 'pr-0.5', ''][index],
                ].join(' ')}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
