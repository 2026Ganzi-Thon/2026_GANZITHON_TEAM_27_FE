import { describe, expect, it } from 'vitest'
import { apiClient } from '@/lib/apiClient'

/** 실제 네트워크 대신 요청 설정을 그대로 돌려주는 테스트용 adapter */
const echoAdapter = async (config) => ({
  data: null,
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
})

describe('apiClient', () => {
  it('모든 요청에 같은 X-Demo-Id 헤더를 붙인다', async () => {
    const first = await apiClient.get('/cases', { adapter: echoAdapter })
    const second = await apiClient.get('/cases', { adapter: echoAdapter })

    const demoId = first.config.headers.get('X-Demo-Id')
    expect(demoId).toMatch(/^[0-9a-f-]{36}$/)
    expect(second.config.headers.get('X-Demo-Id')).toBe(demoId)
    expect(localStorage.getItem('demo-id')).toBe(demoId)
  })
})
