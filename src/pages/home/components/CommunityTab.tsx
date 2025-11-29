import { useState, useEffect, useMemo } from 'react';
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
  userId?: string;
  authorData?: any; // 글 작성자의 전체 user 정보
}

import PostDetailPage from './PostDetailPage';

export default function CommunityTab() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<'dating' | 'chat'>('dating');
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        // 먼저 Supabase 인증 사용자 확인
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setCurrentUser(user);

          // 사용자 프로필 정보 가져오기
          try {
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single();

            if (!profileError && profile) {
              setCurrentUser({ ...user, profile });
            }
          } catch (err) {
            // Profile fetch failed, continue with basic user info
          }
        } else {
          // Supabase 사용자 없으면 로컬 스토리지 확인
          const localUser = localStorage.getItem('user');
          if (localUser) {
            try {
              const parsedUser = JSON.parse(localUser);
              setCurrentUser(parsedUser);
              console.log('로컬 스토리지 사용자:', parsedUser);
            } catch (err) {
              console.error('로컬 스토리지 파싱 실패:', err);
              setCurrentUser(null);
            }
          } else {
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.error('사용자 정보 조회 실패:', err);
        // 최후의 수단: 로컬 스토리지 확인
        const localUser = localStorage.getItem('user');
        if (localUser) {
          try {
            setCurrentUser(JSON.parse(localUser));
          } catch (err) {
            setCurrentUser(null);
          }
        }
      }
    };
    getCurrentUser();
  }, []);

  // 게시글 불러오기
  useEffect(() => {
    if (currentUser !== null) {
      loadPosts();
    }
  }, [currentUser]);

  const loadPosts = async () => {
    setIsLoading(true);

    try {
      // 타임아웃 설정 (5초)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const fetchPromise = supabase
        .from('community_posts')
        .select(`
          *,
          users!user_id (
            id,
            name,
            avatar_url,
            age,
            location,
            gender,
            bio,
            school,
            job
          ),
          post_comments (
            id,
            author_name,
            avatar_url,
            content,
            likes,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // 현재 사용자가 좋아요한 게시글 확인
        let userLikes: number[] = [];
        if (currentUser) {
          const { data: likesData } = await supabase
            .from('community_post_likes')
            .select('post_id')
            .eq('user_id', currentUser.id);

          userLikes = likesData?.map(like => like.post_id) || [];
        }

        const formattedPosts: Post[] = data.map((post: any) => {
          const author = post.users;
          return {
            id: post.id,
            author: author?.name || '익명',
            avatar: author?.avatar_url || 'https://readdy.ai/api/search-image?query=Korean%20person%20casual%20portrait%2C%20friendly%20expression%2C%20natural%20lighting%2C%20clean%20background%2C%20high%20quality%2C%20realistic&width=400&height=500&seq=default&orientation=portrait',
            content: post.content,
            image: post.image_url,
            likes: post.likes,
            comments: post.post_comments?.map((comment: any) => ({
              id: comment.id,
              author: comment.author_name,
              avatar: comment.avatar_url || 'https://readdy.ai/api/search-image?query=Korean%20person%20casual%20portrait%2C%20friendly%20expression%2C%20natural%20lighting%2C%20clean%20background%2C%20high%20quality%2C%20realistic&width=100&height=100&seq=default&orientation=squarish',
              content: comment.content,
              timeAgo: getTimeAgo(comment.created_at),
              likes: comment.likes,
              isLiked: false
            })) || [],
            timeAgo: getTimeAgo(post.created_at),
            isLiked: userLikes.includes(post.id),
            age: author?.age,
            location: author?.location,
            job: author?.job,
            views: post.views,
            category: post.category,
            userId: post.user_id,
            authorData: {
              id: author?.id,
              name: author?.name || '익명',
              avatar_url: author?.avatar_url,
              age: author?.age,
              location: author?.location,
              gender: author?.gender,
              bio: author?.bio,
              school: author?.school,
              job: author?.job
            }
          };
        });
        setPosts(formattedPosts);
      } else {
        throw new Error('No data');
      }
    } catch (error: any) {
      // 에러 로깅
      console.error('게시글 로드 실패:', error);
      // Mock 데이터 없이 빈 배열 표시
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}일 전`;
  };

  const filteredPosts = useMemo(
    () => posts.filter(post => post.category === selectedCategory),
    [posts, selectedCategory]
  );

  const handleLike = async (postId: number) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.isLiked) {
        // 좋아요 취소
        await supabase
          .from('community_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUser.id);

        // 좋아요 수 감소
        await supabase
          .from('community_posts')
          .update({ likes: Math.max(0, post.likes - 1) })
          .eq('id', postId);

        // 로컬 상태 업데이트
        setPosts(posts.map(p =>
          p.id === postId
            ? { ...p, isLiked: false, likes: Math.max(0, p.likes - 1) }
            : p
        ));
      } else {
        // 좋아요 추가
        await supabase
          .from('community_post_likes')
          .insert({
            post_id: postId,
            user_id: currentUser.id
          });

        // 좋아요 수 증가
        await supabase
          .from('community_posts')
          .update({ likes: post.likes + 1 })
          .eq('id', postId);

        // 로컬 상태 업데이트
        setPosts(posts.map(p =>
          p.id === postId
            ? { ...p, isLiked: true, likes: p.likes + 1 }
            : p
        ));
      }
    } catch (error) {
      console.error('좋아요 업데이트 오류:', error);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  const handleCommentClick = async (post: Post) => {
    // 조회수 증가
    try {
      await supabase
        .from('community_posts')
        .update({ views: (post.views || 0) + 1 })
        .eq('id', post.id);

      // 로컬 상태 업데이트
      setPosts(posts.map(p =>
        p.id === post.id ? { ...p, views: (p.views || 0) + 1 } : p
      ));
    } catch (error) {
      console.error('조회수 업데이트 오류:', error);
    }

    setSelectedPost(post);
  };

  const handleBackFromDetail = () => {
    setSelectedPost(null);
    window.scrollTo(0, 0);
  };

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const postData = {
        user_id: currentUser.id,
        author_name: currentUser.profile?.name || '익명',
        avatar_url: currentUser.profile?.avatar_url || '',
        title: newPost.substring(0, 50),
        content: `${currentUser.profile?.name || '익명'} (${currentUser.profile?.location || '위치 미설정'} / ${currentUser.profile?.age || '나이 미설정'}세 / ${currentUser.profile?.school || '직업 미설정'})`,
        image_url: currentUser.profile?.avatar_url || 'https://readdy.ai/api/search-image?query=Korean%20person%20casual%20portrait%2C%20friendly%20expression%2C%20natural%20lighting%2C%20clean%20background%2C%20high%20quality%2C%20realistic&width=400&height=500&seq=newpost&orientation=portrait',
        likes: 0,
        views: 0,
        category: selectedCategory,
        age: currentUser.profile?.age,
        location: currentUser.profile?.location,
        job: currentUser.profile?.school
      };

      const { data, error } = await supabase
        .from('community_posts')
        .insert([postData])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newPostObj: Post = {
          id: data.id,
          author: data.title,
          avatar: data.avatar_url,
          content: data.content,
          image: data.image_url,
          likes: 0,
          comments: [],
          timeAgo: '방금 전',
          isLiked: false,
          age: data.age,
          location: data.location,
          job: data.job,
          views: 0,
          category: data.category
        };
        setPosts([newPostObj, ...posts]);
        setNewPost('');
        setShowNewPost(false);
      }
    } catch (error) {
      console.error('게시글 작성 오류:', error);
      alert('게시글 작성에 실패했습니다.');
    }
  };

  if (selectedPost) {
    return (
      <PostDetailPage
        post={selectedPost}
        onBack={handleBackFromDetail}
        onUpdatePost={handleUpdatePost}
        onDeletePost={(postId) => {
          setPosts(posts.filter(p => p.id !== postId));
          setSelectedPost(null);
        }}
      />
    );
  }

  return (
    <div className="px-4 py-4 pb-20 min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold font-display text-slate-800">커뮤니티</h2>
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg shadow-primary-500/30 animate-pulse-soft">
            TODAY
          </div>
          <span className="text-primary-600 font-bold font-display text-lg">30,301</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer group">
            <i className="ri-equalizer-line text-xl text-slate-400 group-hover:text-primary-500 transition-colors"></i>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer group">
            <i className="ri-layout-grid-line text-xl text-slate-400 group-hover:text-primary-500 transition-colors"></i>
          </button>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex space-x-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('dating')}
          className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap cursor-pointer transition-all duration-300 ${selectedCategory === 'dating'
            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105'
            : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
            }`}
        >
          셀프소개팅
        </button>
        <button
          onClick={() => setSelectedCategory('chat')}
          className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap cursor-pointer transition-all duration-300 ${selectedCategory === 'chat'
            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105'
            : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
            }`}
        >
          잡담
        </button>
      </div>

      {/* 정렬 탭 */}
      <div className="flex space-x-2 mb-6">
        <button className="px-4 py-1.5 bg-primary-50 text-primary-600 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer border border-primary-100">
          추천순
        </button>
        <button className="px-4 py-1.5 bg-white text-slate-400 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
          최신순
        </button>
      </div>

      {/* 게시글 목록 */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium animate-pulse">게시글을 불러오는 중...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 group transform hover:-translate-y-0.5"
              onClick={() => handleCommentClick(post)}
            >
              <div className="flex p-3">
                {/* 왼쪽 이미지 */}
                <div className="w-28 h-36 flex-shrink-0 rounded-2xl overflow-hidden relative">
                  <img
                    src={post.image}
                    alt={post.author}
                    className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* 오른쪽 콘텐츠 */}
                <div className="flex-1 ml-4 flex flex-col justify-between py-1">
                  {/* 제목 */}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                        {post.category === 'dating' ? '소개팅' : '잡담'}
                      </span>
                      <span className="text-xs text-slate-400">{post.timeAgo}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800 line-clamp-1 mb-1 group-hover:text-primary-600 transition-colors">
                      {post.author}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{post.content}</p>
                  </div>

                  {/* 하단 정보 */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                    <div className="flex items-center space-x-4 text-xs font-medium text-slate-400">
                      <div className="flex items-center space-x-1.5 group/icon">
                        <i className="ri-eye-line group-hover/icon:text-primary-500 transition-colors"></i>
                        <span>{post.views}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(post.id);
                        }}
                        className="flex items-center space-x-1.5 group/icon cursor-pointer"
                      >
                        <i className={`ri-heart-3-line group-hover/icon:text-pink-500 transition-colors ${post.isLiked ? 'text-pink-500 ri-heart-3-fill' : ''}`}></i>
                        <span>{post.likes}</span>
                      </button>
                      <div className="flex items-center space-x-1.5 group/icon">
                        <i className="ri-chat-3-line group-hover/icon:text-blue-500 transition-colors"></i>
                        <span>{post.comments.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 글쓰기 버튼 */}
      <button
        onClick={() => navigate('/post/create')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-lg shadow-primary-500/40 flex items-center justify-center hover:from-primary-600 hover:to-primary-700 hover:scale-110 transition-all cursor-pointer z-30 group"
      >
        <i className="ri-add-line text-2xl group-hover:rotate-90 transition-transform duration-300"></i>
      </button>

      {/* 새 글 작성 모달 */}
      {showNewPost && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end animate-fade-in">
          <div className="bg-white w-full rounded-t-[2rem] p-6 animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-display text-slate-800">새 글 작성</h3>
              <button
                onClick={() => setShowNewPost(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl text-slate-400"></i>
              </button>
            </div>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="무슨 일이 일어나고 있나요?"
              className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none bg-slate-50 placeholder-slate-400 transition-all"
              rows={5}
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs font-medium text-slate-400">{newPost.length}/500</span>
              <button
                onClick={handleCreatePost}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full hover:from-primary-600 hover:to-primary-700 transition-all cursor-pointer whitespace-nowrap text-sm font-bold shadow-lg shadow-primary-500/30"
              >
                게시하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
