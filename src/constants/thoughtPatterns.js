/**
 * 사고 패턴 enum 값과 화면 표시 이름.
 * API(`pattern_candidates`, `pattern_tags`, `GET /cases?pattern=`)는 enum 값을 쓰고, 화면에는 이름을 보여준다.
 * 표시 이름의 띄어쓰기는 Figma(`흑백 논리`, `낙인 찍기`)를 따른다.
 */
export const THOUGHT_PATTERN_LABELS = {
  all_or_nothing: '흑백 논리',
  overgeneralization: '과잉 일반화',
  mind_reading: '독심술',
  catastrophizing: '파국화',
  labeling: '낙인 찍기',
  discounting_positives: '긍정 격하',
}

/**
 * 사고 패턴 enum 값을 화면 표시 이름으로 바꾼다. 모르는 값은 그대로 돌려준다.
 * @param {string} pattern 사고 패턴 enum 값 (예: 'all_or_nothing')
 * @returns {string} 표시 이름 (예: '흑백 논리')
 */
export const getThoughtPatternLabel = (pattern) => THOUGHT_PATTERN_LABELS[pattern] ?? pattern
