import { useId } from 'react'
// Figma에서 내보낸 SVG다(전화 아이콘 I1:1207;80:7786, "바로연결" 화살표 I1:1207;80:7785).
import chevronUrl from '@/assets/crisis/icon-chevron.svg'
import phoneUrl from '@/assets/crisis/icon-phone.svg'
import { toTelHref } from '@/constants/crisisContacts'

/**
 * 상담 전화 카드 (Figma 370×99, `#c1eaff`, r5). 카드 전체가 전화 걸기 링크(tel:)다.
 * 클릭 영역을 넓히려고 "바로연결" 알약만이 아니라 카드 전체를 링크로 만들고, 알약은 모양으로만 둔다.
 * 번호는 화면에 그대로 보이므로 전화를 걸 수 없는 기기(PC 등)에서도 번호를 보고 직접 걸 수 있다.
 * TODO(피그마 확인 필요): 전화를 걸 수 없는 기기에서의 안내 디자인이 없다.
 *
 * 위치는 카드 왼쪽 위 기준 Figma 좌표 그대로: 아이콘 (23, 33), 기관 (74, 18), 번호 (74, 41), 설명 (74, 70),
 * 알약 (281, 37) 75×25, "바로연결" (292, 43), 화살표 (341, 45).
 *
 * @param {object} props
 * @param {{ name: string, number: string, description: string }} props.contact 연락처
 * @param {string} [props.className] 바깥 여백 클래스
 */
export const CrisisContactCard = ({ contact, className = '' }) => {
  // aria-label이 카드 안 글자를 대신하므로, 설명 문구는 aria-describedby로 이어서 읽히게 한다.
  const descriptionId = useId()

  return (
    <a
      href={toTelHref(contact.number)}
      aria-label={`${contact.name} ${contact.number}에 전화 걸기`}
      aria-describedby={descriptionId}
      className={`relative ml-4 block h-24.75 w-92.5 shrink-0 rounded-field bg-sky text-ink ${className}`}
    >
      <img
        src={phoneUrl}
        alt=""
        width={29}
        height={29}
        className="absolute top-8.25 left-5.75 max-w-none"
      />
      <span className="absolute top-4.5 left-18.5 text-base leading-[normal] font-semibold whitespace-nowrap">
        {contact.name}
      </span>
      <span className="absolute top-10.25 left-18.5 text-xl leading-[normal] font-semibold whitespace-nowrap">
        {contact.number}
      </span>
      <span
        id={descriptionId}
        className="absolute top-17.5 left-18.5 text-xs leading-[normal] whitespace-nowrap"
      >
        {contact.description}
      </span>
      <span
        className="absolute top-9.25 left-70.25 h-6.25 w-18.75 rounded-full bg-surface"
        aria-hidden="true"
      >
        <span className="absolute top-1.5 left-2.75 text-xs leading-[normal] whitespace-nowrap">
          바로연결
        </span>
        <img
          src={chevronUrl}
          alt=""
          width={5}
          height={9}
          className="absolute top-2 left-15 max-w-none"
        />
      </span>
    </a>
  )
}
