import { BigButton } from '@/components/BigButton'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 게시 완료 화면 입구. "게시가 완료되었어요!"를 보여주고, 확인을 누르면 게시판(community)으로 이동한다.
 * TODO(피그마 확인 필요): 확인을 눌렀을 때 이동할 화면이 시안에 없다. 지금은 게시판 목록으로 보낸다.
 */
const CommunitySharedPage = () => (
  <section className="flex min-h-full flex-1 flex-col bg-canvas pt-91 pb-9.5 text-center">
    <h1 className="text-headline leading-[normal] font-semibold text-ink">게시가 완료되었어요!</h1>
    <p className="mt-2.5 text-sm leading-[normal] text-ink">재판 결과가 공유되었습니다.</p>
    <div className="mt-auto px-4.5">
      <BigButton to={ROUTE_PATHS.community}>확인</BigButton>
    </div>
  </section>
)

export default CommunitySharedPage
