import { beforeEach, describe, expect, it } from 'vitest'
import { VISIBILITY } from '@/constants/visibility'
import { createPost } from './createPost'
import { readPosts } from './mockPostStore'

describe('mock 게시글 만들기', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('게시글을 만들면 검토 중(`pending_review`)으로 저장한다', async () => {
    const result = await createPost('case-1', {
      visibility: VISIBILITY.public,
      title: '회의 발표 사건',
      body: '한 번의 실수로 나의 가치를 판단할 수는 없다.',
    })

    expect(result.status).toBe('pending_review')
    const [post] = readPosts()
    expect(post.case_id).toBe('case-1')
    expect(post.visibility).toBe('public')
    expect(post.has_password).toBe(false)
  })

  it('비공개 글은 비밀번호를 저장하지 않고 비밀번호가 있다는 표시만 남긴다', async () => {
    await createPost('case-1', {
      visibility: VISIBILITY.passwordProtected,
      title: '제목',
      body: '본문',
      password: 'secret-password',
    })

    const [post] = readPosts()
    expect(post.has_password).toBe(true)
    expect(JSON.stringify(post)).not.toContain('secret-password')
    expect(localStorage.getItem('mock-board-posts')).not.toContain('secret-password')
  })
})
