import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCase } from '@/features/case'
import {
  buildCardContent,
  CardActions,
  CaseCardPreview,
  getCardDescription,
  useCardActions,
  useCaseCardImage,
} from '@/features/card'
import { getCommunitySharePath, ROUTE_PATHS } from '@/routes/paths'

/**
 * 사건 카드 화면 입구. 사건 ID로 사건을 불러와 카드를 만들고, 미리보기와 이미지 저장·공유하기(게시판 공유 화면으로 이동)·확인 버튼을 조합한다.
 * TODO(API 확인 필요): 사건 데이터는 `GET /cases/{id}` 연동 전까지 임시 저장소(mock)를 쓴다.
 * TODO(피그마 확인 필요): 이 화면으로 들어오는 경로(사건 종결 후)가 만들어지면 연결한다. `/cases/sample/card`(예시 사건)는 확인용으로 계속 유지한다.
 * TODO(피그마 확인 필요): 시안의 배경 장식(흐린 하늘색 별 모양 5개)은 Figma에서 벡터 정보를 받을 수 없어 넣지 못했다.
 */
const CaseCardPage = () => {
  const { caseId } = useParams()
  const { data: caseItem, isPending, isError } = useCase(caseId)
  const content = useMemo(() => (caseItem ? buildCardContent(caseItem) : null), [caseItem])
  const image = useCaseCardImage(content)
  const { save, message } = useCardActions(image.blob, content)

  if (isPending || isError || !caseItem) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-4 bg-canvas px-4 text-sm text-ink">
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
      </section>
    )
  }

  return (
    <section className="flex min-h-full flex-1 flex-col items-center bg-canvas pt-21.75 pb-7">
      <h1 className="text-center text-headline leading-[normal] font-semibold text-black">
        사건 카드가
        <br />
        완성되었어요
      </h1>
      <p className="mt-3.5 text-center text-xs leading-[normal] text-black">
        지금 바로 저장하거나,
        <br />
        공유할 수 있어요.
      </p>
      <CaseCardPreview
        status={image.status}
        url={image.url}
        width={image.width}
        height={image.height}
        description={getCardDescription(content)}
        className="mt-1.75"
      />
      <div className="relative mt-10.25 w-full px-4.5">
        <CardActions
          onSave={save}
          shareTo={getCommunitySharePath(caseId)}
          saveDisabled={image.status !== 'ready'}
        />
        <Link
          to={ROUTE_PATHS.home}
          className="mt-4 flex h-17 items-center justify-center rounded-[41px] bg-field text-base font-semibold text-black"
        >
          확인
        </Link>
        <p role="status" className="absolute inset-x-0 top-full mt-1 text-center text-xs text-ink">
          {message}
        </p>
      </div>
    </section>
  )
}

export default CaseCardPage
