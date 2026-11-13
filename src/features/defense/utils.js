/** 변론 답변 최대 길이 (docs/api-spec.md §5, 앞뒤 공백 제거 후 기준) */
export const MAX_ANSWER_LENGTH = 1000

/** 질문 하나를 쉬운 문장으로 바꿀 수 있는 최대 횟수 (docs/api-spec.md §6.3) */
export const MAX_SIMPLIFY_PER_QUESTION = 2

/**
 * 추천 질문 보기 (Figma `추천질문` 문구 그대로, 위에서부터 순서대로).
 * - `simplify`: 질문을 쉽게 바꿔 달라는 요청 (`POST …/simplify`)
 * - `not_sure`, `skip`: 답변 action 값 그대로 (`PUT …/answer`)
 */
export const SUGGESTION_OPTIONS = [
  { key: 'simplify', label: '질문을 쉽게 바꿔주세요.' },
  { key: 'not_sure', label: '떠오르지 않아요.' },
  { key: 'skip', label: '이 질문 건너뛰기' },
]

/** 답변 action별로 내 말풍선에 보여줄 문구 */
const ACTION_LABELS = {
  not_sure: '떠오르지 않아요.',
  skip: '이 질문 건너뛰기',
}

/**
 * 대화 목록을 화면에 그릴 말풍선 목록으로 바꾼다.
 * AI 질문 → (쉽게 바꾼 문장들, 새 AI 말풍선) → 내 답 순서다.
 * 건너뛰기·"떠오르지 않아요"는 그 보기 문구를 내 말풍선으로 보여준다.
 * TODO(피그마 확인 필요: 건너뛰기·모름 말풍선 표시 여부) 디자인이 없어 기존 내 말풍선 모양을 그대로 쓴다.
 * @param {import('./api/defense').DefenseThreadItem[]} thread 질문과 답 목록
 * @returns {Array<{key: string, from: 'ai' | 'me', text: string}>}
 */
export const toChatMessages = (thread) =>
  thread.flatMap((item, index) => {
    const messages = []
    if (item.question) {
      const { id, prompt, simplifiedPrompts = [] } = item.question
      messages.push({ key: `q-${id}`, from: 'ai', text: prompt })
      simplifiedPrompts.forEach((text, n) =>
        messages.push({ key: `q-${id}-s${n + 1}`, from: 'ai', text }),
      )
    }
    const answerText =
      item.answer?.action === 'answer' ? item.answer.text : ACTION_LABELS[item.answer?.action]
    if (answerText) {
      messages.push({ key: `a-${item.question?.id ?? index}`, from: 'me', text: answerText })
    }
    return messages
  })

/**
 * 이 질문을 더 쉽게 바꿀 수 있는지. 질문당 2회까지 가능하다.
 * @param {import('./api/defense').DefenseQuestion | null} question 답할 질문
 * @returns {boolean}
 */
export const canSimplify = (question) =>
  Boolean(question) && (question.simplifiedPrompts?.length ?? 0) < MAX_SIMPLIFY_PER_QUESTION

/**
 * 아직 답하지 않은 질문을 찾는다. 없으면 null.
 * @param {import('./api/defense').DefenseThreadItem[]} thread 질문과 답 목록
 * @returns {import('./api/defense').DefenseQuestion | null}
 */
export const findOpenQuestion = (thread) =>
  thread.find((item) => item.question && !item.answer)?.question ?? null

/**
 * 변론을 끝내고 판결로 넘어갈 수 있는지 (명세 §6.3 "판결 받기" 조건).
 * 질문을 1개 이상 처리했고(답변·떠오르지 않아요·건너뛰기 모두 처리로 본다) 답하지 않은 질문이 없어야 한다.
 * @param {import('./api/defense').DefenseThreadItem[]} thread 질문과 답 목록
 * @returns {boolean}
 */
export const canFinishDefense = (thread) =>
  thread.some((item) => item.question && item.answer) && !findOpenQuestion(thread)

/**
 * API 오류를 화면에 보여줄 문구와 재시도 가능 여부로 바꾼다. (docs/api-spec.md §7)
 * @param {unknown} error Axios 오류
 * @returns {{message: string, canRetry: boolean}}
 */
export const getDefenseErrorState = (error) => {
  const status = error?.response?.status
  const serverMessage = error?.response?.data?.error?.message

  if (status === 404) return { message: '사건을 찾을 수 없어요.', canRetry: false }
  if (status === 409) {
    // TODO(API 확인 필요): GET /cases/{id}로 다시 조회해 현재 status 화면으로 이동한다.
    return { message: '질문이 바뀌었어요. 다시 불러와 주세요.', canRetry: true }
  }
  if (status === 429) {
    return { message: '요청이 많아요. 잠시 후 다시 시도해 주세요.', canRetry: true }
  }
  if (status === 502 || status === 503) {
    return { message: 'AI가 잠시 응답하지 못했어요. 다시 시도해 주세요.', canRetry: true }
  }
  return {
    message: serverMessage ?? '연결에 문제가 생겼어요. 다시 시도해 주세요.',
    canRetry: true,
  }
}
