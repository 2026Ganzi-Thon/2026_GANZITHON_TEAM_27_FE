const DEMO_ID_STORAGE_KEY = 'demo-id'

let memoryDemoId = null

/**
 * 전시용 체험 ID(UUID v4)를 가져온다.
 * 처음 호출할 때 만들어 localStorage에 저장하고, 이후에는 저장된 값을 돌려준다.
 * 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 메모리에만 보관한다.
 * 체험 ID는 URL이나 화면에 노출하지 않는다.
 * @returns {string} 체험 ID
 */
export const getDemoId = () => {
  try {
    const savedDemoId = localStorage.getItem(DEMO_ID_STORAGE_KEY)
    if (savedDemoId) return savedDemoId

    const newDemoId = crypto.randomUUID()
    localStorage.setItem(DEMO_ID_STORAGE_KEY, newDemoId)
    return newDemoId
  } catch {
    memoryDemoId ??= crypto.randomUUID()
    return memoryDemoId
  }
}
