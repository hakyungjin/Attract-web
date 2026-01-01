import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebase } from '../../../lib/firebaseService';
import { CommunityListSkeleton } from '../../../components/base/Skeleton';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timeAgo: string;
  likes: number;
  isLiked: boolean;
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  commentsCount?: number;
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
  const [sortOrder, setSortOrder] = useState<'latest' | 'views'>('latest'); // 최신순/조회순
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
            
            // Firebase에서 최신 정보 가져오기
            const { user: userData } = await firebase.users.getUserById(parsedUser.id);
            if (userData) {
              setCurrentUser(userData);
              console.log('Firebase 사용자:', userData);
            } else {
              setCurrentUser(parsedUser);
            }
            return;
          } catch (err) {
            console.error('auth_user 파싱 실패:', err);
          }
        }
        
        setCurrentUser(null);
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
      // Firebase에서 게시글 가져오기
      const { posts: data, error } = await firebase.posts.getPosts(50);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // 게시글 작성자 ID 목록 수집
        const userIds = [...new Set(data.map((post: any) => post.user_id).filter(Boolean))];
        
        // 작성자 정보 일괄 조회
        let usersMap: { [key: string]: any } = {};
        if (userIds.length > 0) {
          await Promise.all(userIds.map(async (userId) => {
            const { user } = await firebase.users.getUserById(userId);
            if (user) {
              usersMap[userId] = user;
            }
          }));
        }

        const formattedPosts: Post[] = await Promise.all(data.map(async (post: any) => {
          // users 테이블에서 가져온 정보 또는 게시글에 저장된 정보 사용
          const author = usersMap[post.user_id];
          const authorName = author?.name || post.author_name || '익명';
          const authorAvatar = author?.profile_image || author?.avatar_url || post.avatar_url || 'https://via.placeholder.com/100';
          
          return {
            id: post.id,
            author: authorName,
            avatar: authorAvatar,
            content: post.content,
            image: post.image_url || (post.images && post.images[0]),
            likes: post.likes || 0,
            comments: [], // 목록에서는 댓글을 미리 가져오지 않음 (성능 최적화)
            commentsCount: post.comments_count || 0,
            timeAgo: getTimeAgo(post.created_at?.toDate?.()?.toISOString() || post.created_at || new Date().toISOString()),
            isLiked: false,
            age: author?.age || post.age,
            location: author?.location || post.location,
            job: author?.school || author?.job || post.job,
            views: post.views || 0,
            category: (post.category as 'dating' | 'chat') || 'dating',
            userId: post.user_id,
            authorData: author
          };
        }));

        setPosts(formattedPosts);
        cachedPosts = formattedPosts;
        lastLoadTime = Date.now();
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('게시글 로드 실패:', error);
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


  const handleCommentClick = async (post: Post) => {
    // 로그인 체크
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }

    // 조회수 증가
    try {
      await firebase.posts.incrementViews(post.id);

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
        author_name: currentUser.name || '익명',
        avatar_url: currentUser.profile_image || currentUser.avatar_url || '',
        content: newPost,
        likes: 0,
        views: 0,
        category: selectedCategory,
        age: currentUser.age,
        location: currentUser.location,
        job: currentUser.school || currentUser.job
      };

      const { post: data, error } = await firebase.posts.createPost(currentUser.id, postData);

      if (error) throw error;

      if (data) {
        const newPostObj: Post = {
          id: data.id,
          author: data.author_name || '익명',
          avatar: data.avatar_url || '',
          content: data.content || '',
          image: data.image_url,
          likes: 0,
          comments: [],
          timeAgo: '방금 전',
          isLiked: false,
          age: data.age,
          location: data.location,
          job: data.job,
          views: 0,
          category: (data.category as 'dating' | 'chat') || 'dating'
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

  // 정렬된 게시글
  const sortedPosts = useMemo(() => {
    const categoryPosts = posts.filter(p => p.category === selectedCategory);

    if (sortOrder === 'latest') {
      return categoryPosts; // 이미 최신순으로 정렬되어 있음
    } else {
      return [...categoryPosts].sort((a, b) => (b.views || 0) - (a.views || 0));
    }
  }, [posts, selectedCategory, sortOrder]);

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
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setSortOrder('latest')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              sortOrder === 'latest'
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            최신순
          </button>
          <button
            onClick={() => setSortOrder('views')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              sortOrder === 'views'
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            조회순
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
          {sortedPosts.map((post) => (
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
                      <span>{post.commentsCount || 0}</span>
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
