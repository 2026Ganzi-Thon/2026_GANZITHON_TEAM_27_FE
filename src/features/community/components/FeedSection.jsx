import { Link } from 'react-router-dom'
import dividerUrl from '@/assets/community/divider.svg'
import { FeedItem } from './FeedItem'

/**
 * 게시판 메인의 "THE FEED". 제목과 "VIEW ALL ↗" 링크, 최근 글 목록을 보여준다. 불러오는 중, 오류, 빈 목록도 처리한다.
 *
 * @param {{
 *   posts: Array<object>,
 *   viewAllTo: string,
 *   isLoading?: boolean,
 *   isError?: boolean,
 * }} props
 * - `posts`: 보여줄 글 목록(`toPostView`의 결과)
 * - `viewAllTo`: "VIEW ALL ↗"가 이동할 게시판 목록 화면 주소
 */
export const FeedSection = ({
  posts,
  viewAllTo,
  getPostPath,
  isLoading = false,
  isError = false,
}) => (
  <section aria-labelledby="feed-title" className="mt-8.75 px-4">
    <div className="flex h-7 items-center justify-between">
      <h2 id="feed-title" className="text-base leading-[normal] font-semibold text-black">
        THE FEED
      </h2>
      <Link
        to={viewAllTo}
        className="flex h-7 items-center justify-center rounded-[21px] bg-[#f0f0f0] px-2.75 text-xs leading-[normal] text-black"
      >
        VIEW ALL ↗
      </Link>
    </div>
    <img src={dividerUrl} alt="" width={367.5} height={0.5} className="mt-2 max-w-none" />

    {isLoading ? (
      <p role="status" className="py-10 text-center text-xs text-ink">
        불러오는 중…
      </p>
    ) : isError ? (
      <p role="alert" className="py-10 text-center text-xs text-danger">
        글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </p>
    ) : posts.length === 0 ? (
      <p className="py-10 text-center text-xs text-ink">아직 올라온 글이 없어요.</p>
    ) : (
      <ul>
        {posts.map((post) => (
          <li key={post.id} className="pt-3.5">
            <FeedItem post={post} to={getPostPath(post.id)} />
            <img
              src={dividerUrl}
              alt=""
              width={367.5}
              height={0.5}
              className="mt-3.5 max-w-none"
              aria-hidden="true"
            />
          </li>
        ))}
      </ul>
    )}
  </section>
)
