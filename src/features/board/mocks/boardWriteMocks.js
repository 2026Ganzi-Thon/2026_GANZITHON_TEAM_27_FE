/** 입력을 보존하면서 작성 요청을 흉내 낸다. 저장·화면 이동은 API 연결 때 확정한다. */
export const submitMockBoardPost = (body) => structuredClone(body)
