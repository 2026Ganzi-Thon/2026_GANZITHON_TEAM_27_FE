import { fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CRISIS_CONTACTS, CRISIS_SCREEN_CONTACTS, toTelHref } from '@/constants/crisisContacts'
import { CrisisSupportView } from './index'

/** 이전 화면(/cases/case-1/defense)에서 위기 안내로 들어온 상황을 만든다. */
const renderView = () => {
  const router = createMemoryRouter(
    [
      { path: '/', element: <h1>홈 화면</h1> },
      { path: '/cases/case-1/defense', element: <h1>변론 화면</h1> },
      { path: '/support', element: <CrisisSupportView homeTo="/" /> },
    ],
    { initialEntries: ['/cases/case-1/defense', '/support'], initialIndex: 1 },
  )
  render(<RouterProvider router={router} />)
  return router
}

describe('CrisisSupportView', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('Figma 문구를 한 글자도 다르지 않게 보여준다', () => {
    renderView()
    expect(screen.getByRole('heading', { name: '지금, 괜찮으신가요?' })).toBeInTheDocument()
    expect(
      screen.getByText(
        /지금의 생각이 너무 힘들게 느껴진다면,\s*혼자 고민하지 말고 도움을 받아보세요\./,
      ),
    ).toBeInTheDocument()
    expect(screen.getAllByText('24시간, 언제든지 상담이 가능합니다.')).toHaveLength(2)
    expect(screen.getAllByText('바로연결')).toHaveLength(2)
    expect(screen.getByRole('link', { name: '괜찮아요, 계속할게요.' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '휴정하기' })).toBeInTheDocument()
  })

  it('화면의 번호(1577-0199, 109)와 기관 이름이 Figma 순서대로 보인다', () => {
    renderView()
    const links = screen.getAllByRole('link', { name: /에 전화 걸기$/ })
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveTextContent('정신건강 위기상담전화')
    expect(links[0]).toHaveTextContent('1577-0199')
    expect(links[1]).toHaveTextContent('자살예방 상담전화')
    expect(links[1]).toHaveTextContent('109')
  })

  it('전화 링크는 숫자만 남긴 tel: 주소이고 aria-label과 설명을 가진다', () => {
    renderView()
    const mental = screen.getByRole('link', { name: '정신건강 위기상담전화 1577-0199에 전화 걸기' })
    const suicide = screen.getByRole('link', { name: '자살예방 상담전화 109에 전화 걸기' })
    expect(mental).toHaveAttribute('href', 'tel:15770199')
    expect(suicide).toHaveAttribute('href', 'tel:109')
    expect(mental).toHaveAccessibleDescription('24시간, 언제든지 상담이 가능합니다.')
    expect(suicide).toHaveAccessibleDescription('24시간, 언제든지 상담이 가능합니다.')
  })

  it('1388·112·119는 상수에는 있지만 화면에는 아직 보이지 않는다', () => {
    renderView()
    expect(CRISIS_CONTACTS.youthCounseling.number).toBe('1388')
    expect(CRISIS_CONTACTS.police.number).toBe('112')
    expect(CRISIS_CONTACTS.fireAndAmbulance.number).toBe('119')
    expect(CRISIS_SCREEN_CONTACTS).toHaveLength(2)
    for (const number of ['1388', '112', '119']) {
      expect(screen.queryByText(number)).not.toBeInTheDocument()
    }
  })

  it.each([['뒤로 가기'], ['홈으로 이동'], ['괜찮아요, 계속할게요.'], ['휴정하기']])(
    '"%s"는 이전 화면(법정 흐름)이 아니라 홈으로 간다',
    async (name) => {
      renderView()
      fireEvent.click(screen.getByRole('link', { name }))
      expect(await screen.findByRole('heading', { name: '홈 화면' })).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: '변론 화면' })).not.toBeInTheDocument()
    },
  )

  it('화면을 열어도 저장소·콘솔에 아무것도 남기지 않는다', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const log = vi.spyOn(console, 'log')
    const error = vi.spyOn(console, 'error')
    renderView()
    expect(setItem).not.toHaveBeenCalled()
    expect(log).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  })
})

describe('toTelHref', () => {
  it('하이픈 등 숫자가 아닌 글자를 뺀다', () => {
    expect(toTelHref('1577-0199')).toBe('tel:15770199')
    expect(toTelHref('109')).toBe('tel:109')
  })
})
