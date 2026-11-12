/**
 * 완성된 사건 카드 미리보기. 만들어 둔 PNG를 그대로 보여줘서, 저장하고 공유하는 이미지와 항상 같다.
 * 만드는 중과 실패한 경우도 보여준다.
 *
 * @param {{
 *   status: 'idle' | 'loading' | 'ready' | 'error',
 *   url: string | null,
 *   width: number,
 *   height: number,
 *   description: string,
 *   className?: string,
 * }} props
 * - `url`, `width`, `height`: 카드 PNG의 주소와 화면에 보여줄 크기(px)
 * - `description`: 스크린 리더에 읽어 줄 카드 내용
 */
export const CaseCardPreview = ({ status, url, width, height, description, className = '' }) => {
  if (status === 'ready') {
    return <img src={url} alt={description} width={width} height={height} className={className} />
  }

  return (
    <div
      role={status === 'error' ? 'alert' : 'status'}
      className={`flex h-114.75 w-78.75 items-center justify-center text-xs text-ink ${className}`}
    >
      {status === 'error'
        ? '카드를 만들지 못했어요. 새로고침해서 다시 시도해 주세요.'
        : '카드를 만드는 중…'}
    </div>
  )
}
