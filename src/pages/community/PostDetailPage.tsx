import { useNavigate } from 'react-router-dom';

export default function PostDetailPage() {
  const navigate = useNavigate();

  // 더미 데이터 (실제 데이터 연동 시 props/state로 대체)
  const post = {
    profileImg: 'https://randomuser.me/api/portraits/women/44.jpg',
    nickname: '서울에서 새로운 인연 찾아요 💕',
    time: '30분 전',
    info: '김지은 (강남구 / 28세 / IT기업 디자이너)',
    mainImg: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=600&h=600&q=80',
    likes: 156,
    comments: 0,
    myProfile: 'https://randomuser.me/api/portraits/women/47.jpg',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 네비게이션 */}
      <header className="bg-white border-b flex items-center px-4 py-3">
        <button onClick={() => navigate(-1)} className="mr-2">
          <i className="ri-arrow-left-s-line text-2xl"></i>
        </button>
        <span className="font-bold text-lg">게시글</span>
      </header>

      {/* 게시글 정보 */}
      <section className="bg-white px-4 py-3 flex items-center">
        <img src={post.profileImg} className="w-10 h-10 rounded-full mr-3" alt="프로필" />
        <div className="flex-1">
          <div className="font-bold">{post.nickname}</div>
          <div className="text-xs text-gray-400">{post.time}</div>
          <div className="text-sm text-gray-700 mt-1">{post.info}</div>
        </div>
      </section>

      {/* 메인 이미지 */}
      <div className="w-full aspect-square bg-gray-100">
        <img src={post.mainImg} className="w-full h-full object-cover" alt="게시글 이미지" />
      </div>

      {/* 좋아요/댓글 */}
      <div className="flex items-center px-4 py-2 bg-white border-b">
        <div className="flex items-center mr-4">
          <i className="ri-heart-line text-lg mr-1"></i>
          <span className="text-sm">{post.likes}</span>
        </div>
        <div className="flex items-center">
          <i className="ri-chat-3-line text-lg mr-1"></i>
          <span className="text-sm">댓글</span>
        </div>
      </div>

      {/* 댓글 영역 */}
      <div className="flex-1 bg-white px-4 py-6">
        <div className="text-sm font-bold mb-2">댓글 0</div>
        <div className="flex flex-col items-center justify-center h-32 text-gray-400">
          <i className="ri-chat-3-line text-3xl mb-2"></i>
          <span>첫 번째 댓글을 남겨보세요!</span>
        </div>
      </div>

      {/* 댓글 입력창 */}
      <div className="border-t bg-white px-4 py-3 flex items-center">
        <img src={post.myProfile} className="w-8 h-8 rounded-full mr-2" alt="내 프로필" />
        <input className="flex-1 border rounded-full px-4 py-2 text-sm" placeholder="댓글을 입력하세요..." />
        <button className="ml-2 text-cyan-500">
          <i className="ri-arrow-right-up-line text-2xl"></i>
        </button>
      </div>

      {/* 하단 탭바 (예시) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2">
        <button className="flex flex-col items-center text-gray-400">
          <i className="ri-heart-3-line text-xl"></i>
          <span className="text-xs">매칭</span>
        </button>
        <button className="flex flex-col items-center text-pink-500">
          <i className="ri-group-line text-xl"></i>
          <span className="text-xs">커뮤니티</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <i className="ri-chat-3-line text-xl"></i>
          <span className="text-xs">채팅</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <i className="ri-user-3-line text-xl"></i>
          <span className="text-xs">My페이지</span>
        </button>
      </nav>
    </div>
  );
}
