import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteComment,
  fetchPostDetail,
  removePost,
  submitComment,
  toggleCommentLike,
  togglePostLike,
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
 * 게시글 공감(좋아요) 토글 훅. 공감한 글이면 취소하고, 아니면 공감한다.
 * `mutate(baseLiked)`로 글에 원래 공감해 둔 상태를 넘긴다(목업에서만 쓴다).
 * @param {string | undefined} postId 게시글 ID
 */
export const useTogglePostLike = (postId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (baseLiked) => togglePostLike(postId, baseLiked),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(postId) })
    },
  })
}

/**
 * 내 댓글 수정 훅.
 * @param {string | undefined} postId 게시글 ID
 */
export const useUpdateComment = (postId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, content }) => updateComment(postId, commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(postId) })
    },
  })
}

/**
 * 내 댓글 삭제 훅. 댓글 수가 바뀌므로 게시판 목록도 다시 받게 한다.
 * @param {string | undefined} postId 게시글 ID
 */
export const useDeleteComment = (postId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId) => deleteComment(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(postId) })
    },
  })
}

/**
 * 댓글 공감 토글 훅. 공감한 댓글이면 취소하고, 아니면 공감한다.
 * `mutate({ commentId, baseLiked })`로 댓글에 원래 공감해 둔 상태를 넘긴다(목업에서만 쓴다).
 * @param {string | undefined} postId 게시글 ID
 */
export const useToggleCommentLike = (postId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, baseLiked }) => toggleCommentLike(postId, commentId, baseLiked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(postId) })
    },
  })
}

/**
 * 내 게시글 삭제 훅. 지우면 그 글의 상세 캐시를 비운다.
 * @param {string | undefined} postId 게시글 ID
 */
export const useDeleteBoardPost = (postId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => removePost(postId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: boardKeys.detail(postId) })
    },
  })
}
