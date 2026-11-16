import lockUrl from '@/assets/community/icon-lock.svg'
import { PostMenu } from './PostMenu'

/**
 * 게시판 목록의 글 한 줄. 인기 글은 "HOT" 표시가 붙고, 내 글은 "···" 메뉴가 붙는다.
 * 비밀번호가 필요한 글은 자물쇠와 안내 문구만 보여준다.
 *
 * TODO(피그마 확인 필요): 글을 눌렀을 때 이동할 게시글 상세 화면과, 비공개 글의 비밀번호 입력 팝업(P3)이 시안에 없어 아직 연결하지 않았다.
 *
 * @param {{
 *   post: { id: string, title: string, body: string, likes: number, comments: number, timeLabel: string, isHot: boolean, isMine: boolean, isLocked: boolean },
 *   onDelete: (postId: string) => void,
 * }} props
 * - `post`: 보여줄 글(`toPostView`의 결과)
 * - `onDelete`: 내 글 메뉴에서 "삭제하기"를 누르면 글 ID와 함께 호출한다
 */
export const PostRow = ({ post, onDelete }) => (
  <article className={`relative px-4 pt-4.25 pb-3.5 text-black ${post.isLocked ? 'pl-6' : ''}`}>
    {post.isHot && (
      <span className="mb-1.75 flex h-6.5 w-fit items-center rounded-[21px] bg-sky px-3 text-base leading-[normal] font-semibold">
        HOT
      </span>
    )}

    <h3 className="flex items-center gap-1.5 text-base leading-[normal] font-semibold">
      {post.isLocked && <img src={lockUrl} alt="" width={20} height={20} />}
      {post.title}
    </h3>
    {post.body && <p className="mt-1.75 text-xs leading-[normal]">{post.body}</p>}

    {!post.isLocked && (
      <div className="mt-2.5 flex items-center justify-between text-xs leading-[normal]">
        <p className="flex gap-2.75">
          <span>♡ {post.likes}</span>
          <span>댓글 {post.comments}</span>
        </p>
        <time className="mr-3">{post.timeLabel}</time>
      </div>
    )}

    {post.isMine && <PostMenu onDelete={() => onDelete(post.id)} />}
  </article>
)
