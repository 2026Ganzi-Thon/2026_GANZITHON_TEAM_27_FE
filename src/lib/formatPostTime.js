const SEOUL = 'Asia/Seoul'
const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE

/**
 * 글·댓글을 올린 시각을 목록에 쓰는 짧은 문구로 바꾼다.
 * 한 시간 안이면 `5m ago`, 하루 안이면 `2h ago`, 그보다 오래되면 `Jul 20`처럼 보여준다.
 * 게시판 목록(community)과 게시글 상세(board)가 함께 쓴다.
 *
 * TODO(피그마 확인 필요): 시안에는 `2h ago`와 `02:31 AM` 두 가지가 보인다. 시각을 쓰는 기준이 정해지면 맞춘다.
 *
 * @param {string} iso 올린 시각(UTC ISO 8601)
 * @param {number} [now] 기준 시각(ms). 기본은 지금이다
 * @returns {string} 시각이 없거나 읽을 수 없으면 빈 문자열
 */
export const formatPostTime = (iso, now = Date.now()) => {
  const time = iso ? new Date(iso).getTime() : Number.NaN
  if (Number.isNaN(time)) return ''
  const age = Math.max(0, now - time)
  if (age < HOUR) return `${Math.max(1, Math.floor(age / MINUTE))}m ago`
  if (age < 24 * HOUR) return `${Math.floor(age / HOUR)}h ago`
  return new Date(time).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: SEOUL,
  })
}
