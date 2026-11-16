import { useState } from 'react'
import dividerUrl from '@/assets/community/divider.svg'
import { useDeletePost } from '../hooks/useDeletePost'
import { usePosts } from '../hooks/usePosts'
import { FilterBar } from './FilterBar'
import { PatternSheet, ScopeSheet } from './FilterSheet'
import { PostRow } from './PostRow'

/**
 * 게시판 목록 본문. 필터 줄("사건 유형", "공개 범위", "최신순")과 글 목록을 보여주고,
 * 필터 버튼을 누르면 선택 시트를 연다. 불러오는 중, 오류, 빈 목록도 처리한다.
 *
 * - 사건 유형과 공개 범위는 이 컴포넌트 안에서만 다루고, 시트에서 "보기"를 눌렀을 때 목록에 적용한다.
 * - 시트는 `fixed` 없이 프레임 전체를 덮으므로, 이 컴포넌트를 감싸는 요소에 `relative`를 두지 않는다.
 *
 * TODO(API 확인 필요): 필터를 URL의 검색 파라미터(`tag`, `q`)로 둘지 정해지면 맞춘다(`docs/routes.md` 참고).
 */
export const PostListSection = () => {
  const [patterns, setPatterns] = useState([])
  const [scope, setScope] = useState(null)
  const [openSheet, setOpenSheet] = useState(null)

  const { data: posts = [], isPending, isError } = usePosts({ patterns, scope })
  const { mutate: removePost } = useDeletePost()
  const hasFilter = patterns.length > 0 || scope !== null

  return (
    <section aria-label="게시판 글 목록" className="mt-6.75">
      <FilterBar
        patternCount={patterns.length}
        hasScope={scope !== null}
        onOpenPattern={() => setOpenSheet('pattern')}
        onOpenScope={() => setOpenSheet('scope')}
      />
      <img src={dividerUrl} alt="" width={367.5} height={0.5} className="mx-4 mt-3.5 max-w-none" />

      {isPending ? (
        <p role="status" className="py-10 text-center text-xs text-ink">
          불러오는 중…
        </p>
      ) : isError ? (
        <p role="alert" className="py-10 text-center text-xs text-danger">
          글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      ) : posts.length === 0 ? (
        <p className="py-10 text-center text-xs text-ink">
          {hasFilter ? '조건에 맞는 글이 없어요.' : '아직 올라온 글이 없어요.'}
        </p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <PostRow post={post} onDelete={removePost} />
              <img
                src={dividerUrl}
                alt=""
                width={367.5}
                height={0.5}
                className="mx-4 max-w-none"
                aria-hidden="true"
              />
            </li>
          ))}
        </ul>
      )}

      {openSheet === 'pattern' && (
        <PatternSheet
          selected={patterns}
          onApply={(keys) => {
            setPatterns(keys)
            setOpenSheet(null)
          }}
          onClose={() => setOpenSheet(null)}
        />
      )}
      {openSheet === 'scope' && (
        <ScopeSheet
          selected={scope}
          onApply={(value) => {
            setScope(value)
            setOpenSheet(null)
          }}
          onClose={() => setOpenSheet(null)}
        />
      )}
    </section>
  )
}
