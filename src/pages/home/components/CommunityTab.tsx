import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { CommunityListSkeleton } from '../../../components/base/Skeleton';

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

// 전역 캐시 - 컴포넌트 외부에 선언하여 리렌더링에도 유지
let cachedPosts: Post[] | null = null;
let lastLoadTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

export default function CommunityTab() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<'dating' | 'chat'>('dating');
  const [posts, setPosts] = useState<Post[]>(cachedPosts || []);
  const [newPost, setNewPost] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(!cachedPosts);
  const [currentUser, setCurrentUser] = useState<any>(undefined); // undefined = 아직 확인 안됨, null = 로그인 안됨
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isLoadingRef = useRef(false); // 중복 로드 방지

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        // 먼저 로컬 스토리지의 auth_user 확인 (커스텀 인증 시스템)
        const authUser = localStorage.getItem('auth_user');
        if (authUser) {
          try {
            const parsedUser = JSON.parse(authUser);
            setCurrentUser(parsedUser);
            console.log('auth_user 사용자:', parsedUser);
            return;
          } catch (err) {
            console.error('auth_user 파싱 실패:', err);
          }
        }

        // Supabase 인증 사용자 확인 (폴백)
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
          // 로그인 안됨
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('사용자 정보 조회 실패:', err);
        setCurrentUser(null);
      }
    };
    getCurrentUser();
  }, []);

  // 게시글 불러오기 - 캐시가 없거나 만료된 경우에만 실행
  useEffect(() => {
    const now = Date.now();
    const cacheValid = cachedPosts && (now - lastLoadTime < CACHE_DURATION);
    
    if (cacheValid) {
      // 캐시된 데이터 사용
      setPosts(cachedPosts!);
      setIsLoading(false);
    } else if (!isLoadingRef.current) {
      // 캐시가 없거나 만료됨 - 새로 로드
      loadPosts();
    }
  }, []);

  const loadPosts = async () => {
    if (isLoadingRef.current) return; // 이미 로딩 중이면 중복 호출 방지
    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      // 타임아웃 설정 (5초)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      // 먼저 게시글만 가져오기
      const fetchPromise = supabase
        .from('community_posts')
        .select(`
          *,
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

        // 게시글 작성자 ID 목록 수집
        const userIds = [...new Set(data.map((post: any) => post.user_id).filter(Boolean))];
        
        // 작성자 정보 일괄 조회
        let usersMap: { [key: string]: any } = {};
        if (userIds.length > 0) {
          const { data: usersData } = await supabase
            .from('users')
            .select('id, name, avatar_url, profile_image, age, location, gender, bio, school, job')
            .in('id', userIds);
          
          if (usersData) {
            usersData.forEach((user: any) => {
              usersMap[user.id] = user;
            });
          }
        }

        const formattedPosts: Post[] = data.map((post: any) => {
          // users 테이블에서 가져온 정보 또는 게시글에 저장된 정보 사용
          const author = usersMap[post.user_id];
          const authorName = author?.name || post.author_name || '익명';
          const authorAvatar = author?.avatar_url || author?.profile_image || post.avatar_url || 'https://via.placeholder.com/100';
          
          return {
            id: post.id,
            author: authorName,
            avatar: authorAvatar,
            content: post.content,
            image: post.image_url,
            likes: post.likes,
            comments: post.post_comments?.map((comment: any) => ({
              id: comment.id,
              author: comment.author_name,
              avatar: comment.avatar_url || 'https://via.placeholder.com/100',
              content: comment.content,
              timeAgo: getTimeAgo(comment.created_at),
              likes: comment.likes,
              isLiked: false
            })) || [],
            timeAgo: getTimeAgo(post.created_at),
            isLiked: userLikes.includes(post.id),
            age: author?.age || post.age,
            location: author?.location || post.location,
            job: author?.job || post.job,
            views: post.views,
            category: post.category,
            userId: post.user_id,
            authorData: author ? {
              id: author.id,
              name: author.name || '익명',
              avatar_url: author.avatar_url || author.profile_image,
              age: author.age,
              location: author.location,
              gender: author.gender,
              bio: author.bio,
              school: author.school,
              job: author.job
            } : {
              id: post.user_id,
              name: post.author_name || '익명',
              avatar_url: post.avatar_url,
              age: post.age,
              location: post.location,
              gender: post.gender,
              bio: post.bio,
              school: post.school,
              job: post.job
            }
          };
        });
        
        // 캐시에 저장
        cachedPosts = formattedPosts;
        lastLoadTime = Date.now();
        
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
      isLoadingRef.current = false;
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
    // 로그인 체크
    const authUser = localStorage.getItem('auth_user');
    if (!authUser) {
      setShowLoginModal(true);
      return;
    }

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold font-display text-slate-800 whitespace-nowrap">커뮤니티</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-full">
            <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              TODAY
            </span>
            <span className="text-primary-600 font-bold text-sm">30,301</span>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer group">
            <i className="ri-equalizer-line text-lg text-slate-400 group-hover:text-primary-500 transition-colors"></i>
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer group">
            <i className="ri-layout-grid-line text-lg text-slate-400 group-hover:text-primary-500 transition-colors"></i>
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
        <CommunityListSkeleton />
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary-100 transition-all duration-300"
              onClick={() => handleCommentClick(post)}
            >
              <div className="flex p-4">
                {/* 왼쪽: 프로필 사진 (원형 + 핑크 테두리) */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-pink-400 to-pink-500">
                    <img
                      src={post.avatar}
                      alt={post.author}
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/100';
                      }}
                    />
                  </div>
                </div>

                {/* 중간: 콘텐츠 */}
                <div className="flex-1 ml-3 min-w-0">
                  {/* 제목 (게시글 내용 첫 줄) */}
                  <h3 className="text-[15px] font-bold text-slate-800 line-clamp-1 mb-1">
                    {post.content.split('\n')[0]}
                  </h3>
                  
                  {/* 작성자 정보 */}
                  <p className="text-sm text-slate-500 mb-2">
                    {post.author} ({post.location || '위치 미설정'} / {post.age || '?'}세 / {post.job || '직업 미설정'})
                  </p>
                  
                  {/* 조회수, 댓글, 시간 */}
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <div className="flex items-center space-x-1">
                      <i className="ri-eye-line"></i>
                      <span>{post.views || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <i className="ri-chat-3-line"></i>
                      <span>{post.comments.length}</span>
                    </div>
                    <span>|</span>
                    <span>{post.timeAgo}</span>
                  </div>
                </div>

                {/* 오른쪽: 게시물 이미지 (있을 때만 표시) */}
                {post.image && (
                  <div className="flex-shrink-0 ml-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden">
                      <img
                        src={post.image}
                        alt="게시물 이미지"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
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

      {/* 로그인 필요 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowLoginModal(false)}></div>
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-lock-line text-3xl text-primary-500"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">로그인이 필요합니다</h3>
            <p className="text-slate-500 text-sm mb-6">게시글을 보려면 로그인해주세요</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-2xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all"
            >
              로그인하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
