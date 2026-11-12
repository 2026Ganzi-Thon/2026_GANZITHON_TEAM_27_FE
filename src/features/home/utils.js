/** 최근 사건 카드 배경색. 시안 순서(회색 → 하늘색 → 진회색)대로 반복한다. */
const CARD_TONES = ['bg-field', 'bg-sky', 'bg-card-gray']

/**
 * 목록 순서에 맞는 카드 배경 클래스를 돌려준다.
 *
 * @param {number} index 목록에서의 순서(0부터)
 * @returns {string} Tailwind 배경색 클래스
 */
export const getCardTone = (index) => CARD_TONES[index % CARD_TONES.length]
