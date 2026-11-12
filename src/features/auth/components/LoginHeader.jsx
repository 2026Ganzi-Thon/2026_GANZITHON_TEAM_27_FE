import logoUrl from '@/assets/thought-court-logo.svg'

/**
 * 로그인 화면 상단. 서비스 로고(THOUGHT COURT)와 소개 문구를 보여준다.
 */
export const LoginHeader = () => (
  <header className="pt-37.25">
    <h1>
      <img src={logoUrl} alt="Thought Court" width={322} height={34} />
    </h1>
    <p className="mt-4 pl-0.5 text-xs text-ink">
      마음속 생각을 재판하고,
      <br />
      나에게 더 공정한 판결을 내려보세요.
    </p>
  </header>
)
