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

/** 사건당 질문 최대 개수 (docs/api-spec.md §6.3) */
const MAX_QUESTIONS = 3

/** `GET /cases/{id}` 목업 중 변론 화면에 필요한 부분 */
export const mockCase = {
  id: 'demo',
  case_number: '2026-031',
  status: 'defense',
}

/**
 * 추천 질문 기능 확인용 임시 문구. 이 목업 파일에서만 쓴다.
 * TODO(문구 확인 필요): 실제 질문·쉬운 문장은 AI가 만든다. 목업 확인용으로만 임시로 넣었다.
 */
const MOCK_QUESTIONS = [
  { id: 'q2', prompt: '그때 들은 칭찬을 떠올리면 어떤 기분이 드나요?' },
  { id: 'q3', prompt: '친구가 같은 실수를 했다면 뭐라고 말해 주고 싶나요?' },
]
/** TODO(문구 확인 필요): "질문을 쉽게 바꿔주세요." 목업 응답. 질문당 최대 2개(명세: 질문당 쉽게 바꾸기 최대 2회) */
const MOCK_SIMPLIFIED = {
  q2: ['칭찬을 들었을 때 기분이 좋았나요?', '칭찬받고 웃었던 적이 있나요?'],
  q3: ['친구가 실수하면 어떻게 위로해 주나요?', '친구에게 괜찮다고 말해 준 적 있나요?'],
}

/**
 * 변론 대화 목업. 질문(`{ id, sequence, prompt, revision }`)과 그 질문에 보낸 답을 묶는다.
 * 첫 질문은 Figma 그대로이고, 추천 질문 보기를 써 볼 수 있도록 답하지 않은 두 번째 질문을 둔다.
 * TODO(API 확인 필요): 이미 답한 질문과 답을 다시 받는 API가 명세에 없다. 대화 기록 응답 모양이 정해지면 맞춘다.
 */
export const createMockThread = () => [
  {
    question: { id: 'q1', sequence: 1, prompt: '최근에 칭찬 받은 적이 있습니까?', revision: 0 },
    answer: { action: 'answer', text: '있다.................' },
  },
  {
    question: { id: 'q2', sequence: 2, prompt: MOCK_QUESTIONS[0].prompt, revision: 0 },
    answer: null,
  },
]

let mockThread = createMockThread()

/** 목업 대화 기록을 돌려준다. */
export const getMockThread = () => mockThread

/** 목업 대화를 처음 상태로 되돌린다. (테스트·확인용) */
export const resetMockThread = () => {
  mockThread = createMockThread()
}

/**
 * 목업 대화에서 질문에 답을 기록한다. 답할 질문이 없으면 답만 이어 붙인다.
 * 답한 뒤 질문이 3개 미만이면 다음 질문을 붙인다(실제 API에서는 질문 생성 API가 다음 질문을 준다).
 * @param {string} questionId 질문 ID
 * @param {{action: string, text?: string}} answer 보낸 답
 */
export const recordMockAnswer = (questionId, answer) => {
  const target = mockThread.find((item) => item.question?.id === questionId && !item.answer)
  mockThread = target
    ? mockThread.map((item) => (item === target ? { ...item, answer } : item))
    : [...mockThread, { question: null, answer }]

  const asked = mockThread.filter((item) => item.question).length
  const next = MOCK_QUESTIONS.find((q) => !mockThread.some((item) => item.question?.id === q.id))
  if (target && next && asked < MAX_QUESTIONS) {
    mockThread = [
      ...mockThread,
      {
        question: { id: next.id, sequence: asked + 1, prompt: next.prompt, revision: 0 },
        answer: null,
      },
    ]
  }
  // 질문을 처리했고 미응답 질문이 없으면 화면의 "변론 종료"(명세 §6.3 "판결 받기")가 활성화된다(utils.canFinishDefense).
}

/**
 * 목업에서 질문을 쉬운 문장으로 바꾼다. 명세처럼 순번은 그대로 두고 revision만 올린다.
 * @param {string} questionId 질문 ID
 * @returns {{prompt: string, revision: number}} 새 문장과 새 revision
 */
export const simplifyMockQuestion = (questionId) => {
  const item = mockThread.find((entry) => entry.question?.id === questionId)
  const used = item?.question.simplifiedPrompts?.length ?? 0
  const prompt = MOCK_SIMPLIFIED[questionId]?.[used] ?? MOCK_SIMPLIFIED.q2[0]
  const revision = (item?.question.revision ?? 0) + 1
  mockThread = mockThread.map((entry) =>
    entry === item
      ? {
          ...entry,
          question: {
            ...entry.question,
            revision,
            simplifiedPrompts: [...(entry.question.simplifiedPrompts ?? []), prompt],
          },
        }
      : entry,
  )
  return { prompt, revision }
}

/**
 * 네트워크 지연을 흉내 내 목업 데이터를 돌려준다.
 * @template T
 * @param {T} data 돌려줄 데이터
 * @returns {Promise<T>}
 */
export const resolveMock = (data) =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), 300))
