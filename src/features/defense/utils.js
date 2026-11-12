/** 변론 답변 최대 길이 (docs/api-spec.md §5, 앞뒤 공백 제거 후 기준) */
export const MAX_ANSWER_LENGTH = 1000

/**
 * 대화 목록을 화면에 그릴 말풍선 목록으로 바꾼다. AI 질문 다음에 내 답이 온다.
 * 건너뛰기·"떠오르지 않아요"처럼 글이 없는 답은 말풍선을 만들지 않는다.
 * TODO(피그마 확인 필요): 건너뛰기·떠오르지 않아요를 대화에 어떻게 보여줄지 디자인이 없다.
 * @param {import('./api/defense').DefenseThreadItem[]} thread 질문과 답 목록
 * @returns {Array<{key: string, from: 'ai' | 'me', text: string}>}
 */
export const toChatMessages = (thread) =>
  thread.flatMap((item, index) => {
    const messages = []
    if (item.question) {
      messages.push({ key: `q-${item.question.id}`, from: 'ai', text: item.question.prompt })
    }
    if (item.answer?.action === 'answer' && item.answer.text) {
      messages.push({ key: `a-${item.question?.id ?? index}`, from: 'me', text: item.answer.text })
    }
    return messages
  })

/**
 * 아직 답하지 않은 질문을 찾는다. 없으면 null.
 * @param {import('./api/defense').DefenseThreadItem[]} thread 질문과 답 목록
 * @returns {import('./api/defense').DefenseQuestion | null}
 */
export const findOpenQuestion = (thread) =>
  thread.find((item) => item.question && !item.answer)?.question ?? null

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
