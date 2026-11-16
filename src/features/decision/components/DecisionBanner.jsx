// SVG 원본은 소수점 좌표의 작은 사각형 230여 개라 브라우저에서 사각형 사이에 이음선이 보인다.
// Figma에서 같은 노드(말풍선 1:62)를 3배 PNG로 내보내 쓴다. (원본 SVG는 저장소 밖에 보관)
import verdictBubbleUrl from '@/assets/decision/verdict-bubble@3x.png'
// 기소 화면과 같은 경찰 마스코트다(렌더 비교 차이 0%). 복사하지 않고 그대로 가져다 쓴다.
import policeMascotUrl from '@/assets/prosecution/police-mascot.svg'

/**
 * 판결 유형별 말풍선 레터링.
 * Figma에는 "TRUE, BUT..." 하나만 있어 `reframed`(생각 재구성)에 쓴다고 가정한다.
 * TODO(피그마 확인 필요): deferred(판단 보류)·action_needed(대응 필요) 레터링과 실제 유형 매칭을 확인한다.
 */
const VERDICT_LETTERING = {
  reframed: { src: verdictBubbleUrl, label: 'TRUE, BUT...' },
}

/** 레터링이 없는 판결 유형의 임시 표시 이름 */
const DECISION_TYPE_LABELS = {
  reframed: '생각 재구성',
  deferred: '판단 보류',
  action_needed: '대응 필요',
}

/**
 * "이 사건의 판결은..." 뱃지, 경찰 마스코트, 판결 말풍선 배너 (Figma y 138~345).
 * 겹치는 순서는 Figma와 같다: 말풍선 < 마스코트 < 뱃지.
 *
 * @param {object} props
 * @param {import('../api/decision').DecisionType} props.decisionType 판결 유형
 */
export const DecisionBanner = ({ decisionType }) => {
  const lettering = VERDICT_LETTERING[decisionType]

  return (
    <section className="relative mt-9.75">
      {/* Figma 마스코트: x 268, y 138 (이 영역 시작 y 197보다 59px 위) */}
      <img
        src={policeMascotUrl}
        alt="생각법정 경찰 캐릭터"
        width={91}
        height={94}
        className="absolute -top-14.75 left-62.75 z-10 max-w-none"
      />

      {/* Figma 뱃지: x 22, y 197, 141×37. 글자는 뱃지 왼쪽에서 12px, 위에서 10px */}
      <p className="relative z-20 ml-1.25 h-9.25 w-35.25 rounded-field bg-ink pt-2.5 pl-3 text-base leading-auto whitespace-pre text-sky">
        {/* Figma 문구 그대로: "사건의"와 "판결은" 사이 공백 두 칸 */}
        {'이 사건의  판결은...'}
      </p>

      {lettering ? (
        // Figma 말풍선: x 20, y 231, 367×114 (뱃지 아래쪽과 3px 겹친다)
        <img
          src={lettering.src}
          alt={lettering.label}
          width={367}
          height={114}
          className="relative -mt-0.75 ml-0.75 block max-w-none"
        />
      ) : (
        // TODO(피그마 확인 필요): 이 판결 유형의 말풍선 디자인이 없어 유형 이름만 보여준다.
        <p className="mt-3 text-2xl leading-auto font-semibold text-ink">
          {DECISION_TYPE_LABELS[decisionType] ?? decisionType}
        </p>
      )}
    </section>
  )
}
