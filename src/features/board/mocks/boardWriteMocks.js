import { createPost } from '@/features/community'

/**
 * 글쓰기 등록 요청을 흉내 낸다. 게시판 글 저장소(목업)에 글을 저장해서 목록에 나타나게 한다.
 * 비밀번호는 저장소에 남기지 않는다(`createPost`가 비밀번호가 있다는 표시만 남긴다).
 *
 * TODO(API 확인 필요): 명세의 게시는 `POST /cases/{case_id}/posts`라서 사건 ID가 필요하다.
 * 게시판에서 바로 쓰는 글에는 사건이 없어 `null`로 보낸다. 사건 연결 방식이 정해지면 맞춘다.
 *
 * @param {{ title: string, body: string, visibility: string, password?: string }} body 작성 내용
 * @returns {Promise<{ id: string, status: string }>}
 */
export const submitMockBoardPost = (body) => createPost(null, body)
