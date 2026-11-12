import chevronUrl from '@/assets/home/chevron-right-sm.svg'
import trashUrl from '@/assets/home/trash.svg'

/**
 * 진행 중인 사건 카드. 카드를 누르면 사건을 이어하고, 휴지통을 누르면 삭제한다.
 * 버튼 안에 버튼을 넣을 수 없어서 카드 버튼과 삭제 버튼을 형제로 둔다.
 *
 * @param {{ title: string, dateLabel: string, statusLabel: string, onOpen?: () => void, onDelete?: () => void }} props
 * TODO(API 확인 필요): 이어하기는 `GET /cases/{id}`의 status로 화면을 복원하고, 삭제는 `DELETE /cases/{id}`를 쓴다.
 */
export const ResumeCaseCard = ({ title, dateLabel, statusLabel, onOpen, onDelete }) => (
  <div className="relative mx-4 h-20 shrink-0">
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${title}, ${dateLabel}, ${statusLabel}. 이어하기`}
      className="absolute inset-0 rounded-[15px] border border-field bg-field/76 text-left text-ink"
    >
      <span className="absolute top-4.75 left-5 text-base font-semibold">{title}</span>
      <span className="absolute top-12 left-5 text-xs">{dateLabel}</span>
      <span className="absolute top-12 left-25.25 text-xs">{statusLabel}</span>
      <img
        src={chevronUrl}
        alt=""
        width={14}
        height={7}
        className="absolute top-12.5 right-3.5 -rotate-90"
      />
    </button>
    <button
      type="button"
      onClick={onDelete}
      aria-label={`${title} 사건 삭제`}
      className="absolute top-4.5 left-73.5 flex size-11 items-center justify-center rounded-full"
    >
      <img src={trashUrl} alt="" width={24} height={24} />
    </button>
  </div>
)
