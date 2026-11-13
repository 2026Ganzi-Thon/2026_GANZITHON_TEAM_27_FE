import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IntensitySlider } from './IntensitySlider'

/** 바 위치: 화면 x 100에서 시작하고 길이 200px (값 1 = 2px) */
const TRACK = { left: 100, width: 200 }
const xOf = (value) => TRACK.left + (TRACK.width * value) / 100

/** 실제 화면처럼 값 상태를 가진 슬라이더를 그린다. */
const Harness = ({ initial = 40, onChange }) => {
  const [value, setValue] = useState(initial)
  return (
    <>
      <IntensitySlider
        value={value}
        onChange={(next) => {
          onChange?.(next)
          setValue(next)
        }}
        label="지금 감정의 강도"
      />
      <output data-testid="number">{value}</output>
    </>
  )
}

const renderSlider = (props) => {
  render(<Harness {...props} />)
  return screen.getByRole('slider', { name: '지금 감정의 강도' })
}

/** 슬라이더의 값(aria-valuenow)과 화면 숫자가 같은지 확인한다. */
const expectValue = (slider, value) => {
  expect(slider).toHaveAttribute('aria-valuenow', String(value))
  expect(screen.getByTestId('number')).toHaveTextContent(String(value))
}

describe('IntensitySlider', () => {
  beforeEach(() => {
    // jsdom은 레이아웃을 계산하지 않으므로 바 위치를 정해 준다.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: TRACK.left,
      width: TRACK.width,
      top: 0,
      height: 44,
      right: TRACK.left + TRACK.width,
      bottom: 44,
      x: TRACK.left,
      y: 0,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('접근성 속성(role, 최소·최대·현재 값)을 가진다', () => {
    const slider = renderSlider()
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '100')
    expectValue(slider, 40)
    expect(slider).toHaveAttribute('tabindex', '0')
  })

  it('바를 클릭하면 그 위치 값으로 바로 이동한다', () => {
    const slider = renderSlider()
    fireEvent.pointerDown(slider, { clientX: xOf(25), pointerId: 1, button: 0 })
    fireEvent.pointerUp(slider, { clientX: xOf(25), pointerId: 1 })
    expectValue(slider, 25)
  })

  it('드래그하면 숫자가 실시간으로 바뀌고, 손을 떼면 더 바뀌지 않는다', () => {
    const slider = renderSlider()
    fireEvent.pointerDown(slider, { clientX: xOf(40), pointerId: 1, button: 0 })
    for (const value of [55, 70, 82]) {
      fireEvent.pointerMove(slider, { clientX: xOf(value), pointerId: 1 })
      expectValue(slider, value)
    }
    fireEvent.pointerUp(slider, { clientX: xOf(82), pointerId: 1 })
    fireEvent.pointerMove(slider, { clientX: xOf(10), pointerId: 1 })
    expectValue(slider, 82)
  })

  it('누르지 않고 움직이기만 하면 값이 바뀌지 않는다', () => {
    const slider = renderSlider()
    fireEvent.pointerMove(slider, { clientX: xOf(90), pointerId: 1 })
    expectValue(slider, 40)
  })

  it('값은 정수로 반올림한다', () => {
    const slider = renderSlider()
    fireEvent.pointerDown(slider, { clientX: xOf(33.4), pointerId: 1, button: 0 })
    expectValue(slider, 33)
    fireEvent.pointerMove(slider, { clientX: xOf(33.6), pointerId: 1 })
    expectValue(slider, 34)
  })

  it('바 바깥으로 끌어도 0 미만·100 초과로 가지 않는다', () => {
    const slider = renderSlider()
    fireEvent.pointerDown(slider, { clientX: xOf(50), pointerId: 1, button: 0 })
    fireEvent.pointerMove(slider, { clientX: TRACK.left + TRACK.width + 500, pointerId: 1 })
    expectValue(slider, 100)
    fireEvent.pointerMove(slider, { clientX: TRACK.left - 500, pointerId: 1 })
    expectValue(slider, 0)
  })

  it('바 양 끝을 누르면 0과 100이 된다', () => {
    const slider = renderSlider()
    fireEvent.pointerDown(slider, { clientX: xOf(0), pointerId: 1, button: 0 })
    expectValue(slider, 0)
    fireEvent.pointerDown(slider, { clientX: xOf(100), pointerId: 1, button: 0 })
    expectValue(slider, 100)
  })

  it('마우스 오른쪽 버튼으로는 움직이지 않는다', () => {
    const slider = renderSlider()
    fireEvent.pointerDown(slider, { clientX: xOf(90), pointerId: 1, button: 2 })
    expectValue(slider, 40)
  })

  it('키보드: ←→ 1씩, Home 0, End 100이고 범위를 넘지 않는다', () => {
    const slider = renderSlider()
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expectValue(slider, 41)
    fireEvent.keyDown(slider, { key: 'ArrowLeft' })
    fireEvent.keyDown(slider, { key: 'ArrowLeft' })
    expectValue(slider, 39)
    fireEvent.keyDown(slider, { key: 'End' })
    expectValue(slider, 100)
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expectValue(slider, 100)
    fireEvent.keyDown(slider, { key: 'Home' })
    expectValue(slider, 0)
    fireEvent.keyDown(slider, { key: 'ArrowLeft' })
    expectValue(slider, 0)
  })

  it('값이 그대로면 onChange를 부르지 않는다', () => {
    const onChange = vi.fn()
    const slider = renderSlider({ initial: 100, onChange })
    fireEvent.keyDown(slider, { key: 'End' })
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onChange).not.toHaveBeenCalled()
  })
})
