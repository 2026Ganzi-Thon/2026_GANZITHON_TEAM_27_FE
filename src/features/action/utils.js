/** 작은 행동 선택 값 (`PUT /cases/{id}/follow-up`의 `choice`). 명세 enum: `action`, `rest`("오늘은 쉬기") */
export const FOLLOW_UP_CHOICE = {
  action: 'action',
  rest: 'rest',
}

/** 작은 행동 `action_text` 최대 글자 수 (명세: 앞뒤 공백 제거 후 1~500자) */
export const ACTION_TEXT_MAX_LENGTH = 500

/**
 * `PUT /cases/{id}/follow-up` 요청 본문을 만든다.
 *
 * - `rest`("오늘은 쉬기")는 `{ choice: "rest" }`만 보낸다.
 * - `action`은 앞뒤 공백을 지운 `action_text`(1~500자)를 함께 보낸다. 범위를 벗어나면 오류를 던진다.
 *
 * @param {'action' | 'rest'} choice 고른 동작
 * @param {string} [actionText] 고른 행동 문장 (`action`일 때만 필요)
 * @returns {{ choice: 'action' | 'rest', action_text?: string }}
 */
export const buildFollowUpBody = (choice, actionText) => {
  if (choice === FOLLOW_UP_CHOICE.rest) return { choice }
  const text = (actionText ?? '').trim()
  if (text.length < 1 || text.length > ACTION_TEXT_MAX_LENGTH) {
    throw new RangeError(`action_text는 1~${ACTION_TEXT_MAX_LENGTH}자여야 합니다.`)
  }
  return { choice, action_text: text }
}

/**
 * 응답이 위기 지원 안내로 바뀌었는지 확인한다. 자유 입력을 보내는 요청이라 HTTP 200이어도 확인한다.
 * 종결 뒤라서 이 요청만 중단되고 사건 기록은 남는다(명세 6-2).
 *
 * @param {unknown} response follow-up 응답 본문
 * @returns {boolean}
 */
export const isSupportRequired = (response) => response?.outcome === 'support_required'
