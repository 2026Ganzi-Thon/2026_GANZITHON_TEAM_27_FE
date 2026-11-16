/** 게시판 Query key. 글이 바뀌면 `postKeys.all`을 invalidate해 모든 목록을 새로 받는다. */
export const postKeys = {
  all: ['board-posts'],
  list: (filters) => [...postKeys.all, 'list', filters],
}
