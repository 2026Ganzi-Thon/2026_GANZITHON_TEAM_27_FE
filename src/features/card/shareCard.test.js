import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadImage, shareImage } from './shareCard'

const blob = new Blob(['png'], { type: 'image/png' })

afterEach(() => {
  vi.restoreAllMocks()
  delete navigator.canShare
  delete navigator.share
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

describe('shareImage', () => {
  it('이미지 공유를 지원하지 않으면 `unsupported`를 돌려준다', async () => {
    expect(await shareImage(blob, { fileName: 'a.png', title: '사건 카드' })).toBe('unsupported')

    navigator.canShare = () => false
    expect(await shareImage(blob, { fileName: 'a.png', title: '사건 카드' })).toBe('unsupported')
  })

  it('공유하면 이미지 파일과 제목을 넘기고 `shared`를 돌려준다', async () => {
    navigator.canShare = () => true
    navigator.share = vi.fn().mockResolvedValue(undefined)

    expect(await shareImage(blob, { fileName: 'a.png', title: '사건 카드' })).toBe('shared')

    const [data] = navigator.share.mock.calls[0]
    expect(data.title).toBe('사건 카드')
    expect(data.files[0].name).toBe('a.png')
    expect(data.files[0].type).toBe('image/png')
  })

  it('사용자가 공유 창을 닫으면 `canceled`를 돌려준다', async () => {
    navigator.canShare = () => true
    navigator.share = vi
      .fn()
      .mockRejectedValue(Object.assign(new Error('x'), { name: 'AbortError' }))

    expect(await shareImage(blob, { fileName: 'a.png', title: '사건 카드' })).toBe('canceled')
  })

  it('그 밖의 오류는 그대로 던진다', async () => {
    navigator.canShare = () => true
    navigator.share = vi.fn().mockRejectedValue(new Error('network'))

    await expect(shareImage(blob, { fileName: 'a.png', title: '사건 카드' })).rejects.toThrow(
      'network',
    )
  })
})
