import { expect, it } from 'vitest'
import { mapBoardPost } from './mapBoardPost'

it('직접 응답과 data 래퍼 응답을 같은 화면 모델로 바꾼다', () => {
  const post = { title: '제목', content: '본문', like_count: 0, is_liked: false }
  expect(mapBoardPost({ data: post })).toEqual(mapBoardPost(post))
  expect(mapBoardPost(post)).toMatchObject(post)
})

it('없는 값은 undefined로 남기고 다른 이름의 필드를 추측하지 않는다', () => {
  const result = mapBoardPost({ body: '추측하지 않을 본문', likes: 24 })
  expect(Object.values(result).every((value) => value === undefined)).toBe(true)
  expect(mapBoardPost(null)).toEqual(mapBoardPost(undefined))
})

it('필드 타입이 맞지 않아도 화면에 잘못된 객체를 전달하지 않는다', () => {
  expect(mapBoardPost({ title: {}, comments: [null, 'text'], like_count: '24' })).toMatchObject({
    title: undefined,
    comments: [],
    like_count: undefined,
  })
})
