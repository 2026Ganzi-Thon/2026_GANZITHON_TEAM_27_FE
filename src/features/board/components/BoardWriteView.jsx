import { BoardDetailHeader } from './BoardDetailHeader'
import { useBoardWrite } from '../hooks/useBoardWrite'

/** Figma 71:88 글쓰기 화면. 입력과 공개 범위를 선택하고 목업 요청을 제출한다. */
export const BoardWriteView = ({ onBack }) => {
  const { title, setTitle, body, setBody, visibility, setVisibility, canSubmit, handleSubmit } =
    useBoardWrite()

  return (
    <section className="flex min-h-full flex-1 flex-col bg-canvas pt-status-bar text-black">
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
        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-auto flex h-button shrink-0 items-center justify-center rounded-full bg-field text-base leading-auto font-semibold disabled:cursor-default"
        >
          등록하기
        </button>
      </form>
    </section>
  )
}
