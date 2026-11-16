import { Link } from 'react-router-dom'
// Figma 이미지 내보내기 API를 쓸 수 없어 노드 데이터의 벡터 경로(fillGeometry)로 조립한 SVG다.
// TODO(피그마 확인 필요): Figma에서 직접 내보낸 SVG(8:1342, 8:766)를 받으면 비교해서 필요하면 교체한다.
import iconEmotionUrl from '@/assets/closing/icon-emotion.svg'
import iconSummaryUrl from '@/assets/closing/icon-summary.svg'
import { ClosingCard } from './ClosingCard'

/**
 * 사건 종결 화면 본문 (Figma `2-8 종결`, 402×874).
 * 종결 안내와 사건파일 요약·감정 변화 확인 카드, 확인 버튼을 보여준다. 이 화면에는 헤더(뒤로가기·홈)가 없다.
 * 맨 위 44px은 Figma의 기기 상태바 자리라서 그리지 않고 비워 둔다.
 *
 * 제목과 안내 문구의 가운데는 Figma처럼 화면 중심(x 201)이 아니라 x 197.5~198이다.
 *
 * @param {object} props
 * @param {string} props.summaryTo "사건파일 요약" 카드 이동 주소
 * @param {string} props.emotionTo "감정 변화 확인" 카드 이동 주소
 * @param {string} props.confirmTo "확인" 이동 주소
 */
export const ClosingView = ({ summaryTo, emotionTo, confirmTo }) => (
  <div className="flex flex-1 flex-col bg-canvas pt-11 text-ink">
    {/* Figma 제목: x 64~331, y 157, 30px SemiBold 가운데 정렬 */}
    <h1 className="mt-28.25 ml-16 w-66.75 shrink-0 text-center text-3xl leading-[normal] font-semibold">
      사건이 종결되었습니다
    </h1>
    {/* Figma 안내: x 146~250, y 210, 14px 가운데 정렬 두 줄 (문구 그대로: 첫 줄 끝 공백 포함)
        Figma 자동 줄 높이는 글꼴 높이 그대로(14px × 1.193 = 16.7px)인데, 브라우저 normal은 16px로 반올림해
        두 줄이면 2px 짧아진다. 줄 높이를 16.7px로 두고 상자 높이를 Figma와 같은 34px로 고정한다. */}
    <p className="mt-4.25 ml-36.5 h-8.5 w-26 shrink-0 text-center text-sm leading-[16.7px] whitespace-pre-wrap">
      {'지금까지의 재판을 \n확인해보세요'}
    </p>

    {/* Figma 카드 1: x 17, y 357 / 아이콘 43×43 (카드 기준 21, 18) */}
    <ClosingCard
      to={summaryTo}
      title="사건파일 요약"
      description="처음 든 생각부터, 최종 판결까지"
      iconSrc={iconSummaryUrl}
      icon={{ width: 43, height: 43, className: 'top-4.5 left-5.25' }}
      className="mt-28.25"
    />
    {/* Figma 카드 2: x 17, y 440 / 픽셀 표정 41.2×41 (카드 기준 21, 17) */}
    <ClosingCard
      to={emotionTo}
      title="감정 변화 확인"
      description="재판 전과 후의 감정 비교"
      iconSrc={iconEmotionUrl}
      icon={{ width: 41.1967, height: 41, className: 'top-4.25 left-5.25' }}
      className="mt-1.5"
    />

    {/* Figma 확인 버튼: x 18, y 768, 369×68. 글자 가운데 x 203, 위 y 792 */}
    <div className="mt-auto pt-6 pb-9.5">
      <Link
        to={confirmTo}
        className="ml-4.5 flex h-button w-92.25 items-center justify-center rounded-full bg-ink pb-px pl-px text-base leading-[normal] font-semibold text-canvas"
      >
        확인
      </Link>
    </div>
  </div>
)
