/**
 * 홈 화면 최근 사건 목록용 임시 데이터. 디자인 시안의 값을 그대로 옮겼다.
 * TODO(API 확인 필요): `GET /cases` 목록 item 응답 필드가 확정되면 TanStack Query hook으로 교체한다.
 */
export const mockResumeCase = {
  id: 'sample-resume',
  title: '나는 왜 자꾸 불안할까?',
  dateLabel: '2026.11.06',
  statusLabel: '진행중',
}

export const mockRecentCases = [
  {
    id: 'sample-1',
    title: '나는 왜 자꾸 불안할까?',
    dateLabel: 'July 20,2026',
    emotionChange: '불안 80 → 40',
  },
  {
    id: 'sample-2',
    title: '나는 왜 자꾸 불안할까?',
    dateLabel: 'July 20,2026',
    emotionChange: '불안 80 → 40',
  },
  {
    id: 'sample-3',
    title: '나는 왜 자꾸 불안할까?',
    dateLabel: 'July 20,2026',
    emotionChange: '불안 80 → 40',
  },
]
