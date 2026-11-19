import { Outlet } from 'react-router-dom'
import { BoardDetailHeader } from './BoardDetailHeader'
import { useBoardWrite } from '../hooks/useBoardWrite'
import { BoardPrivateSettings } from './BoardPrivateSettings'

/**
 * Figma 71:88 글쓰기 화면. 입력과 공개 범위를 선택하고 `POST /board/posts`로 등록한다.
 * @param {object} props
 * @param {() => void} [props.onBack] 뒤로 가기
 * @param {() => void} [props.onOpenPrivate] 비공개 설정을 하위 라우트로 열 때 호출한다(없으면 패널을 바로 연다)
 * @param {() => void} [props.onClosePrivate] 비공개 설정을 닫을 때 호출한다
 * @param {boolean} [props.isPrivateRoute] 비공개 설정 하위 라우트가 열려 있는지
 * @param {(result: object) => void} [props.onSubmitted] 등록에 성공하면 호출한다
 * @param {() => void} [props.onSupportRequired] 응답이 위기 안내(`support_required`)면 호출한다
 */
export const BoardWriteView = ({
  onBack,
  onOpenPrivate,
  onClosePrivate,
  isPrivateRoute = false,
  onSubmitted,
  onSupportRequired,
}) => {
  const {
    title,
    setTitle,
    body,
    setBody,
    visibility,
    setVisibility,
    canSubmit,
    handleSubmit,
    isPending,
    errorMessage,
    isPrivateOpen,
    closePrivate,
    submitPrivate,
  } = useBoardWrite({ onOpenPrivate, onClosePrivate, onSubmitted, onSupportRequired })
  const privateOpen = isPrivateOpen || isPrivateRoute

  return (
    <>
      <section
        inert={privateOpen}
        aria-hidden={privateOpen || undefined}
        className="flex min-h-full flex-1 flex-col bg-canvas pt-status-bar text-black"
      >
        <BoardDetailHeader onBack={onBack} showShare={false} />
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col px-4 pt-board-write-top pb-board-write-bottom"
        >
          <input
            aria-label="제목"
            placeholder="제목을 입력해주세요"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-board-write-title shrink-0 rounded-field border-0 bg-field px-board-write-inset text-xs leading-auto placeholder:text-black"
          />
          <textarea
            aria-label="본문"
            placeholder="내용을 입력해주세요"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="mt-board-write-gap h-board-write-body shrink-0 resize-none rounded-field border-0 bg-field px-board-write-inset py-board-write-body-inset text-xs leading-auto placeholder:text-black"
          />
          <fieldset className="mt-board-write-visibility flex min-h-11 shrink-0 items-center gap-board-write-option border-0 p-0">
            <legend className="sr-only">공개 설정</legend>
            <span className="mr-board-write-label text-sm leading-auto" aria-hidden="true">
              공개 설정
            </span>
            {[
              ['public', '공개'],
              ['password_protected', '비공개'],
            ].map(([value, label]) => (
              <label
                key={value}
                className="flex min-h-11 cursor-pointer items-center gap-0.5 text-xs leading-auto"
              >
                <input
                  type="radio"
                  name="visibility"
                  value={value}
                  checked={visibility === value}
                  onChange={() => setVisibility(value)}
                  className="size-board-write-radio appearance-none rounded-full bg-field checked:border-4 checked:border-ink"
                />
                {label}
              </label>
            ))}
          </fieldset>
          {/* TODO(Figma 확인 필요): 활성·선택 상태 시안이 없어 색상 전환은 보류한다. */}
          {errorMessage && !privateOpen && (
            <p role="alert" className="mt-4 text-sm text-danger">
              {errorMessage}
            </p>
          )}
          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-auto flex h-button shrink-0 items-center justify-center rounded-full bg-field text-base leading-auto font-semibold disabled:cursor-default"
          >
            {isPending ? '등록 중…' : '등록하기'}
          </button>
        </form>
      </section>
      <Outlet context={{ submitPrivate, closePrivate, errorMessage, isPending }} />
      {isPrivateOpen && (
        <BoardPrivateSettings
          onSubmit={submitPrivate}
          onClose={closePrivate}
          error={errorMessage}
          isPending={isPending}
        />
      )}
    </>
  )
}
