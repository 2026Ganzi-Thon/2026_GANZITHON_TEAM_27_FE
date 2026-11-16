/**
 * 행동 제안 화면 목업 (Figma `2-7 행동제안` 1:1132 문구 그대로).
 *
 * TODO(API 확인 필요): 행동 후보 목록·추천 행동을 주는 API가 명세에 없다.
 * 추천 행동은 판결 응답의 `decision.next_action`일 수 있으나 설명이 없어 연결하지 않았다.
 * 후보를 받는 방법이 정해질 때까지 이 값을 화면에 그대로 쓴다.
 * TODO(피그마 확인 필요): 카드 3·4 문구가 카드 1과 같은 "01/ WALK"다. 목업은 Figma 그대로 둔다.
 */

/** 추천 카드 내용 */
export const MOCK_RECOMMENDED_ACTION = {
  title: 'TAKE A WALK!',
  description: '5분만 가볍게 걸어보기',
}

/**
 * 고를 수 있는 행동 카드 4개 (화면 순서: 왼쪽 위 → 오른쪽 위 → 왼쪽 아래 → 오른쪽 아래).
 * `description`이 follow-up 요청의 `action_text`로 간다.
 */
export const MOCK_ACTION_OPTIONS = [
  { id: 'walk-1', title: '01/ WALK', description: '5분 산책하기', tag: 'LOW EFFORT' },
  { id: 'music', title: '02/MUSIC', description: '좋아하는 음악 듣기', tag: '5 MIN' },
  { id: 'walk-3', title: '01/ WALK', description: '5분 산책하기', tag: 'LOW EFFORT' },
  { id: 'walk-4', title: '01/ WALK', description: '5분 산책하기', tag: 'LOW EFFORT' },
]

/** 처음 선택된 카드 (Figma처럼 카드 2가 선택된 상태로 시작한다) */
export const MOCK_DEFAULT_OPTION_ID = 'music'

const LATENCY_MS = 300

/**
 * `PUT /cases/{id}/follow-up` 목업. 명세는 `200`만 정해 두었고 응답 본문 모양이 없어 빈 객체를 돌려준다.
 * TODO(API 확인 필요): 응답 본문(종결된 사건? 빈 본문?)이 정해지면 맞춘다.
 *
 * @returns {Promise<object>}
 */
export const mockPutFollowUp = () =>
  new Promise((resolve) => setTimeout(() => resolve({}), LATENCY_MS))
