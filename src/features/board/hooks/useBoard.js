import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchPostDetail, submitComment, togglePostBookmark, togglePostLike } from '../api/board'

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(postId) })
    },
  })
}
