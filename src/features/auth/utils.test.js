import { describe, expect, it } from 'vitest'
import { isValidPassword, validateSignup } from './utils'

describe('isValidPassword', () => {
  it('영문, 숫자, 특수문자를 포함한 6자 이상이면 통과한다', () => {
    expect(isValidPassword('abcd123!')).toBe(true)
  })

  it('6자 미만이거나 구성 요소가 빠지면 실패한다', () => {
    expect(isValidPassword('ab1!')).toBe(false)
    expect(isValidPassword('abcde1')).toBe(false)
    expect(isValidPassword('abcde!')).toBe(false)
    expect(isValidPassword('12345!')).toBe(false)
  })
})

describe('validateSignup', () => {
  it('비밀번호 조건이 틀리면 password 오류를 돌려준다', () => {
    expect(validateSignup({ password: 'abc', passwordConfirm: 'abc' })).toHaveProperty('password')
  })

  it('비밀번호 확인이 다르면 passwordConfirm 오류를 돌려준다', () => {
    expect(validateSignup({ password: 'abcd123!', passwordConfirm: 'abcd123?' })).toHaveProperty(
      'passwordConfirm',
    )
  })

  it('모두 맞으면 빈 객체를 돌려준다', () => {
    expect(validateSignup({ password: 'abcd123!', passwordConfirm: 'abcd123!' })).toEqual({})
  })
})
