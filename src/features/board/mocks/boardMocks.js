/**
 * 게시판 상세 화면 목업 데이터.
 * Figma `4-2 게시판 상세` (node 71:20) 화면의 내용을 그대로 담는다.
 * docs/api-spec.md의 GET /board/posts/{pid} 응답 구조를 따르며, API 준비 시 api/에서 분기를 제거하면 된다.
 *
 * 목업 사용 조건: 개발 서버(import.meta.env.DEV)이면서 VITE_API_BASE_URL이 비어 있을 때.
 * 테스트(MODE === 'test')와 프로덕션 빌드에서는 실제 API를 호출한다.
 */
export const USE_BOARD_MOCK =
  import.meta.env.DEV && import.meta.env.MODE !== 'test' && !import.meta.env.VITE_API_BASE_URL

/** 확인용 데모 게시글 ID */
export const DEMO_POST_ID = 'sample'

/**
 * `GET /board/posts/{pid}` 목업 데이터.
 * Figma node 71:20의 실제 문구와 값을 그대로 유지한다.
 */
export const mockPostDetail = {
  id: DEMO_POST_ID,
  title: '오늘따라 제가 너무 별로인 것 같아요.',
  content: '괜히 소심해지고 \n생각이 많아져요.\n요즘 너무 불안한데 다들 괜찮나요?',
  author: '익명',
  created_at_label: '2시간 전',
  like_count: 24,
  is_liked: true,
  is_bookmarked: false,
  comment_count: 8,
  comments: [
    {
      id: 'comment-1',
      author: '익명',
      content: '저도 그래요',
      created_at_label: '1시간 전',
      like_count: 24,
      is_liked: false,
    },
  ],
}

/**
 * 네트워크 지연을 시뮬레이션하여 목업 데이터를 반환한다.
 * @template T
 * @param {T} data
 * @returns {Promise<T>}
 */
export const resolveMock = (data) =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), 200))
