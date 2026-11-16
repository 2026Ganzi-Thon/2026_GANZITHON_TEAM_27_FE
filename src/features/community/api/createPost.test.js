import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VISIBILITY } from '@/constants/visibility'
import { apiClient } from '@/lib/apiClient'
import { createPost } from './createPost'
import { deletePost } from './deletePost'
import { listPosts, POST_SCOPE } from './listPosts'

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

describe('게시판 API', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(apiClient.get).mockReset()
    vi.mocked(apiClient.post).mockReset()
    vi.mocked(apiClient.delete).mockReset()
  })

  it('사건 공유는 POST /cases/{id}/posts로 보내고 검토 중 응답을 돌려준다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { id: 'post-1', status: 'pending_review', visibility: 'public' },
    })
    const result = await createPost('case-1', {
      visibility: VISIBILITY.public,
      title: '회의 발표 사건',
      body: '한 번의 실수로 나의 가치를 판단할 수는 없다.',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/cases/case-1/posts', {
      visibility: 'public',
      title: '회의 발표 사건',
      body: '한 번의 실수로 나의 가치를 판단할 수는 없다.',
    })
    expect(result.status).toBe('pending_review')
  })

  it('비공개 글은 비밀번호를 요청 본문에만 담고 저장하지 않는다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { id: 'post-2', status: 'pending_review' },
    })
    await createPost('case-1', {
      visibility: VISIBILITY.passwordProtected,
      title: '제목',
      body: '본문',
      password: 'secret-password',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/cases/case-1/posts', {
      visibility: 'password_protected',
      title: '제목',
      body: '본문',
      password: 'secret-password',
    })
    expect(JSON.stringify({ ...localStorage })).not.toContain('secret-password')
  })

  it('위기 안내(support_required) 응답은 그대로 돌려준다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { outcome: 'support_required', support: { message: '...', contacts: [] } },
    })
    const result = await createPost('case-1', { visibility: 'public', title: 't', body: 'b' })
    expect(result.outcome).toBe('support_required')
  })

  it('목록은 사건 유형마다 tag를 반복해서 GET /board/posts로 받는다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { items: [{ id: 'p1' }], next_cursor: null },
    })
    const result = await listPosts({ patterns: ['labeling', 'mind_reading'] })

    expect(apiClient.get).toHaveBeenCalledWith('/board/posts', {
      params: { tag: ['labeling', 'mind_reading'] },
      paramsSerializer: { indexes: null },
    })
    expect(result).toEqual({ items: [{ id: 'p1' }], next_cursor: null })
  })

  it('내 글만 보기는 GET /board/posts/mine으로 받고 사건 유형은 받은 뒤 거른다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        items: [
          { id: 'p1', pattern_tags: ['labeling'] },
          { id: 'p2', pattern_tags: ['catastrophizing'] },
        ],
        next_cursor: null,
      },
    })
    const result = await listPosts({ patterns: ['labeling'], scope: POST_SCOPE.mine })

    expect(apiClient.get).toHaveBeenCalledWith('/board/posts/mine')
    expect(result.items.map((post) => post.id)).toEqual(['p1'])
  })

  it('글 삭제는 DELETE /board/posts/{id}를 보낸다', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ status: 204 })
    await deletePost('post-1')
    expect(apiClient.delete).toHaveBeenCalledWith('/board/posts/post-1')
  })
})
