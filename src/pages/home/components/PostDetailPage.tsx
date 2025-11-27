import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

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
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20">
        <div className="flex items-center px-4 py-3 max-w-md mx-auto">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer group"
          >
            <i className="ri-arrow-left-line text-xl text-slate-600 group-hover:text-primary-600 transition-colors"></i>
          </button>
          <h1 className="flex-1 text-center font-bold text-slate-800 font-display">게시글</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="px-4 py-6 pb-20">
        <div className="max-w-md mx-auto space-y-6">
          {/* 게시글 상세 */}
          <div className="bg-white rounded-3xl shadow-lg shadow-primary-500/5 p-6 animate-slide-up">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative group cursor-pointer" onClick={() => navigate('/profile-detail')}>
                <img
                  src={currentPost.avatar}
                  alt={currentPost.author}
                  className="w-14 h-14 rounded-2xl object-cover object-top shadow-md group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1">
                <h4
                  onClick={() => navigate('/profile-detail')}
                  className="font-bold text-lg text-slate-800 cursor-pointer hover:text-primary-600 transition-colors font-display"
                >
                  {currentPost.author}
                </h4>
                <p className="text-xs font-medium text-slate-400">{currentPost.timeAgo}</p>
              </div>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400">
                <i className="ri-more-fill"></i>
              </button>
            </div>

            <p className="text-slate-600 mb-6 text-base leading-relaxed whitespace-pre-wrap">{currentPost.content}</p>

            {currentPost.image && (
              <div className="rounded-2xl overflow-hidden mb-6 shadow-md">
                <img
                  src={currentPost.image}
                  alt="게시글 이미지"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}

            {/* 좋아요/댓글 버튼 */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex space-x-3 w-full">
                <button
                  onClick={handleLike}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap group ${currentPost.isLiked
                    ? 'bg-pink-50 text-pink-500 shadow-inner'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                >
                  <i className={`text-xl transition-transform group-hover:scale-110 ${currentPost.isLiked ? 'ri-heart-fill animate-pulse-soft' : 'ri-heart-line'}`}></i>
                  <span className="text-sm font-bold">좋아요 {currentPost.likes > 0 && currentPost.likes}</span>
                </button>

                <button className="flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all cursor-pointer whitespace-nowrap group">
                  <i className="ri-chat-3-line text-xl group-hover:scale-110 transition-transform"></i>
                  <span className="text-sm font-bold">댓글 {currentPost.comments.length > 0 && currentPost.comments.length}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="bg-white rounded-3xl shadow-lg shadow-primary-500/5 p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="font-bold text-slate-800 mb-6 flex items-center">
              댓글 <span className="ml-2 text-primary-500">{currentPost.comments.length}</span>
            </h3>

            {/* 댓글 작성 */}
            <div className="flex space-x-4 mb-8 pb-6 border-b border-slate-50">
              <img
                src="https://readdy.ai/api/search-image?query=Korean%20person%20profile%20avatar%2C%20friendly%20expression%2C%20professional%20portrait%20photography%2C%20soft%20natural%20lighting%2C%20clean%20white%20background%2C%20high%20quality%2C%20realistic&width=100&height=100&seq=myavatar&orientation=squarish"
                alt="내 프로필"
                className="w-10 h-10 rounded-full object-cover object-top flex-shrink-0 shadow-sm"
              />
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="댓글을 남겨보세요..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none bg-slate-50 transition-all placeholder-slate-400"
                    rows={2}
                    maxLength={500}
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                    className={`absolute bottom-3 right-3 p-2 rounded-full transition-all ${newComment.trim()
                      ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-md transform hover:scale-105'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                  >
                    <i className="ri-send-plane-fill"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* 댓글 목록 */}
            {currentPost.comments.length > 0 ? (
              <div className="space-y-6">
                {currentPost.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 group">
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      onClick={() => navigate('/profile-detail')}
                      className="w-10 h-10 rounded-full object-cover object-top flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                    />
                    <div className="flex-1">
                      <div className="bg-slate-50 rounded-2xl rounded-tl-none px-5 py-3.5 hover:bg-slate-100 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            onClick={() => navigate('/profile-detail')}
                            className="font-bold text-sm text-slate-800 cursor-pointer hover:text-primary-600 transition-colors"
                          >
                            {comment.author}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">{comment.timeAgo}</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 ml-2">
                        <button
                          onClick={() => handleCommentLike(comment.id)}
                          className={`flex items-center space-x-1 text-xs font-medium transition-colors cursor-pointer group/like ${comment.isLiked ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'
                            }`}
                        >
                          <i className={`${comment.isLiked ? 'ri-heart-fill' : 'ri-heart-line'} group-hover/like:scale-110 transition-transform`}></i>
                          <span>{comment.likes > 0 ? comment.likes : '좋아요'}</span>
                        </button>
                        <button className="text-xs font-medium text-slate-400 hover:text-primary-500 transition-colors cursor-pointer">
                          답글달기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-3 bg-white rounded-full shadow-sm">
                  <i className="ri-chat-smile-2-line text-3xl text-primary-300"></i>
                </div>
                <p className="text-slate-500 font-medium">첫 번째 댓글의 주인공이 되어보세요!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}