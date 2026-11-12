import avatarCircleUrl from '@/assets/defense/avatar-circle.svg'
import avatarMascotUrl from '@/assets/defense/avatar-mascot.png'
import avatarMask1Url from '@/assets/defense/avatar-mask-1.svg'
import avatarMask2Url from '@/assets/defense/avatar-mask-2.svg'
import avatarMask3Url from '@/assets/defense/avatar-mask-3.svg'

/**
 * Figma 마스코트 이미지 영역과 3단 클립 마스크 값 (Clip path group 1:1254).
 * 겹친 클립은 교집합이라 mask-composite를 intersect로 둔다. 값은 Figma 에셋 치수 그대로다.
 */
const mascotStyle = {
  left: 3.4387,
  top: 5.572,
  width: 37.5974,
  height: 49.7419,
  maskImage: `url("${avatarMask1Url}"), url("${avatarMask2Url}"), url("${avatarMask3Url}")`,
  maskPosition: '-3.439px -5.572px, -3.439px -3.962px, -4.141px -0.965px',
  maskSize: '42.088px 42.097px, 42.32px 42.33px, 41.901px 41.911px',
  maskRepeat: 'no-repeat',
  maskComposite: 'intersect',
}

/**
 * AI(경찰 마스코트) 아바타. 42px 회색 원 위에 원형으로 잘린 마스코트를 얹는다.
 *
 * @param {object} props
 * @param {string} [props.className] 바깥 여백 등 배치용 클래스
 */
export const DefenseAvatar = ({ className = '' }) => (
  <div
    className={`relative size-10.5 shrink-0 ${className}`}
    role="img"
    aria-label="생각법정 경찰 캐릭터"
  >
    <img src={avatarCircleUrl} alt="" width={42} height={42} className="absolute inset-0" />
    <div className="absolute overflow-hidden" style={mascotStyle}>
      <img src={avatarMascotUrl} alt="" className="absolute inset-0 size-full max-w-none" />
    </div>
  </div>
)
