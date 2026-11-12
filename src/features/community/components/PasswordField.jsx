import { POST_PASSWORD_LENGTH } from '@/constants/visibility'

/**
 * 비공개 글의 비밀번호 입력칸. 비밀번호 규칙(6~64자)에 맞지 않으면 안내 문구를 보여준다.
 *
 * @param {{ value: string, onChange: (value: string) => void, error?: string }} props
 * - `value`: 입력한 비밀번호
 * - `onChange`: 입력하면 새 값과 함께 호출한다
 * - `error`: 안내할 오류 문구. 없으면 빈 문자열
 */
export const PasswordField = ({ value, onChange, error = '' }) => (
  <div>
    <label
      htmlFor="post-password"
      className="ml-5 block text-base leading-[normal] font-semibold text-ink"
    >
      비밀번호 설정
    </label>
    <input
      id="post-password"
      type="password"
      value={value}
      maxLength={POST_PASSWORD_LENGTH.max}
      onChange={(event) => onChange(event.target.value)}
      placeholder="비밀번호를 입력해주세요."
      autoComplete="new-password"
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error ? 'post-password-error' : undefined}
      className="mx-4.5 mt-2.75 block h-13.5 w-[calc(100%-36px)] rounded-[5px] bg-field px-4.75 text-xs text-ink placeholder:text-ink"
    />
    {error && (
      <p id="post-password-error" role="alert" className="mx-4.5 mt-2 text-xs text-danger">
        {error}
      </p>
    )}
  </div>
)
