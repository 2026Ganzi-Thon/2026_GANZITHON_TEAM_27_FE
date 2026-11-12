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
