/**
 * 게시판 "사건 유형" 필터 시트의 선택지. 순서는 시트의 왼쪽 위부터다.
 * 값(`key`)은 API 사고 패턴 enum을 따른다. 기소·사건요약 화면의 표시 이름은 `@/constants/thoughtPatterns`에 있다.
 *
 * TODO(API 확인 필요): API 명세의 사고 패턴은 6가지(`all_or_nothing`, `overgeneralization`, `mind_reading`,
 * `catastrophizing`, `labeling`, `discounting_positives`)인데, 게시판 시안에는 10가지가 있다.
 * 시안에만 있는 값(감정적 추론, 당위적 사고, 개인화, 타인비난, 비교하기)의 `key`는 임시 이름이다.
 * TODO(피그마 확인 필요): 이 시트의 표시 이름은 띄어쓰기가 없다(`흑백논리`, `낙인찍기`). 기소 화면(`흑백 논리`, `낙인 찍기`)과 다르다.
 */
export const PATTERN_OPTIONS = [
  { key: 'all_or_nothing', label: '흑백논리' },
  { key: 'overgeneralization', label: '과잉 일반화' },
  { key: 'catastrophizing', label: '파국화' },
  { key: 'emotional_reasoning', label: '감정적 추론' },
  { key: 'labeling', label: '낙인찍기' },
  { key: 'should_statements', label: '당위적 사고' },
  { key: 'personalization', label: '개인화' },
  { key: 'blaming_others', label: '타인비난' },
  { key: 'comparison', label: '비교하기' },
  { key: 'mind_reading', label: '독심술' },
]
