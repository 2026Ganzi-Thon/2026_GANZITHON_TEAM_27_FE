import { useId } from 'react'

/**
 * 라벨과 입력창이 한 카드 안에 들어 있는 인증용 입력 필드.
 * 카드 어디를 눌러도 입력창에 포커스가 가고, 포커스 표시는 카드 전체에 보인다.
 * @param {object} props
 * @param {string} props.label 필드 이름 (예: 아이디)
 * @param {string} props.name input name
 * @param {string} props.type input type
 * @param {string} props.placeholder 안내 문구
 * @param {string} [props.autoComplete] 브라우저 자동완성 힌트
 * @param {boolean} [props.muted] true면 배경을 60% 투명도로 보여준다(로그인 화면 디자인)
 * @param {string} [props.error] 오류 문구. 있으면 입력창에 오류 상태를 표시한다
 */
export const AuthField = ({
  label,
  name,
  type,
  placeholder,
  autoComplete,
  muted = false,
  error,
}) => {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div>
      <label
        htmlFor={id}
        className={`flex h-field cursor-text flex-col gap-1 rounded-field px-6.25 pt-5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus ${
          muted ? 'bg-field/60' : 'bg-field'
        }`}
      >
        <span className="text-base font-semibold text-ink">{label}</span>
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="bg-transparent text-xs text-ink outline-none placeholder:text-ink focus-visible:outline-none"
        />
      </label>
      {error ? (
        <p id={errorId} role="alert" className="mt-1 px-6.25 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}
