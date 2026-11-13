import policeMascotUrl from '@/assets/prosecution/police-mascot.svg'
// SVG 원본은 소수점 좌표의 작은 사각형 230여 개라 브라우저에서 사각형 사이에 이음선이 보인다.
// Figma에서 같은 노드(말풍선 1:2587)를 3배 PNG로 내보내 쓴다.
import speechBubbleUrl from '@/assets/prosecution/speech-bubble@3x.png'

/**
 * 사건번호 뱃지, 경찰 마스코트, 사건 제목 말풍선 배너 (Figma y 146~339).
 * 마스코트는 사건번호 뱃지 오른쪽에 서서 말풍선 위쪽에 걸친다.
 *
 * @param {object} props
 * @param {string} [props.caseNumber] 화면 표시용 사건번호 (예: '2026-031'). 없으면 뱃지 자리만 비운다.
 * @param {string} props.title 사건 제목 (예: '회의 발표 사건')
 */
export const ProsecutionCaseBanner = ({ caseNumber, title }) => (
  <section className="relative mt-13">
    {/* Figma 마스코트: x 275, y 146 (이 영역 시작 y 211보다 65px 위) */}
    <img
      src={policeMascotUrl}
      alt="생각법정 경찰 캐릭터"
      width={91}
      height={94}
      className="absolute -top-16.25 right-5 z-20"
    />

    <div className="relative z-10 -mb-2 h-9.25">
      {caseNumber && (
        <p className="-ml-px flex h-full w-42.75 items-center rounded-field bg-ink pl-3 text-base leading-auto font-semibold text-bubble">
          사건번호 #{caseNumber}
        </p>
      )}
    </div>

    <div className="relative">
      <img src={speechBubbleUrl} alt="" width={369} height={99} className="block h-24.75 w-full" />
      <h2 className="absolute top-5.5 right-4 left-7.25 truncate text-2xl leading-auto font-medium text-ink">
        {title}
      </h2>
    </div>
  </section>
)
