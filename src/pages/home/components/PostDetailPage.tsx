import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

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
}

interface PostDetailPageProps {
  post: Post;
  onBack: () => void;
  onUpdatePost: (updatedPost: Post) => void;
}

export default function PostDetailPage({ post, onBack, onUpdatePost }: PostDetailPageProps) {
  const navigate = useNavigate();
  const [currentPost, setCurrentPost] = useState<Post>(post);
  const [newComment, setNewComment] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // 현재 사용자 정보 가져오기
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setCurrentUser({ ...user, profile });
        }
      }
    };
    getCurrentUser();
  }, []);

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
      console.error('좋아요 업데이트 오류:', error);
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
      console.error('댓글 좋아요 업데이트 오류:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const commentData = {
        post_id: currentPost.id,
        user_id: currentUser.id,
        author_name: currentUser.profile?.name || '익명',
        avatar_url: currentUser.profile?.avatar_url || '',
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
      console.error('댓글 작성 오류:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line text-xl"></i>
          </button>
          <h1 className="flex-1 text-center font-semibold text-gray-800">게시글</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="px-4 py-6 pb-20">
        <div className="max-w-md mx-auto">
          {/* 게시글 상세 */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <img
                src={currentPost.avatar}
                alt={currentPost.author}
                onClick={() => navigate('/profile-detail')}
                className="w-12 h-12 rounded-full object-cover object-top cursor-pointer hover:opacity-80 transition-opacity"
              />
              <div className="flex-1">
                <h4 
                  onClick={() => navigate('/profile-detail')}
                  className="font-semibold text-gray-800 cursor-pointer hover:text-cyan-500 transition-colors"
                >
                  {currentPost.author}
                </h4>
                <p className="text-sm text-gray-500">{currentPost.timeAgo}</p>
              </div>
            </div>

            <p className="text-gray-700 mb-4 text-base leading-relaxed">{currentPost.content}</p>

            {currentPost.image && (
              <img
                src={currentPost.image}
                alt="게시글 이미지"
                className="w-full h-64 object-cover object-top rounded-lg mb-4"
              />
            )}

            {/* 좋아요/댓글 버튼 */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex space-x-2 w-full">
                <button
                  onClick={handleLike}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    currentPost.isLiked
                      ? 'bg-red-50 text-red-500'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    <i className={`${currentPost.isLiked ? 'ri-heart-fill' : 'ri-heart-line'}`}></i>
                  </div>
                  <span className="text-base font-medium">좋아요</span>
                </button>
                
                <button className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <i className="ri-chat-3-line"></i>
                  </div>
                  <span className="text-base font-medium">댓글</span>
                </button>
              </div>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">
              댓글 {currentPost.comments.length}개
            </h3>

            {/* 댓글 작성 */}
            <div className="flex space-x-3 mb-6 pb-4 border-b border-gray-100">
              <img
                src="https://readdy.ai/api/search-image?query=Korean%20person%20profile%20avatar%2C%20friendly%20expression%2C%20professional%20portrait%20photography%2C%20soft%20natural%20lighting%2C%20clean%20white%20background%2C%20high%20quality%2C%20realistic&width=100&height=100&seq=myavatar&orientation=squarish"
                alt="내 프로필"
                className="w-10 h-10 rounded-full object-cover object-top flex-shrink-0"
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="댓글을 입력하세요..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      newComment.trim()
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    댓글 달기
                  </button>
                </div>
              </div>
            </div>

            {/* 댓글 목록 */}
            {currentPost.comments.length > 0 ? (
              <div className="space-y-4">
                {currentPost.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      onClick={() => navigate('/profile-detail')}
                      className="w-10 h-10 rounded-full object-cover object-top flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg px-4 py-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <span 
                            onClick={() => navigate('/profile-detail')}
                            className="font-medium text-sm text-gray-800 cursor-pointer hover:text-cyan-500 transition-colors"
                          >
                            {comment.author}
                          </span>
                          <span className="text-xs text-gray-500">{comment.timeAgo}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 ml-4">
                        <button
                          onClick={() => handleCommentLike(comment.id)}
                          className={`flex items-center space-x-1 text-xs transition-colors cursor-pointer ${
                            comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                          }`}
                        >
                          <i className={`${comment.isLiked ? 'ri-heart-fill' : 'ri-heart-line'}`}></i>
                          {comment.likes > 0 && <span>{comment.likes}</span>}
                        </button>
                        <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                          답글
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-chat-3-line text-4xl text-gray-300"></i>
                </div>
                <p className="text-gray-500">첫 번째 댓글을 남겨보세요!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}