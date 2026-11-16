/**
 * 위기 상담·긴급 연락처. 번호와 기관 이름은 이 파일 한 곳에서만 고친다.
 *
 * - `number`: 화면에 보이는 번호(하이픈 포함)
 * - `name`: 화면에 보이는 기관 이름(Figma 문구 그대로)
 * - `description`: 카드 설명 문구. 디자인에 있는 연락처만 넣었다.
 *
 * 위기 안내 화면(`/support`)에는 Figma `5-1 위기 안내`에 있는 두 곳만 보여준다(`CRISIS_SCREEN_CONTACTS`).
 * TODO(피그마 확인 필요): 청소년 상담 1388, 긴급 112·119를 화면에 넣을지 디자인이 없다. 정의만 해 두고 아직 쓰지 않는다.
 */
export const CRISIS_CONTACTS = {
  mentalHealthCrisis: {
    name: '정신건강 위기상담전화',
    number: '1577-0199',
    description: '24시간, 언제든지 상담이 가능합니다.',
  },
  suicidePrevention: {
    name: '자살예방 상담전화',
    number: '109',
    description: '24시간, 언제든지 상담이 가능합니다.',
  },
  // TODO(피그마 확인 필요): 아래 연락처는 화면 디자인이 없어 이름·설명 문구가 확정되지 않았다.
  youthCounseling: {
    name: '청소년 상담',
    number: '1388',
  },
  police: {
    name: '경찰 긴급신고',
    number: '112',
  },
  fireAndAmbulance: {
    name: '소방·구급 긴급신고',
    number: '119',
  },
}

/** 위기 안내 화면에 보여주는 연락처와 순서 (Figma 위에서부터) */
export const CRISIS_SCREEN_CONTACTS = [
  CRISIS_CONTACTS.mentalHealthCrisis,
  CRISIS_CONTACTS.suicidePrevention,
]

/**
 * 전화 걸기 링크 주소를 만든다. 숫자만 남긴다. (예: '1577-0199' → 'tel:15770199')
 * @param {string} number 화면에 보이는 번호
 * @returns {string} tel: 링크
 */
export const toTelHref = (number) => `tel:${number.replace(/\D/g, '')}`
