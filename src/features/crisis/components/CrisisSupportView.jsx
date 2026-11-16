import { Link } from 'react-router-dom'
import { CRISIS_SCREEN_CONTACTS } from '@/constants/crisisContacts'
import { CrisisContactCard } from './CrisisContactCard'
import { CrisisHeader } from './CrisisHeader'

/**
 * 위기 안내 화면 본문 (Figma `5-1 위기 안내`, 402×874).
 * 서버가 위험 신호를 감지해 `support_required`를 돌려주면 어느 화면에서든 이 화면으로 온다(docs/api-spec.md §2, §6.2).
 *
 * - 사용자가 쓴 내용이나 감지된 단어는 받지도, 보여주지도, 저장하지도 않는다. 문구는 모두 고정 문구다.
 * - 서버의 `support.message`·`contacts`는 이번에는 쓰지 않는다. 연락처는 `constants/crisisContacts.js`에서 가져온다.
 * - 맨 위 44px은 Figma의 기기 상태바 자리라서 그리지 않고 비워 둔다.
 *
 * TODO(기획 확인 필요: 명세 "흐름 중단"과 "계속할게요" 버튼 충돌) 명세는 위기 감지 시 법정 흐름을 중단하라고 하지만
 * Figma에는 "괜찮아요, 계속할게요." 버튼이 있다. 확인 전까지는 모든 이동이 법정 흐름으로 돌아가지 않게 한다.
 *
 * @param {object} props
 * @param {string} props.homeTo 홈 주소. 뒤로가기·홈·계속하기·휴정하기가 모두 이 주소로 간다.
 */
export const CrisisSupportView = ({ homeTo }) => (
  <div className="flex flex-1 flex-col bg-canvas pt-11 text-ink">
    <CrisisHeader backTo={homeTo} homeTo={homeTo} />

    {/* Figma 제목: x 82~320, y 191, 30px SemiBold 가운데 정렬 */}
    <h1 className="mt-20.25 shrink-0 text-center text-3xl leading-[normal] font-semibold">
      지금, 괜찮으신가요?
    </h1>
    {/* Figma 안내: x 95~307, y 237, 14px 가운데 정렬 두 줄.
        Figma 자동 줄 높이(14px × 1.193 = 16.7px)에 맞춰 두 줄 상자를 Figma와 같은 34px로 둔다. */}
    <p className="mt-2.5 h-8.5 shrink-0 text-center text-sm leading-[16.7px] whitespace-pre-line">
      {'지금의 생각이 너무 힘들게 느껴진다면,\n혼자 고민하지 말고 도움을 받아보세요.'}
    </p>

    {/* Figma 카드: x 16, y 356 / 470 (사이 15px) */}
    <section aria-label="상담 전화" className="mt-21.25 flex shrink-0 flex-col gap-3.75">
      {CRISIS_SCREEN_CONTACTS.map((contact) => (
        <CrisisContactCard key={contact.number} contact={contact} />
      ))}
    </section>

    <div className="mt-auto flex shrink-0 flex-col pt-6 pb-6.75">
      {/* Figma 버튼: x 18, y 750, 369×68. 글자 #ffffff, 가운데 x 203.5, 위 y 774 */}
      <Link
        to={homeTo}
        className="ml-4.5 flex h-button w-92.25 items-center justify-center rounded-full bg-ink pb-px pl-0.5 text-base leading-[normal] font-semibold text-surface"
      >
        괜찮아요, 계속할게요.
      </Link>
      {/* Figma "휴정하기": x 180, y 833, 12px. 가운데 정렬(mx-auto)은 x 180.25가 되어 글자가 1px 밀리므로 x 180에 고정한다.
          글자는 작지만 클릭 영역은 위아래·양옆으로 넓혀 44px 이상으로 한다. */}
      <Link
        to={homeTo}
        className="relative mt-3.75 ml-45 self-start text-xs leading-[normal] before:absolute before:-inset-x-1 before:-inset-y-3.75"
      >
        휴정하기
      </Link>
    </div>
  </div>
)
