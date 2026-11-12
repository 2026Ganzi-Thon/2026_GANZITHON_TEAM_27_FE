import { useState } from 'react'
import { Link } from 'react-router-dom'
import backUrl from '@/assets/intake/back.svg'
import homeIconUrl from '@/assets/intake/home-icon.svg'
import { PageHeader } from '@/components/PageHeader'
import { RecessModal } from '@/components/RecessModal'

/**
 * [개발 서버 전용] 휴정 안내 모달 미리보기 (`/dev/recess-modal`). 배포 빌드에는 들어가지 않는다.
 * Figma `2-1 기소` 위 모달처럼, 법정 화면 헤더 아래에 내용이 깔린 상태에서 모달을 띄운다.
 * 기소 화면은 아직 dev에 없어 비슷한 자리의 대체 내용을 깐다(픽셀 비교는 모달·헤더 영역 기준).
 * 처음부터 열려 있고, 닫은 뒤에는 뒤로가기 버튼으로 다시 열 수 있다.
 */
const RecessModalPreviewPage = () => {
  const [open, setOpen] = useState(true)
  const [log, setLog] = useState('')

  return (
    <div className="flex flex-1 flex-col bg-canvas pt-16.25 text-ink">
      <PageHeader
        title="기소"
        left={
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="뒤로 가기"
            className="flex size-11 items-center justify-center"
          >
            <img src={backUrl} alt="" width={15} height={8} className="max-w-none rotate-90" />
          </button>
        }
        right={
          <Link
            to="/"
            aria-label="홈으로 이동"
            className="flex size-11 items-center justify-center"
          >
            <img src={homeIconUrl} alt="" width={17} height={19} />
          </Link>
        }
      />

      {/* 대체 내용: 기소 화면의 타이틀·사건번호·말풍선·카드·버튼 자리 */}
      <div className="mt-3.5 ml-4.75 h-6.5 w-60.75 rounded-field bg-ink" />
      <div className="mt-3.5 ml-4.75 h-4.25 w-63.75 rounded-field bg-ink" />
      <div className="mt-7.5 ml-5.25 h-9.25 w-42.75 rounded-field bg-ink" />
      <div className="mt-1 ml-5.75 h-24.75 w-91 rounded-field bg-sky" />
      <div className="mt-5.75 ml-5.75 h-25.5 w-91.75 rounded-field bg-field" />
      <div className="mt-5 ml-5.75 h-21 w-91.75 rounded-field bg-card-gray" />
      <div className="mt-5 ml-5.75 h-21 w-91.75 rounded-field bg-card-gray" />
      <div className="mt-auto mb-9.5 ml-4.5 h-button w-92.25 rounded-full bg-ink" />

      {log && (
        <p role="status" className="absolute top-12 left-4 text-xs text-ink">
          {log}
        </p>
      )}

      <RecessModal
        open={open}
        onConfirm={() => {
          setLog('onConfirm 호출됨 (실제 화면에서는 API·이동을 처리)')
          setOpen(false)
        }}
        onCancel={() => setOpen(false)}
      />
    </div>
  )
}

export default RecessModalPreviewPage
