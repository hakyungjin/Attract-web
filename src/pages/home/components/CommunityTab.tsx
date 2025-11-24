import { useState, useEffect } from 'react';
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
  age?: number;
  location?: string;
  job?: string;
  views?: number;
  category: 'dating' | 'chat';
}

import PostDetailPage from './PostDetailPage';

export default function CommunityTab() {
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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        // 사용자 프로필 정보 가져오기
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

  // 게시글 불러오기
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
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

      if (error) throw error;

      if (data) {
        const formattedPosts: Post[] = data.map((post: any) => ({
          id: post.id,
          author: post.title,
          avatar: post.avatar_url || 'https://readdy.ai/api/search-image?query=Korean%20person%20casual%20portrait%2C%20friendly%20expression%2C%20natural%20lighting%2C%20clean%20background%2C%20high%20quality%2C%20realistic&width=400&height=500&seq=default&orientation=portrait',
          content: post.content,
          image: post.image_url,
          likes: post.likes,
          comments: post.post_comments.map((comment: any) => ({
            id: comment.id,
            author: comment.author_name,
            avatar: comment.avatar_url || 'https://readdy.ai/api/search-image?query=Korean%20person%20casual%20portrait%2C%20friendly%20expression%2C%20natural%20lighting%2C%20clean%20background%2C%20high%20quality%2C%20realistic&width=100&height=100&seq=default&orientation=squarish',
            content: comment.content,
            timeAgo: getTimeAgo(comment.created_at),
            likes: comment.likes,
            isLiked: false
          })),
          timeAgo: getTimeAgo(post.created_at),
          isLiked: false,
          age: post.age,
          location: post.location,
          job: post.job,
          views: post.views,
          category: post.category
        }));
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('게시글 불러오기 오류:', error);
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

  const filteredPosts = posts.filter(post => post.category === selectedCategory);

  const handleLike = async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newLikes = post.isLiked ? post.likes - 1 : post.likes + 1;

    // 로컬 상태 업데이트
    setPosts(posts.map(p => 
      p.id === postId 
        ? { 
            ...p, 
            isLiked: !p.isLiked,
            likes: newLikes
          }
        : p
    ));

    // DB 업데이트
    try {
      await supabase
        .from('community_posts')
        .update({ likes: newLikes })
        .eq('id', postId);
    } catch (error) {
      console.error('좋아요 업데이트 오류:', error);
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
      />
    );
  }

  return (
    <div className="px-4 py-4 pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-gray-900">커뮤니티</h2>
          <div className="bg-cyan-500 text-white text-xs font-bold px-2 py-1 rounded">
            TODAY
          </div>
          <span className="text-cyan-500 font-bold">30,301</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <i className="ri-equalizer-line text-xl text-gray-600"></i>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <i className="ri-layout-grid-line text-xl text-gray-600"></i>
          </button>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex space-x-2 mb-4">
        <button 
          onClick={() => setSelectedCategory('dating')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
            selectedCategory === 'dating' ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          셀프소개팅
        </button>
        <button 
          onClick={() => setSelectedCategory('chat')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
            selectedCategory === 'chat' ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          잡담
        </button>
      </div>

      {/* 정렬 탭 */}
      <div className="flex space-x-2 mb-4">
        <button className="px-4 py-2 bg-cyan-500 text-white rounded-full text-sm font-medium whitespace-nowrap cursor-pointer">
          추천
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer hover:bg-gray-200 transition-colors">
          최신
        </button>
      </div>

      {/* 게시글 목록 */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <i className="ri-loader-4-line text-4xl text-cyan-500 animate-spin"></i>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div 
              key={post.id} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCommentClick(post)}
            >
              <div className="flex">
                {/* 왼쪽 이미지 */}
                <div className="w-32 h-40 flex-shrink-0">
                  <img
                    src={post.image}
                    alt={post.author}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* 오른쪽 콘텐츠 */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  {/* 제목 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                      {post.author}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">{post.content}</p>
                  </div>

                  {/* 하단 정보 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-eye-line"></i>
                        </div>
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-chat-3-line"></i>
                        </div>
                        <span>{post.comments.length}</span>
                      </div>
                      <span>|</span>
                      <span>{post.timeAgo}</span>
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
        onClick={() => setShowNewPost(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer z-10"
      >
        <i className="ri-add-line text-2xl"></i>
      </button>

      {/* 새 글 작성 모달 */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">새 글 작성</h3>
              <button
                onClick={() => setShowNewPost(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="무슨 일이 일어나고 있나요?"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm resize-none bg-gray-50"
              rows={5}
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-gray-400">{newPost.length}/500</span>
              <button
                onClick={handleCreatePost}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer whitespace-nowrap text-sm font-medium"
              >
                게시
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
