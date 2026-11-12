const STORAGE_KEY = 'mock-case-files'
const LATENCY_MS = 300

/**
 * 서버가 준비되기 전까지 쓰는 임시 사건파일 저장소. 브라우저(localStorage)에 저장한다.
 * TODO(API 확인 필요): 서버가 준비되면 이 파일을 지우고 `apiClient`로 바꾼다.
 */

/** 저장된 사건파일 목록을 읽는다. 읽을 수 없으면 빈 목록이다. */
export const readCases = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

/** 사건파일 목록을 저장한다. 저장할 수 없어도 화면은 계속 동작한다. */
export const writeCases = (cases) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases))
  } catch {
    // 저장 공간을 쓸 수 없으면 이번 접수만 목록에 남지 않는다.
  }
}

/** 서버 응답처럼 보이도록 잠깐 기다린다. */
export const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
