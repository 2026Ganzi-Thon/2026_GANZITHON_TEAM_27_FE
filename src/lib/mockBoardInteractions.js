/**
 * [목업 전용] 게시글의 공감(좋아요)과 댓글 임시 저장소. 서버가 준비되기 전까지 브라우저(localStorage)에 글 ID별로 저장한다.
 *
 * - 공감은 글 하나, 댓글 하나마다 **한 번까지** 할 수 있고, 다시 누르면 취소된다.
 * - 글에 원래 공감해 둔 상태(Figma 예시 글)에서도 취소할 수 있어서, 기록은 "누른 적 없음(`null`)"과 "공감함·취소함"을 구분한다.
 * - 댓글은 내가 단 것만 저장한다(`mine`). 고치거나 지울 수 있는 것도 내 댓글뿐이다.
 * - 글에 원래 있는 예시 댓글(Figma 예시 글)의 공감은 `commentLikes`에 ID로만 남긴다.
 *
 * TODO(API 확인 필요): 공감·댓글 API가 명세에 없다. 서버가 준비되면 이 파일을 지운다.
 */
const STORAGE_KEY = 'mock-board-interactions'

/** 아무것도 하지 않은 글의 기록 */
const emptyRecord = () => ({ liked: null, comments: [], commentLikes: {} })

/** 저장된 전체 기록을 읽는다. 읽을 수 없으면 빈 객체다. */
const readAll = () => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch {
    return {}
  }
}

/** 글 하나의 기록을 바꿔서 저장한다. 저장할 수 없어도 화면은 계속 동작한다. */
const writeRecord = (postId, record) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readAll(), [postId]: record }))
  } catch {
    // 저장 공간을 쓸 수 없으면 이번 기록만 남지 않는다.
  }
}

/**
 * 글 하나의 공감·댓글 기록을 읽는다.
 * @param {string} postId 게시글 ID
 * @returns {{ liked: boolean | null, comments: Array<{ id: string, content: string, created_at: string, liked: boolean }>, commentLikes: Record<string, boolean> }}
 * - `liked`: 글 공감. 누른 적이 없으면 `null`(글 원래 상태를 따른다)
 * - `commentLikes`: 예시 댓글의 공감. 누른 적이 없으면 키가 없다
 */
export const readMockInteractions = (postId) => ({ ...emptyRecord(), ...readAll()[postId] })

/**
 * 글 공감을 누른다. 공감한 상태면 취소하고, 아니면 공감한다.
 * @param {string} postId 게시글 ID
 * @param {boolean} [baseLiked] 글에 원래 공감해 둔 상태(예시 글). 기록이 없을 때 여기서 뒤집는다
 */
export const toggleMockPostLike = (postId, baseLiked = false) => {
  const record = readMockInteractions(postId)
  writeRecord(postId, { ...record, liked: !(record.liked ?? baseLiked) })
}

/**
 * 댓글을 단다.
 * @param {string} postId 게시글 ID
 * @param {string} content 댓글 내용
 * @returns {{ id: string, content: string, created_at: string, liked: boolean }} 새 댓글
 */
export const addMockComment = (postId, content) => {
  const record = readMockInteractions(postId)
  const comment = {
    id: `comment-${crypto.randomUUID()}`,
    content,
    created_at: new Date().toISOString(),
    liked: false,
  }
  writeRecord(postId, { ...record, comments: [...record.comments, comment] })
  return comment
}

/**
 * 내 댓글 내용을 고친다. 내 댓글이 아니면(예시 댓글 등) 아무 일도 하지 않는다.
 * @param {string} postId 게시글 ID
 * @param {string} commentId 댓글 ID
 * @param {string} content 바꿀 내용
 */
export const updateMockComment = (postId, commentId, content) => {
  const record = readMockInteractions(postId)
  writeRecord(postId, {
    ...record,
    comments: record.comments.map((comment) =>
      comment.id === commentId ? { ...comment, content } : comment,
    ),
  })
}

/**
 * 내 댓글을 지운다. 내 댓글이 아니면(예시 댓글 등) 아무 일도 하지 않는다.
 * @param {string} postId 게시글 ID
 * @param {string} commentId 댓글 ID
 */
export const deleteMockComment = (postId, commentId) => {
  const record = readMockInteractions(postId)
  writeRecord(postId, {
    ...record,
    comments: record.comments.filter((comment) => comment.id !== commentId),
  })
}

/**
 * 댓글 공감을 누른다. 공감한 상태면 취소하고, 아니면 공감한다.
 * @param {string} postId 게시글 ID
 * @param {string} commentId 댓글 ID
 * @param {boolean} [baseLiked] 댓글에 원래 공감해 둔 상태(예시 댓글). 기록이 없을 때 여기서 뒤집는다
 */
export const toggleMockCommentLike = (postId, commentId, baseLiked = false) => {
  const record = readMockInteractions(postId)
  const mine = record.comments.find((comment) => comment.id === commentId)
  if (mine) {
    writeRecord(postId, {
      ...record,
      comments: record.comments.map((comment) =>
        comment.id === commentId ? { ...comment, liked: !comment.liked } : comment,
      ),
    })
    return
  }
  const current = record.commentLikes[commentId] ?? baseLiked
  writeRecord(postId, {
    ...record,
    commentLikes: { ...record.commentLikes, [commentId]: !current },
  })
}

/**
 * 글을 지울 때 그 글의 공감·댓글 기록도 함께 지운다.
 * @param {string} postId 게시글 ID
 */
export const clearMockInteractions = (postId) => {
  const all = readAll()
  if (!(postId in all)) return
  const rest = { ...all }
  delete rest[postId]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
  } catch {
    // 저장 공간을 쓸 수 없으면 이번 기록만 남는다.
  }
}

/**
 * 내가 올린 글의 공감 수와 댓글 수(게시판 목록용). 글 자체에 원래 있던 수는 없다.
 * @param {string} postId 게시글 ID
 * @returns {{ likes: number, comments: number }}
 */
export const countMockInteractions = (postId) => {
  const record = readMockInteractions(postId)
  return { likes: record.liked === true ? 1 : 0, comments: record.comments.length }
}
