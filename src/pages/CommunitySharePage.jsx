import { Link, useNavigate, useParams } from 'react-router-dom'
import { BackHomeHeader } from '@/components/BackHomeHeader'
import { buildPostContent, ShareForm, useSharePost } from '@/features/community'
import { useCase } from '@/features/case'
import { ROUTE_PATHS } from '@/routes/paths'

/**
 * 게시판 공유 화면 입구. 사건을 불러와 공개 범위와 비밀번호를 정하는 폼을 보여주고, 게시하면 완료 화면으로 이동한다.
 * TODO(API 확인 필요): 사건 데이터와 게시는 `GET /cases/{id}`, `POST /cases/{id}/posts` 연동 전까지 임시 저장소(mock)를 쓴다.
 * TODO(피그마 확인 필요): 이 화면으로 들어오는 경로(사건 종결 화면의 "게시판에 공유")가 만들어지면 연결한다. `/cases/sample/share`(예시 사건)는 확인용으로 계속 유지한다.
 */
const CommunitySharePage = () => {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const { data: caseItem, isPending, isError } = useCase(caseId)
  const { share, isPending: isSharing, isError: isShareError } = useSharePost()

  /** 사건 내용으로 게시글을 만들어 게시하고, 성공하면 완료 화면으로 이동한다. */
  const handleSubmit = async ({ visibility, password }) => {
    const done = await share(caseId, { visibility, password, ...buildPostContent(caseItem) })
    if (done) navigate(ROUTE_PATHS.communityShared)
  }

  return (
    <section className="flex min-h-full flex-1 flex-col bg-canvas pt-16.25">
      <BackHomeHeader
        title="게시판 공유하기"
        homeTo={ROUTE_PATHS.home}
        onBack={() => navigate(-1)}
        wide
      />
      {isPending || isError || !caseItem ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-sm text-ink">
          {isPending ? (
            <p role="status">불러오는 중…</p>
          ) : (
            <>
              <p role="alert">{isError ? '사건을 불러오지 못했어요.' : '사건을 찾을 수 없어요.'}</p>
              <Link to={ROUTE_PATHS.home} className="font-semibold underline">
                홈으로 가기
              </Link>
            </>
          )}
        </div>
      ) : (
        <ShareForm onSubmit={handleSubmit} isPending={isSharing} isError={isShareError} />
      )}
    </section>
  )
}

export default CommunitySharePage
