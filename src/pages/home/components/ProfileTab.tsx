import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 기본 프로필 이미지 헬퍼 함수
const getDefaultAvatar = (gender?: string) => {
  if (gender === '남자') {
    return 'https://readdy.ai/api/search-image?query=minimalist%20male%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=male-default-avatar&orientation=squarish';
  }
  return 'https://readdy.ai/api/search-image?query=minimalist%20female%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=female-default-avatar&orientation=squarish';
};

export default function ProfileTab() {
  const navigate = useNavigate();
  const [profile] = useState({
    name: '김민지',
    age: 24,
    gender: '여자',
    location: '서울 강남구',
    avatar: '',
    bio: '음악과 여행을 좋아하는 긍정적인 사람입니다. 함께 즐거운 시간을 보낼 수 있는 분을 찾고 있어요!',
    interests: ['음악', '여행', '카페', '영화', '운동']
  });

  const handleEditProfile = () => {
    navigate('/profile-edit');
  };

  const handleMatchingRequests = () => {
    navigate('/matching-requests');
  };

  return (
    <div className="px-4 py-6 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto">
        {/* 프로필 카드 */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
          <div className="text-center">
            {/* 프로필 사진 */}
            <div className="relative inline-block mb-4">
              <img
                src={profile.avatar || getDefaultAvatar(profile.gender)}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getDefaultAvatar(profile.gender);
                }}
              />
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors cursor-pointer">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-camera-line"></i>
                </div>
              </button>
            </div>

            {/* 기본 정보 */}
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{profile.name}</h2>
            <p className="text-gray-600 mb-4">{profile.age}세 · {profile.location}</p>

            {/* 프로필 수정 버튼 */}
            <button
              onClick={handleEditProfile}
              className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              프로필 수정하기
            </button>
          </div>
        </div>

        {/* 매칭 관리 카드 */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <div className="w-5 h-5 flex items-center justify-center mr-2">
                <i className="ri-heart-fill text-cyan-500"></i>
              </div>
              매칭 현황
            </h3>
            <button
              onClick={handleMatchingRequests}
              className="text-cyan-500 text-sm font-medium hover:text-cyan-600 cursor-pointer whitespace-nowrap"
            >
              전체보기
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-cyan-500 mb-1">3</div>
              <div className="text-xs text-gray-600">받은 요청</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">2</div>
              <div className="text-xs text-gray-600">보낸 요청</div>
            </div>
          </div>

          <button
            onClick={handleMatchingRequests}
            className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-full font-medium hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center"
          >
            <div className="w-5 h-5 flex items-center justify-center mr-2">
              <i className="ri-heart-line"></i>
            </div>
            매칭 관리하기
          </button>
        </div>

        {/* 자기소개 */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <div className="w-5 h-5 flex items-center justify-center mr-2">
              <i className="ri-user-smile-line"></i>
            </div>
            자기소개
          </h3>
          <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
        </div>

        {/* 관심사 */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <div className="w-5 h-5 flex items-center justify-center mr-2">
              <i className="ri-heart-line"></i>
            </div>
            관심사
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* 메뉴 */}
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-settings-3-line text-blue-600"></i>
                  </div>
                </div>
                <span className="font-medium text-gray-800">설정</span>
              </div>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-arrow-right-s-line text-gray-400"></i>
              </div>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-shield-check-line text-green-600"></i>
                  </div>
                </div>
                <span className="font-medium text-gray-800">개인정보 보호</span>
              </div>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-arrow-right-s-line text-gray-400"></i>
              </div>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-question-line text-purple-600"></i>
                  </div>
                </div>
                <span className="font-medium text-gray-800">고객센터</span>
              </div>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-arrow-right-s-line text-gray-400"></i>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
