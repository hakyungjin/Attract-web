import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { logger } from '../../../utils/logger';

interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  timeAgo: string;
  likes: number;
  isLiked: boolean;
}

interface Post {
  id: number;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  timeAgo: string;
  isLiked: boolean;
  age?: number;
  location?: string;
  job?: string;
  views?: number;
  category: 'dating' | 'chat';
  userId?: string;
  authorData?: any; // 글 작성자의 전체 user 정보
}

interface PostDetailPageProps {
  post: Post;
  onBack: () => void;
  onUpdatePost: (updatedPost: Post) => void;
  onDeletePost?: (postId: number) => void;
}

export default function PostDetailPage({ post, onBack, onUpdatePost, onDeletePost }: PostDetailPageProps) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [currentPost, setCurrentPost] = useState<Post>(post);
  const [newComment, setNewComment] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [post]);

  /**
   * userId로 프로필을 로드하고 프로필 상세 페이지로 이동
   */
  const loadAndNavigateToProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        navigate('/profile-detail', {
          state: {
            profile: {
              id: data.id,
              name: data.name,
              age: data.age,
              gender: data.gender,
              location: data.location,
              school: data.school,
              mbti: data.mbti,
              bio: data.bio,
              photos: data.profile_image ? [data.profile_image] : [],
              interests: data.interests || [],
              height: data.height,
              bodyType: data.body_type,
              religion: data.religion,
              smoking: data.smoking,
              drinking: data.drinking
            }
          }
        });
      }
    } catch (error) {
      logger.error('프로필 로드 실패', error);
      alert('프로필을 불러오는데 실패했습니다.');
    }
  };

  const handleLike = async () => {
    const newLikes = currentPost.isLiked ? currentPost.likes - 1 : currentPost.likes + 1;

    const updatedPost = {
      ...currentPost,
      isLiked: !currentPost.isLiked,
      likes: newLikes
    };
    setCurrentPost(updatedPost);
    onUpdatePost(updatedPost);

    // DB 업데이트
    try {
      await supabase
        .from('community_posts')
        .update({ likes: newLikes })
        .eq('id', currentPost.id);
    } catch (error) {
      logger.error('좋아요 업데이트 오류', error);
    }
  };

  const handleCommentLike = async (commentId: number) => {
    const comment = currentPost.comments.find(c => c.id === commentId);
    if (!comment) return;

    const newLikes = comment.isLiked ? comment.likes - 1 : comment.likes + 1;

    const updatedPost = {
      ...currentPost,
      comments: currentPost.comments.map(c =>
        c.id === commentId
          ? {
            ...c,
            isLiked: !c.isLiked,
            likes: newLikes
          }
          : c
      )
    };
    setCurrentPost(updatedPost);
    onUpdatePost(updatedPost);

    // DB 업데이트
    try {
      await supabase
        .from('post_comments')
        .update({ likes: newLikes })
        .eq('id', commentId);
    } catch (error) {
      logger.error('댓글 좋아요 업데이트 오류', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    if (!authUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const commentData = {
        post_id: currentPost.id,
        user_id: authUser.id,
        author_name: authUser.name || '익명',
        avatar_url: authUser.profile_image || '',
        content: newComment,
        likes: 0
      };

      const { data, error } = await supabase
        .from('post_comments')
        .insert([commentData])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newCommentObj: Comment = {
          id: data.id,
          author: data.author_name,
          avatar: data.avatar_url || 'https://readdy.ai/api/search-image?query=Korean%20person%20profile%20avatar%2C%20friendly%20expression%2C%20professional%20portrait%20photography%2C%20soft%20natural%20lighting%2C%20clean%20white%20background%2C%20high%20quality%2C%20realistic&width=100&height=100&seq=myavatar&orientation=squarish',
          content: data.content,
          timeAgo: '방금 전',
          likes: 0,
          isLiked: false
        };

        const updatedPost = {
          ...currentPost,
          comments: [...currentPost.comments, newCommentObj]
        };
        setCurrentPost(updatedPost);
        onUpdatePost(updatedPost);
        setNewComment('');
      }
    } catch (error) {
      logger.error('댓글 작성 오류', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const handleDeletePost = async () => {
    if (currentPost.userId !== authUser?.id) {
      alert('자신의 게시글만 삭제할 수 있습니다.');
      return;
    }

    if (!window.confirm('게시글을 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);
    try {
      // 게시글 삭제
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', currentPost.id);

      if (error) throw error;

      // 콜백 실행
      if (onDeletePost) {
        onDeletePost(currentPost.id);
      }

      alert('게시글이 삭제되었습니다.');
      onBack();
    } catch (error) {
      logger.error('게시글 삭제 오류', error);
      alert('게시글 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white flex items-center px-4 h-14 border-b border-gray-100">
        <button onClick={onBack} className="mr-4">
          <i className="ri-arrow-left-line text-2xl text-gray-800"></i>
        </button>
        <h1 className="text-lg font-bold text-gray-800 flex-1 text-center mr-8">게시글</h1>
      </div>

      {/* Post Content */}
      <div className="bg-white">
        {/* Author Info & Content */}
        <div className="px-4 py-4">
          <div className="flex items-center mb-3">
            <img
              src={currentPost.avatar}
              alt={currentPost.author}
              className="w-10 h-10 rounded-full object-cover mr-3 flex-shrink-0 border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                // 내 게시글이면 내 프로필 페이지로 이동
                if (currentPost.userId === authUser?.id) {
                  navigate('/my-profile');
                  return;
                }
                
                // authorData가 있으면 사용, 없으면 userId로 프로필 조회
                if (currentPost.authorData) {
                  const avatarUrl = currentPost.authorData.avatar_url || currentPost.authorData.profile_image;
                  navigate('/profile-detail', { 
                    state: { 
                      profile: {
                        id: currentPost.authorData.id,
                        name: currentPost.authorData.name,
                        age: currentPost.authorData.age,
                        gender: currentPost.authorData.gender,
                        location: currentPost.authorData.location,
                        school: currentPost.authorData.school,
                        mbti: currentPost.authorData.mbti,
                        bio: currentPost.authorData.bio,
                        photos: avatarUrl ? [avatarUrl] : [],
                        interests: currentPost.authorData.interests || [],
                        height: currentPost.authorData.height,
                        bodyType: currentPost.authorData.body_type,
                        religion: currentPost.authorData.religion,
                        smoking: currentPost.authorData.smoking,
                        drinking: currentPost.authorData.drinking
                      }
                    } 
                  });
                } else if (currentPost.userId) {
                  // userId만 있으면 DB에서 조회 후 이동
                  loadAndNavigateToProfile(currentPost.userId);
                }
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 text-sm truncate">
                {currentPost.author}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{currentPost.timeAgo}</div>
            </div>

            {(currentPost.userId === authUser?.id) && (
              <button
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="text-gray-400 p-2 -mr-2"
              >
                <i className={`ri-${isDeleting ? 'loader-4-line animate-spin' : 'more-fill'} text-xl`}></i>
              </button>
            )}
          </div>

          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {currentPost.content}
          </p>
        </div>

        {/* Main Image */}
        {currentPost.image && (
          <div className="w-full mb-2">
            <img
              src={currentPost.image}
              alt="게시글 이미지"
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Stats Row */}
        <div className="px-4 py-3 flex items-center gap-4 border-b border-gray-50">
          <button onClick={handleLike} className="flex items-center gap-1.5 transition-colors">
            <i className={`${currentPost.isLiked ? 'ri-heart-fill text-pink-500' : 'ri-heart-line text-gray-400'} text-xl`}></i>
            <span className="text-sm text-gray-600">{currentPost.likes}</span>
          </button>
          <div className="flex items-center gap-1.5">
            <i className="ri-chat-3-line text-xl text-gray-400"></i>
            <span className="text-sm text-gray-600">댓글</span>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="px-4 py-4">
        <div className="font-bold text-sm mb-4">댓글 {currentPost.comments.length}</div>

        {currentPost.comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-300">
            <i className="ri-chat-3-line text-4xl mb-2 opacity-50"></i>
            <p className="text-sm">첫 번째 댓글을 남겨보세요!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {currentPost.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <img
                  src={comment.avatar}
                  alt={comment.author}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-900">{comment.author}</span>
                    <span className="text-xs text-gray-400">{comment.timeAgo}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed break-words">{comment.content}</p>
                  <button
                    onClick={() => handleCommentLike(comment.id)}
                    className={`text-xs mt-1.5 flex items-center gap-1 ${comment.isLiked ? 'text-pink-500' : 'text-gray-400'}`}
                  >
                    <i className={comment.isLiked ? 'ri-heart-fill' : 'ri-heart-line'}></i>
                    <span>좋아요 {comment.likes > 0 && comment.likes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-[60px] left-1/2 -translate-x-1/2 w-full max-w-[400px] bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3 z-40" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <img
          src={authUser?.profile_image || 'https://via.placeholder.com/100'}
          alt="내 프로필"
          className="w-8 h-8 rounded-full object-cover border border-gray-100 flex-shrink-0"
        />
        <div className="flex-1 relative">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="댓글을 입력하세요..."
            className="w-full bg-gray-100 rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-200 transition-shadow"
          />
          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${newComment.trim() ? 'text-primary-500 hover:bg-gray-200' : 'text-gray-300'}`}
          >
            <i className="ri-send-plane-fill text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  );
}