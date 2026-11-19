import { POST_PASSWORD_LENGTH, VISIBILITY } from '@/constants/visibility'
import { formatPostTime } from '@/lib/formatPostTime'

/**
 * 게시글 비밀번호가 규칙(8~64자)에 맞는지 확인한다. 앞뒤 공백은 비밀번호의 일부이므로 그대로 센다.
 * @param {string} password 입력한 비밀번호
 * @returns {string} 규칙에 맞으면 빈 문자열, 아니면 안내 문구
 */
export const validatePostPassword = (password) => {
  const { min, max } = POST_PASSWORD_LENGTH
  if (password.length === 0) return '비밀번호를 입력해주세요.'
  if (password.length < min) return `비밀번호는 ${min}자 이상이어야 해요.`
  if (password.length > max) return `비밀번호는 ${max}자 이하여야 해요.`
  return ''
}

/**
 * 공개 범위와 비밀번호로 게시할 수 있는 상태인지 알려준다.
 * 공개 범위를 골라야 하고, 비공개이면 비밀번호도 규칙에 맞아야 한다.
 * @param {string | null} visibility 고른 공개 범위. 아직 고르지 않았으면 `null`
 * @param {string} password 입력한 비밀번호
 */
export const canPost = (visibility, password) => {
  if (visibility === VISIBILITY.public) return true
  if (visibility === VISIBILITY.passwordProtected) return validatePostPassword(password) === ''
  return false
}

/** 긴 글을 정해진 길이로 줄인다. */
const truncate = (text, maxLength) =>
  text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text

/**
 * 사건에서 게시글 제목과 본문을 만든다.
 *
 * TODO(피그마 확인 필요): 디자인에는 제목·본문·태그를 정하는 화면이 없다. API 명세는 제목(1~120자)과 본문(1~2,000자)을 요구하고,
 * 게시 전에 실제로 공개될 내용을 미리 보여주고 식별 정보를 지울 수 있게 하라고 한다. 지금은 사건명과 최종 진술문으로 만든다.
 *
 * @param {object} caseItem API 사건 item
 * @returns {{ title: string, body: string }}
 */
export const buildPostContent = (caseItem) => ({
  title: truncate(caseItem.title ?? caseItem.thought, 120),
  body: truncate(caseItem.final_statement ?? caseItem.thought, 2000),
})

export { formatPostTime }

/** 게시판 메인 목록의 글 앞에 붙는 분류 문구. TODO(API 확인 필요): 글의 분류 필드가 확정되면 맞춘다. */
const FEED_TAG_LABEL = '# FREE TALK'

/**
 * API 게시글 item(`GET /board/posts`, `GET /board/posts/mine`)을 화면에서 쓰는 모양으로 바꾼다.
 * 비밀번호가 필요한 남의 글은 서버가 제목·본문을 `null`로 주므로, 안내 문구만 보여준다.
 *
 * @param {object} post API 게시글 item
 * @param {number} [now] 기준 시각(ms)
 * @returns {{ id: string, title: string, body: string, tagLabel: string, likes: number, comments: number, timeLabel: string, isHot: boolean, isMine: boolean, isLocked: boolean }}
 */
export const toPostView = (post, now = Date.now()) => {
  const isMine = Boolean(post.is_mine)
  const isLocked = post.visibility === VISIBILITY.passwordProtected && !isMine
  return {
    id: post.id,
    title: isLocked ? '비공개 글이에요' : (post.title ?? ''),
    body: isLocked ? '비밀번호가 필요합니다.' : (post.body ?? ''),
    tagLabel: FEED_TAG_LABEL,
    likes: post.like_count ?? 0,
    comments: post.comment_count ?? 0,
    timeLabel: formatPostTime(post.created_at ?? post.published_at, now),
    isHot: Boolean(post.is_hot),
    isMine,
    isLocked,
  }
}
