import bubbleUrl from '@/assets/home/home-bubble.svg'
import chargeTextUrl from '@/assets/home/home-charge-text.svg'
import mascotUrl from '@/assets/home/home-mascot.svg'

/**
 * 홈 화면 마스코트 영역. 말풍선과 경찰 마스코트를 겹쳐 보여준다.
 * 마스코트 하단은 바로 아래 요소 뒤로 살짝 겹칠 수 있다.
 *
 * @param {{ variant?: 'new' | 'resume' }} props
 * - `new`: 신규 방문. 말풍선에 "WHAT'S THE CHARGE?!!"를 보여준다.
 * - `resume`: 재방문(진행 중인 사건 있음). 말풍선에 "이전 사건을 이어하시겠어요?"를 보여준다.
 */
export const HomeHero = ({ variant = 'new' }) => (
  <div
    className="relative h-69.5 shrink-0"
    role="img"
    aria-label={
      variant === 'resume'
        ? '이전 사건을 이어하시겠냐고 묻는 경찰 마스코트'
        : '무슨 혐의인지 묻는 경찰 마스코트'
    }
  >
    <img src={bubbleUrl} alt="" width={191} height={117} className="absolute top-9 left-8.75" />
    {variant === 'resume' ? (
      <p className="absolute top-13 left-17.5 text-xl leading-normal font-bold whitespace-nowrap text-ink">
        이전 사건을
        <br />
        이어하시겠어요?
      </p>
    ) : (
      <img
        src={chargeTextUrl}
        alt=""
        width={121}
        height={59}
        className="absolute top-11.75 left-17.5"
      />
    )}
    <img
      src={mascotUrl}
      alt=""
      width={168}
      height={176}
      className="absolute top-26 left-52.75 h-44.075 w-42.0625"
    />
  </div>
)
