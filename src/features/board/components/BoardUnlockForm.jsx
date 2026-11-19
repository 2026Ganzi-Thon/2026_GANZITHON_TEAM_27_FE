import { useId, useState } from 'react'

/**
 * 비공개 글 비밀번호 입력 폼. 상세 조회가 `404`일 때(남의 비공개 글일 수 있다) 보여준다.
 * 비밀번호는 이 컴포넌트 안에서만 보관하고, 연 뒤에는 지운다.
 * TODO(피그마 확인 필요): 비공개 글 열기 시안이 없어 기존 오류 화면 스타일을 따른다.
 *
 * @param {object} props
 * @param {(password: string) => Promise<boolean>} props.onUnlock 비밀번호와 함께 호출한다. 성공하면 true
 * @param {boolean} [props.isPending] 여는 중인지
 * @param {string | null} [props.error] 실패 안내 문구
 */
export const BoardUnlockForm = ({ onUnlock, isPending = false, error = null }) => {
  const [password, setPassword] = useState('')
  const errorId = useId()

  /** 비밀번호를 보내고, 성공하면 입력을 지운다. */
  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isPending) return
    if (await onUnlock(password)) setPassword('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col items-center gap-3">
      <p className="text-sm text-ink">비공개 글이라면 비밀번호를 입력해 열 수 있어요.</p>
      <input
        type="password"
        aria-label="게시글 비밀번호"
        aria-describedby={error ? errorId : undefined}
        placeholder="비밀번호 입력"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="off"
        className="h-12 w-full rounded-field border border-line bg-field px-4 text-center text-base text-ink placeholder:text-muted focus:border-ink"
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="min-h-11 rounded-full bg-ink px-5 text-sm font-semibold text-field disabled:opacity-40"
      >
        {isPending ? '여는 중…' : '비밀번호로 열기'}
      </button>
    </form>
  )
}
