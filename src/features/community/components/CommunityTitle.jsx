import mascotUrl from '@/assets/community/mascot.svg'
import titleFillUrl from '@/assets/community/title-fill.svg'
import titleOutlineUrl from '@/assets/community/title-outline.svg'
import titleTextUrl from '@/assets/community/title-text.svg'

/**
 * 게시판 메인의 제목 영역. "COMMUNITY" 글자 그림과 안내 문구, 경찰 마스코트를 보여준다.
 * 글자 그림은 겹쳐 그린 이미지라서 스크린 리더에는 보이지 않는 제목(`h1`)으로 대신 읽어 준다.
 */
export const CommunityTitle = () => (
  <section className="relative h-37.5 shrink-0">
    <h1 className="sr-only">게시판</h1>
    <img
      src={titleOutlineUrl}
      alt=""
      width={243}
      height={60}
      className="absolute top-7 left-3.5 max-w-none"
      aria-hidden="true"
    />
    <img
      src={titleFillUrl}
      alt=""
      width={224}
      height={45}
      className="absolute top-8.75 left-6 max-w-none"
      aria-hidden="true"
    />
    <img
      src={titleTextUrl}
      alt=""
      width={210.214}
      height={30.93}
      className="absolute top-10.25 left-7.75 max-w-none"
      aria-hidden="true"
    />
    <p className="absolute top-24.5 left-5.75 text-xs leading-[normal] text-[#1f2937]">
      다른 사람들의 생각도 함께 읽어보세요!
    </p>
    <img
      src={mascotUrl}
      alt=""
      width={118}
      height={123}
      className="absolute top-6.75 left-66.75 max-w-none"
      aria-hidden="true"
    />
  </section>
)
