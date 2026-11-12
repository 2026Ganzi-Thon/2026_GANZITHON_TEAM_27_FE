import { useEffect, useRef } from 'react'
import chevronUpUrl from '@/assets/defense/chevron-up.svg'
import { SUGGESTION_OPTIONS } from '../utils'

/**
 * 추천 질문 패널 (Figma `추천질문` 1:1267, 393×852 — 노드 데이터 없이 내보낸 3배 PNG를 재서 맞췄다).
 *
 * - 헤더(y 110까지)는 선명하게 두고, 그 아래 대화 영역을 흐리게 한다(어두운 막 없음).
 * - 아래쪽에 "추천 질문 ∧" 제목과 보기 카드 3개를 놓는다. 마지막 카드는 화면 맨 아래에서 26.33px 위다.
 * - 닫기: 제목 버튼, 흐린 영역 클릭, Esc → `onClose`. 열리면 제목 버튼으로 포커스가 온다.
 *
 * TODO(공통화 검토): 휴정 안내 모달(feat/recess-modal)과 같은 "헤더 아래부터 backdrop-blur" 방식이다.
 * 그 브랜치가 합쳐지면 공통 배경 컴포넌트로 묶을지 검토한다.
 * TODO(피그마 확인 필요: 첫 보기 하늘색이 추천 강조인지 선택 상태인지) 지금은 첫 보기만 늘 하늘색으로 둔다.
 *
 * @param {object} props
 * @param {string} props.id 패널 id (추천 질문 버튼의 aria-controls와 연결)
 * @param {(key: 'simplify' | 'not_sure' | 'skip') => void} props.onSelect 보기를 고르면 그 보기 key와 함께 호출한다
 * @param {() => void} props.onClose 패널 닫기 핸들러
 * @param {{simplify?: boolean, not_sure?: boolean, skip?: boolean}} [props.disabled] 보기별 비활성 여부
 */
export const DefenseSuggestions = ({ id, onSelect, onClose, disabled = {} }) => {
  const toggleRef = useRef(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  // 열리면 제목 버튼으로 포커스를 옮기고, Esc로 닫는다.
  useEffect(() => {
    toggleRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    // 헤더(상태바 44 + 헤더 66 = 110) 아래만 덮는다. 헤더는 그대로 누를 수 있다.
    <div className="absolute inset-x-0 top-27.5 bottom-0 z-40">
      {/* 흐린 배경: 누르면 닫힌다 */}
      <div
        className="absolute inset-0 backdrop-blur-suggest"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Figma: 제목 글자 y 608.33, 카드 y 644.33 / 709.33 / 774.33 (852 화면 기준, 아래에서부터 배치) */}
      <div
        id={id}
        role="region"
        aria-label="추천 질문"
        className="absolute inset-x-0 bottom-[26.33px] flex flex-col"
      >
        {/* 제목 "추천 질문" 17px SemiBold 검정 (글자 x 26.33) + 화살표 16×16 (x 94.17, y 610.17) */}
        <button
          ref={toggleRef}
          type="button"
          onClick={onClose}
          aria-expanded="true"
          aria-controls={id}
          className="relative ml-6.5 w-[84.17px] self-start text-left text-suggest-title leading-auto font-semibold text-black before:absolute before:-inset-y-3 before:inset-x-0"
        >
          추천 질문
          <img
            src={chevronUpUrl}
            alt=""
            width={16}
            height={16}
            className="absolute top-[4.44px] left-[68.17px] max-w-none"
          />
        </button>

        <ul className="mt-[18.33px] flex flex-col gap-[13.67px]">
          {SUGGESTION_OPTIONS.map((option, index) => (
            // Figma 카드는 오른쪽 위 모서리만 각져 있다(왼쪽 위·아래와 오른쪽 아래는 둥글다).
            // 디자인 실수로 보고 네 모서리 모두 둥글게 한다(디자이너 확인 목록에 넣음).
            <li key={option.key}>
              <button
                type="button"
                onClick={() => onSelect(option.key)}
                disabled={Boolean(disabled[option.key])}
                className={[
                  'ml-6.5 flex h-suggest-card w-83.5 items-center justify-center rounded-suggest text-xs leading-auto text-black shadow-suggest',
                  // TODO(피그마 확인 필요): 비활성 보기(쉽게 바꾸기 2회 사용 등) 디자인이 없어 흐리게만 한다.
                  'disabled:cursor-not-allowed disabled:opacity-60',
                  index === 0 ? 'bg-bubble' : 'bg-surface',
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
