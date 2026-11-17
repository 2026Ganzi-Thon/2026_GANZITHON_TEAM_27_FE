import { beforeEach, describe, expect, it } from 'vitest'
import { VISIBILITY } from '@/constants/visibility'
import { createPost } from './createPost'
import { listPosts, POST_SCOPE } from './listPosts'

describe('mock 게시판 글 목록', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('올린 글은 모든 글 목록에 게시 시각과 함께 나온다', async () => {
    await createPost('case-1', { visibility: VISIBILITY.public, title: '제목', body: '본문' })

    const { items } = await listPosts()
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ title: '제목', status: 'published', is_mine: true })
    expect(items[0].published_at).not.toBeNull()
  })

  it('가장 나중에 올린 글이 먼저 나온다', async () => {
    await createPost('case-1', { visibility: VISIBILITY.public, title: '처음', body: '본문' })
    await new Promise((resolve) => setTimeout(resolve, 5))
    await createPost('case-1', { visibility: VISIBILITY.public, title: '나중', body: '본문' })

    const titles = (await listPosts()).items.map((post) => post.title)
    expect(titles).toEqual(['나중', '처음'])
  })

  it('비밀번호 글은 모든 글 목록에서 빠지고 내 글에는 나온다', async () => {
    await createPost('case-1', {
      visibility: VISIBILITY.passwordProtected,
      title: '비밀 글',
      body: '본문',
      password: 'secret-password',
    })

    expect((await listPosts()).items).toEqual([])
    const mine = await listPosts({ scope: POST_SCOPE.mine })
    expect(mine.items).toHaveLength(1)
    expect(mine.items[0].visibility).toBe(VISIBILITY.passwordProtected)
  })

  it('사건 유형(`pattern_tags`)이 하나라도 겹치는 글만 남긴다', async () => {
    await createPost('case-1', { visibility: VISIBILITY.public, title: '글', body: '본문' })

    expect((await listPosts({ patterns: ['labeling'] })).items).toEqual([])
    expect((await listPosts({ patterns: [] })).items).toHaveLength(1)
  })
})
