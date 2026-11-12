/**
 * 변론(AI 챗봇) 화면 목업 데이터. Figma `Ai챗봇`(1:1214) 화면의 내용을 그대로 담는다.
 * 질문 모양은 docs/api-spec.md의 `POST /cases/{id}/defense/questions` 응답을 따른다.
 *
 * 목업을 쓰는 조건: 개발 서버(`import.meta.env.DEV`)이면서 `VITE_API_BASE_URL`이 비어 있을 때.
 * 테스트(`MODE === 'test'`)와 배포 빌드에서는 쓰지 않는다.
 * TODO(공통화 검토): 기소(prosecution) 목업과 조건이 같다. 목업 유틸을 공통으로 뺄지 검토한다.
 */
export const USE_DEFENSE_MOCK =
  import.meta.env.DEV && import.meta.env.MODE !== 'test' && !import.meta.env.VITE_API_BASE_URL

/** `GET /cases/{id}` 목업 중 변론 화면에 필요한 부분 */
export const mockCase = {
  id: 'demo',
  case_number: '2026-031',
  status: 'defense',
}

/**
 * 변론 대화 목업. 질문(`{ id, sequence, prompt, revision }`)과 그 질문에 보낸 답을 묶는다.
 * TODO(API 확인 필요): 이미 답한 질문과 답을 다시 받는 API가 명세에 없다. 대화 기록 응답 모양이 정해지면 맞춘다.
 */
export const createMockThread = () => [
  {
    question: { id: 'q1', sequence: 1, prompt: '최근에 칭찬 받은 적이 있습니까?', revision: 0 },
    answer: { action: 'answer', text: '있다.................' },
  },
]

let mockThread = createMockThread()

/** 목업 대화 기록을 돌려준다. */
export const getMockThread = () => mockThread

/**
 * 목업 대화에서 질문에 답을 기록한다. 답할 질문이 없으면 답만 이어 붙인다.
 * @param {string} questionId 질문 ID
 * @param {{action: string, text?: string}} answer 보낸 답
 */
export const recordMockAnswer = (questionId, answer) => {
  const target = mockThread.find((item) => item.question.id === questionId && !item.answer)
  mockThread = target
    ? mockThread.map((item) => (item === target ? { ...item, answer } : item))
    : [...mockThread, { question: null, answer }]
}

/**
 * 네트워크 지연을 흉내 내 목업 데이터를 돌려준다.
 * @template T
 * @param {T} data 돌려줄 데이터
 * @returns {Promise<T>}
 */
export const resolveMock = (data) =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), 300))
