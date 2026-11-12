/**
 * 이미지를 파일로 저장한다. 보이지 않는 링크를 만들어 눌러서 브라우저가 내려받게 한다.
 * @param {Blob} blob 저장할 이미지
 * @param {string} fileName 저장할 파일 이름
 */
export const downloadImage = (blob, fileName) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/**
 * 이미지를 Web Share API(`navigator.share`)로 공유한다.
 *
 * @param {Blob} blob 공유할 이미지
 * @param {{ fileName: string, title: string }} options 파일 이름과 공유 제목
 * @returns {Promise<'shared' | 'canceled' | 'unsupported'>}
 * - `shared`: 공유했다
 * - `canceled`: 사용자가 공유 창을 닫았다
 * - `unsupported`: 이 브라우저는 이미지 공유를 지원하지 않는다(저장을 안내한다)
 */
export const shareImage = async (blob, { fileName, title }) => {
  const file = new File([blob], fileName, { type: 'image/png' })
  if (typeof navigator.canShare !== 'function' || !navigator.canShare({ files: [file] })) {
    return 'unsupported'
  }
  try {
    await navigator.share({ files: [file], title })
    return 'shared'
  } catch (error) {
    if (error?.name === 'AbortError') return 'canceled'
    throw error
  }
}
