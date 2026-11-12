/** 사건 관련 Query key. 사건이 바뀌면 `caseKeys.all`을 invalidate해 목록과 상세를 함께 새로 받는다. */
export const caseKeys = {
  all: ['cases'],
  list: () => [...caseKeys.all, 'list'],
  detail: (id) => [...caseKeys.all, 'detail', id],
}
