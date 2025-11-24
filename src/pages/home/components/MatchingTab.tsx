import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: number;
  name: string;
  age: number;
  gender: string;
  location: string;
  school: string;
  mbti: string;
  character: string;
  bio: string;
  hasLikedMe?: boolean;
  isMatched?: boolean;
}

// 기본 프로필 이미지 헬퍼 함수
const getDefaultAvatar = (gender: string) => {
  if (gender === '남자') {
    return 'https://readdy.ai/api/search-image?query=minimalist%20male%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=male-default-avatar&orientation=squarish';
  }
  return 'https://readdy.ai/api/search-image?query=minimalist%20female%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=female-default-avatar&orientation=squarish';
};

export default function MatchingTab() {
  const navigate = useNavigate();
  const [selectedGender, setSelectedGender] = useState('여자');
  const [showFilter, setShowFilter] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  
  const profiles: Profile[] = [
    {
      id: 1,
      name: '하얀눈방울e',
      age: 22,
      gender: '여자',
      location: '서울 금천구',
      school: '서울디지털대학교',
      mbti: 'ISFP',
      character: '',
      bio: '음악을 좋아하는 조용한 성격이에요',
      hasLikedMe: true
    },
    {
      id: 2,
      name: '나만의아기고양이',
      age: 20,
      gender: '여자',
      location: '대전 중구',
      school: '한밭대학교',
      mbti: 'ISTP',
      character: '',
      bio: '빵 만들기를 좋아해요'
    },
    {
      id: 3,
      name: '눈망울e',
      age: 22,
      gender: '여자',
      location: '부산 동구',
      school: '부산디지털대학교',
      mbti: 'ISFP',
      character: '',
      bio: '헤드폰으로 음악 듣는 걸 좋아해요'
    },
    {
      id: 4,
      name: '세잎이',
      age: 19,
      gender: '여자',
      location: '충남 아산시',
      school: '선문대학교',
      mbti: 'ESTP',
      character: '',
      bio: '컴퓨터 작업하는 걸 좋아해요'
    },
    {
      id: 5,
      name: '띠로리이',
      age: 27,
      gender: '여자',
      location: '서울 금천구',
      school: '서울대학교',
      mbti: 'ESTJ',
      character: '',
      bio: '베이킹을 좋아하는 활발한 성격이에요'
    },
    {
      id: 6,
      name: '으아니',
      age: 19,
      gender: '여자',
      location: '서울 광진구',
      school: '세종대학교',
      mbti: 'ISTJ',
      character: '',
      bio: '고양이를 좋아해요'
    },
    {
      id: 7,
      name: '달콤소소찡',
      age: 23,
      gender: '여자',
      location: '전북 전주시',
      school: '예원예술대학교',
      mbti: 'ENTP',
      character: '',
      bio: '예술을 사랑하는 자유로운 영혼이에요'
    },
    {
      id: 8,
      name: '어피치',
      age: 24,
      gender: '여자',
      location: '서울 강남구',
      school: '한양대학교',
      mbti: 'ESTP',
      character: '',
      bio: '탁구치는 걸 좋아해요'
    }
  ];

  const filteredProfiles = profiles.filter(profile => profile.gender === selectedGender);

  const handleLocationClick = (location: string) => {
    setSelectedLocation(location);
    setShowLocationModal(true);
  };

  const handleProfileClick = (profile: Profile) => {
    navigate('/profile-detail', { state: { profile } });
  };

  return (
    <div className="px-4 py-6 bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSelectedGender('소개팅')}
            className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap cursor-pointer ${
              selectedGender === '소개팅' ? 'bg-cyan-500 text-white' : 'bg-white text-gray-600'
            }`}
          >
            소개팅
          </button>
          <button 
            onClick={() => setSelectedGender('미팅')}
            className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap cursor-pointer ${
              selectedGender === '미팅' ? 'bg-cyan-500 text-white' : 'bg-white text-gray-600'
            }`}
          >
            미팅
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-filter-line text-gray-600"></i>
            </div>
          </button>
        </div>
      </div>

      {/* 포스트잇 그리드 */}
      <div className="grid grid-cols-2 gap-4">
        {filteredProfiles.map((profile) => (
          <div 
            key={profile.id} 
            onClick={() => handleProfileClick(profile)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow relative"
          >
            {/* 상호 좋아요 표시 */}
            {profile.hasLikedMe && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center z-10 shadow-lg backdrop-blur-sm">
                <i className="ri-heart-fill text-white text-sm"></i>
              </div>
            )}
            
            {/* 성별 아이콘 - 상단 왼쪽으로 이동 */}
            <div className="absolute top-3 left-3 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center z-10 shadow-md backdrop-blur-sm">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-women-line text-cyan-500"></i>
              </div>
            </div>

            {/* MBTI 태그 - 상단 중앙으로 이동 */}
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10">
              <span className="bg-white/90 text-blue-700 px-2 py-1 rounded-full text-xs font-medium shadow-md backdrop-blur-sm">
                {profile.mbti}
              </span>
            </div>
            
            {/* 캐릭터 이미지 - 카드 전체를 채우도록 */}
            <div className="relative h-64 overflow-hidden">
              <img 
                src={getDefaultAvatar(profile.gender)} 
                alt={profile.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
              
              {/* 어두운 오버레이 추가 */}
              <div className="absolute inset-0 bg-black/10"></div>
              
              {/* 하단 그라데이션 오버레이 - 더 진하게 */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
              
              {/* 프로필 정보 - 하단에 오버레이 */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-bold text-lg mb-1 drop-shadow-lg">{profile.name}</h3>
                <div className="flex items-center justify-between text-sm drop-shadow-md">
                  <span>{profile.age}세</span>
                  <div 
                    className="flex items-center hover:text-cyan-300 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLocationClick(profile.location);
                    }}
                  >
                    <div className="w-3 h-3 flex items-center justify-center mr-1">
                      <i className="ri-map-pin-line"></i>
                    </div>
                    <span>{profile.location}</span>
                  </div>
                </div>
                <div className="flex items-center text-xs mt-1 opacity-90 drop-shadow-md">
                  <div className="w-3 h-3 flex items-center justify-center mr-1">
                    <i className="ri-school-line"></i>
                  </div>
                  <span className="truncate">{profile.school}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 더보기 버튼 */}
      <div className="mt-8 text-center">
        <button className="bg-white text-gray-700 px-8 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-shadow cursor-pointer whitespace-nowrap">
          친구 더보기
        </button>
      </div>

      {/* 필터 팝업 */}
      {showFilter && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">필터</h3>
              <button 
                onClick={() => setShowFilter(false)}
                className="w-8 h-8 flex items-center justify-center cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">성별</h4>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setSelectedGender('여자')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      selectedGender === '여자' ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    여자
                  </button>
                  <button 
                    onClick={() => setSelectedGender('남자')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      selectedGender === '남자' ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    남자
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">지역</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['전체', '인천/서울', '경기/강원', '경상권', '충청권', '호남권'].map((region) => (
                    <button 
                      key={region}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-8">
              <button 
                onClick={() => setShowFilter(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-full font-medium cursor-pointer whitespace-nowrap"
              >
                닫기
              </button>
              <button 
                onClick={() => setShowFilter(false)}
                className="flex-1 py-3 bg-cyan-500 text-white rounded-full font-medium cursor-pointer whitespace-nowrap"
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 위치 지도 모달 */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">{selectedLocation}</h3>
              <button 
                onClick={() => setShowLocationModal(false)}
                className="w-8 h-8 flex items-center justify-center cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <div className="p-4">
              <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dO_X0Q&q=${encodeURIComponent(selectedLocation)}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${selectedLocation} 지도`}
                />
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-4 h-4 flex items-center justify-center mr-2">
                    <i className="ri-map-pin-line"></i>
                  </div>
                  <span>{selectedLocation}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-4 h-4 flex items-center justify-center mr-2">
                    <i className="ri-navigation-line"></i>
                  </div>
                  <span>길찾기로 이동</span>
                </div>
              </div>
              
              <button 
                onClick={() => setShowLocationModal(false)}
                className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer whitespace-nowrap"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
