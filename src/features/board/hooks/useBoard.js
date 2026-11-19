import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteBoardPost,
  deleteComment,
  fetchPostDetail,
  submitComment,
  toggleCommentLike,
  togglePostBookmark,
  togglePostLike,
  updateBoardPost,
  updateComment,
} from '../api/board'

/** 게시판 도메인 Query key factory */
export const boardKeys = {
  all: ['board'],
  detail: (postId) => [...boardKeys.all, 'detail', postId],
}

/**
 * 게시글 상세 조회 훅.
 * @param {string | undefined} postId 게시글 ID
 */
export const usePostDetail = (postId) =>
  useQuery({
    queryKey: boardKeys.detail(postId),
    queryFn: () => fetchPostDetail(postId),
    enabled: Boolean(postId),
    retry: false,
  })

/**
 * 게시글 공감(좋아요) 토글 훅.
 * @param {string | undefined} postId 게시글 ID
 */
export const useTogglePostLike = (postId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (currentlyLiked = false) => togglePostLike(postId, currentlyLiked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(postId) })
    },
  })
}

/**
 * 게시글 북마크 토글 훅.
 * @param {string | undefined} postId 게시글 ID
 */
export const useTogglePostBookmark = (postId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (currentlyBookmarked = false) => togglePostBookmark(postId, currentlyBookmarked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(postId) })
    },
  })
}

/**
 * 댓글 등록 훅.
 * @param {string | undefined} postId 게시글 ID
 */
export const useAddComment = (postId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body) => submitComment(postId, body),
    onSuccess: (result) => {
      if (result?.outcome === 'support_required') return
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(postId) })
    },
  })
}

/**
 * 내가 작성한 게시글 수정 훅. 수정 성공 시 상세·목록 캐시를 새로 받는다.
 * @param {string | undefined} postId 게시글 ID
 */
export const useUpdatePost = (postId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values) => updateBoardPost(postId, values),
    onSuccess: (result) => {
      if (result?.outcome === 'support_required') return
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(postId) })
      queryClient.invalidateQueries({ queryKey: ['board-posts'] })
    },
  })
}

/**
 * 내가 작성한 게시글 삭제 훅. 삭제 성공 시 목록 캐시를 새로 받는다.
 * @param {string | undefined} postId 게시글 ID
 */
export const useDeleteBoardPost = (postId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteBoardPost(postId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: boardKeys.detail(postId) })
      queryClient.invalidateQueries({ queryKey: ['board-posts'] })
    },
  })
}

/**
 * 내가 작성한 댓글 수정 훅.
 * @param {string | undefined} postId 게시글 ID
 */
export const useUpdateComment = (postId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, content }) => updateComment(commentId, { content }),
    onSuccess: (result) => {
      if (result?.outcome === 'support_required') return
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(postId) })
    },
  })
}

/**
 * 내가 작성한 댓글 삭제 훅.
 * @param {string | undefined} postId 게시글 ID
 */
export const useDeleteComment = (postId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(postId) })
    },
  })
}

/**
 * 댓글 공감(좋아요) 토글 훅.
 * @param {string | undefined} postId 게시글 ID
 */
export const useToggleCommentLike = (postId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, currentlyLiked = false }) =>
      toggleCommentLike(commentId, currentlyLiked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(postId) })
    },
  })
}
