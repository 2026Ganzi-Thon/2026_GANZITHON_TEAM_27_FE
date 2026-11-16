import { useEffect, useId, useRef, useState } from 'react'
import { BigButton } from '@/components/BigButton'
import lockUrl from '@/assets/share/lock-closed.svg'

/** 캡처 71:76의 비공개 설정 패널. 비밀번호는 패널이 열린 동안에만 보관한다. */
export const BoardPrivateSettings = ({ onSubmit, onClose }) => {
  const [password, setPassword] = useState('')
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef(null)

  useEffect(() => {
    const previousFocus = document.activeElement
    const scroller = dialogRef.current?.closest('main')
    const previousOverflow = scroller?.style.overflow
    if (scroller) scroller.style.overflow = 'hidden'
    dialogRef.current?.focus({ preventScroll: true })
    return () => {
      if (scroller) scroller.style.overflow = previousOverflow
      previousFocus?.focus({ preventScroll: true })
    }
  }, [])

  /** 키보드 포커스를 열린 패널 안에서 순환시킨다. */
  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && onClose) {
      event.preventDefault()
      onClose()
    }
    if (event.key !== 'Tab') return
    const controls = [...dialogRef.current.querySelectorAll('input, button')]
    const first = controls[0]
    const last = controls.at(-1)
    if (
      event.shiftKey &&
      (document.activeElement === first || document.activeElement === dialogRef.current)
    ) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  /** 유효성·완료 화면은 시안 확인 후 연결한다. 비밀번호 원문을 그대로 전달한다. */
  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(password)
  }

  return (
    <div className="absolute inset-0 z-30 overflow-y-auto bg-canvas">
      <div className="flex min-h-full flex-col justify-end">
        <section
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className="relative h-private-panel shrink-0 rounded-t-private-panel bg-field text-ink outline-none"
        >
          <div
            aria-hidden="true"
            className="absolute top-private-handle left-1/2 h-private-handle-height w-private-handle-width -translate-x-1/2 rounded-full bg-ink"
          />
          {/* TODO(에셋 확인 필요): 캡처의 채워진 잠금 SVG를 받으면 기존 테두리형 에셋을 교체한다. */}
          <img
            src={lockUrl}
            alt=""
            className="absolute top-private-lock left-1/2 size-private-lock-size -translate-x-1/2"
          />
          <h1
            id={titleId}
            className="absolute top-private-title w-full text-center text-2xl leading-auto font-semibold"
          >
            비공개 설정
          </h1>
          <p
            id={descriptionId}
            className="absolute top-private-description w-full text-center text-base leading-private-description"
          >
            비밀번호를 설정하면
            <br />
            해당 글은 비밀번호를 아는 사람만
            <br />
            열람할 수 있어요!
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              aria-label="비밀번호"
              placeholder="비밀번호 입력 (4자 이상)"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              className="absolute top-private-password left-4 h-11 w-[calc(100%-2rem)] bg-transparent px-4 text-center text-base leading-auto placeholder:text-ink"
            />
            <div className="absolute right-4 bottom-private-button left-private-button-left">
              <BigButton type="submit">
                <span className="text-field">등록하기</span>
              </BigButton>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
