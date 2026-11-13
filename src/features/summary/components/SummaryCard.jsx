/** 카드 색 (Figma: 처음 든 생각 = 회색, 최종판결 = 진회색, 사건 유형 = 회청색) */
const TONES = {
  gray: 'bg-field text-ink',
  ink: 'bg-ink text-field',
  slate: 'bg-card-gray text-ink',
}

/**
 * 사건요약 카드 (Figma 367×74, r5). 제목과 내용 한 줄을 보여준다.
 * 글자 위치는 카드 왼쪽 위 기준 Figma 좌표 그대로다: 제목 (20, 17.86), 내용 (20, 39.13, 14px·줄 높이 19.6px).
 * TODO(피그마 확인 필요): 내용이 길어 카드를 넘칠 때의 디자인이 없다. 지금은 한 줄로 두고 넘치면 말줄임한다.
 *
 * @param {object} props
 * @param {string} props.title 카드 제목
 * @param {string} props.content 카드 내용
 * @param {'gray' | 'ink' | 'slate'} props.tone 카드 색
 * @param {string} [props.className] 바깥 여백 클래스
 */
export const SummaryCard = ({ title, content, tone, className = '' }) => (
  <section
    className={`relative ml-4.25 h-18.5 w-91.75 shrink-0 rounded-field ${TONES[tone]} ${className}`}
  >
    <h2 className="absolute top-[17.86px] left-5 text-base leading-[normal] font-semibold">
      {title}
    </h2>
    {/* Figma 내용 상자는 y 39.13이지만 상자 높이(17.01)가 줄 높이(19.6)보다 작게 줄어 있어,
        Figma 화면의 글자는 줄 높이 기준 위치보다 1px 아래에 그려진다. 내보낸 frame.png와 맞추려고 40.13에 둔다. */}
    <p className="absolute top-[40.13px] right-5 left-5 truncate text-sm leading-[19.6px]">
      {content || '—'}
    </p>
  </section>
)
