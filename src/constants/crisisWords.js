/**
 * [목업 전용] 위기 신호로 보는 말. 서버가 `support_required`를 돌려주는 흐름을 목업에서 흉내 낼 때만 쓴다.
 *
 * 실제 감지는 서버가 한다(docs/api-spec.md §6.2). 화면에서 이 목록으로 입력을 막거나 걸러내지 않는다.
 * 사건 접수 목업(`features/case/api/createCase.js`의 `CRISIS_WORDS`)과 같은 단어·같은 판단(포함 여부)이다.
 * TODO(공통화 검토): 사건 접수 목업도 이 파일을 쓰도록 동료와 맞춘다. 그 전까지 단어 목록이 두 곳에 있다.
 */
export const CRISIS_WORDS = ['자살', '자해', '죽고 싶', '죽고싶']

/**
 * [목업 전용] 글에 위기 신호로 보는 말이 들어 있는지. 사건 접수 목업과 같은 기준(단순 포함)이다.
 * @param {string | null | undefined} text 사용자가 쓴 글
 * @returns {boolean}
 */
export const includesCrisisWord = (text) =>
  typeof text === 'string' && CRISIS_WORDS.some((word) => text.includes(word))
