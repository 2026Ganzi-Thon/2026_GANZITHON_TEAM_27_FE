import { beforeEach, describe, expect, it } from 'vitest'
import { VISIBILITY } from '@/constants/visibility'
import { createPost } from './createPost'
import { readPosts } from './mockPostStore'
import { updatePost } from './updatePost'

describe('mock 게시글 수정', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('제목·본문·공개 범위를 바꾸고 올린 시각과 검토 상태는 그대로 둔다', async () => {
    const { id } = await createPost('case-1', {
      visibility: VISIBILITY.public,
      title: '처음 제목',
      body: '처음 본문',
    })
    const [before] = readPosts()

    const result = await updatePost(id, {
      title: '고친 제목',
      body: '고친 본문',
      visibility: VISIBILITY.passwordProtected,
      password: 'secret-password',
    })

    expect(result).toEqual({ id })
    const [after] = readPosts()
    expect(after).toMatchObject({
      id,
      title: '고친 제목',
      body: '고친 본문',
      visibility: 'password_protected',
      has_password: true,
      created_at: before.created_at,
      status: before.status,
    })
    expect(localStorage.getItem('mock-board-posts')).not.toContain('secret-password')
  })

  it('없는 글이면 null을 돌려주고 아무것도 바꾸지 않는다', async () => {
    await createPost('case-1', { visibility: VISIBILITY.public, title: '제목', body: '본문' })

    expect(await updatePost('없는-글', { title: 'a', body: 'b', visibility: 'public' })).toBeNull()
    expect(readPosts()[0].title).toBe('제목')
  })
})
