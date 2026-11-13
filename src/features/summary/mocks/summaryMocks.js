/**
 * 사건요약 화면 목업. 목업을 쓰는 조건: 개발 서버(`import.meta.env.DEV`)이면서 `VITE_API_BASE_URL`이 비어 있을 때.
 * 테스트(`MODE === 'test'`)와 배포 빌드에서는 쓰지 않는다.
 * 목업 모드의 법정 진행 결과는 `lib/mockCaseDecisions`(판결 확정·증거 확정 목업이 남긴 값)에서 읽는다.
 */
export const USE_SUMMARY_MOCK =
  import.meta.env.DEV && import.meta.env.MODE !== 'test' && !import.meta.env.VITE_API_BASE_URL

/** 화면 확인용 예시 사건 ID. 주소의 사건 ID가 이 값이면 아래 예시 값을 그대로 보여준다(조회하지 않는다). */
export const SAMPLE_CASE_ID = 'sample'

/**
 * 예시 사건의 접수 정보 (Figma `사건요약`(8:687) 문구 그대로).
 * 동료의 예시 사건(사건 카드·감정 변화 화면, 접수 강도 70)과는 다른 값이다. 사건요약은 Figma 화면 값을 유지한다.
 */
export const SAMPLE_INTAKE = {
  id: SAMPLE_CASE_ID,
  case_number: '2026-031',
  thought: '나는 왜 자꾸 불안할까?',
  emotion: { type: 'anxiety', intensity: 80 },
}

/**
 * 예시 사건의 법정 진행 결과 (Figma 문구 그대로).
 * Figma의 "사건 유형: 과도한 자기비판"은 사고 패턴 이름이 아니어서, 기소 목업의 첫 번째 패턴(흑백 논리)으로 바꿨다.
 * TODO(피그마 확인 필요): 사건 유형 칸에 사고 패턴 이름을 보여주는지 확인한다.
 */
export const SAMPLE_RESULT = {
  pattern_tags: ['all_or_nothing'],
  decision: { type: 'reframed', final_statement: '그럴 수 있다.' },
  emotion_after: { type: 'anxiety', intensity: 40 },
  status: 'closed',
}

/**
 * 네트워크 지연을 흉내 내 목업 데이터를 돌려준다.
 * @template T
 * @param {T} data 돌려줄 데이터
 * @returns {Promise<T>}
 */
export const resolveMock = (data) =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), 300))
