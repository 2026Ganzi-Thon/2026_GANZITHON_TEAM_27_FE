/**
 * 동의 화면 상단. 제목과 안내 문구를 보여준다.
 */
export const ConsentHeader = () => (
  <header className="pt-32.5">
    <h1 className="text-headline font-medium text-ink">
      서비스 이용을 위해
      <br />
      동의가 필요해요
    </h1>
    <p className="mt-2.5 text-xs text-ink">모든 항목에 동의해야 서비스를 이용할 수 있어요.</p>
  </header>
)
