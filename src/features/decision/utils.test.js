import { describe, expect, it } from 'vitest'
import {
  getDecisionErrorState,
  MAX_STATEMENT_LENGTH,
  toFinalPayload,
  validateStatement,
} from './utils'

/** 오류 응답 형태의 Axios 오류를 만든다. */
const httpError = (status) => ({ response: { status } })

describe('validateStatement', () => {
  it('앞뒤 공백을 뺀 길이가 1~1,000자면 통과한다', () => {
    expect(validateStatement('  다음엔 더 잘할 수 있다.  ', 'reframed')).toBeNull()
    expect(validateStatement('가'.repeat(MAX_STATEMENT_LENGTH), 'reframed')).toBeNull()
  })

  it('비어 있으면 오류지만 판단 보류(deferred)는 비워 둘 수 있다', () => {
    expect(validateStatement('   ', 'reframed')).toBe('수정된 생각을 입력해 주세요.')
    expect(validateStatement('', 'deferred')).toBeNull()
  })

  it('1,000자를 넘으면 오류다', () => {
    expect(validateStatement('가'.repeat(MAX_STATEMENT_LENGTH + 1), 'reframed')).toBe(
      '1000자 이내로 입력해 주세요.',
    )
  })
})

describe('toFinalPayload', () => {
  it('판결 유형과 공백을 정리한 진술문을 보낸다', () => {
    expect(toFinalPayload('reframed', ' 다음엔 더 잘할 수 있다. ')).toEqual({
      decision_type: 'reframed',
      final_statement: '다음엔 더 잘할 수 있다.',
    })
  })

  it('판단 보류에서 진술문이 비어 있으면 final_statement를 뺀다', () => {
    expect(toFinalPayload('deferred', '  ')).toEqual({ decision_type: 'deferred' })
  })
})

describe('getDecisionErrorState', () => {
  it('404는 재시도할 수 없고, 502·503·409·429는 재시도할 수 있다', () => {
    expect(getDecisionErrorState(httpError(404)).canRetry).toBe(false)
    for (const status of [409, 429, 502, 503]) {
      expect(getDecisionErrorState(httpError(status)).canRetry).toBe(true)
    }
  })

  it('422(입력 오류)는 다시 시도하지 않고 입력을 확인하라고 안내한다', () => {
    expect(getDecisionErrorState(httpError(422))).toEqual({
      message: '입력한 내용을 확인해 주세요.',
      canRetry: false,
    })
  })
})
