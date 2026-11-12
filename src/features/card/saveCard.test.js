import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadImage } from './saveCard'

const blob = new Blob(['png'], { type: 'image/png' })

afterEach(() => {
  vi.restoreAllMocks()
})

describe('downloadImage', () => {
  it('파일 이름을 붙인 링크를 눌러서 저장하고, 만든 주소를 정리한다', () => {
    URL.createObjectURL = vi.fn(() => 'blob:card')
    URL.revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    downloadImage(blob, '사건카드-2026-031.png')

    expect(click).toHaveBeenCalledTimes(1)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:card')
    expect(document.querySelector('a[download]')).toBeNull()
  })
})
