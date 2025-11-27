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
    <div className="px-4 py-6 min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedGender('소개팅')}
            className={`px-6 py-2.5 rounded-full font-bold transition-all duration-300 whitespace-nowrap cursor-pointer shadow-sm ${selectedGender === '소개팅'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-primary-500/30 shadow-lg scale-105'
                : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
          >
            소개팅
          </button>
          <button
            onClick={() => setSelectedGender('미팅')}
            className={`px-6 py-2.5 rounded-full font-bold transition-all duration-300 whitespace-nowrap cursor-pointer shadow-sm ${selectedGender === '미팅'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-primary-500/30 shadow-lg scale-105'
                : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
          >
            미팅
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:shadow-lg transition-all hover:scale-105 group"
          >
            <i className="ri-filter-line text-slate-400 group-hover:text-primary-500 text-xl transition-colors"></i>
          </button>
        </div>
      </div>

      {/* 포스트잇 그리드 */}
      <div className="grid grid-cols-2 gap-4">
        {filteredProfiles.map((profile) => (
          <div
            key={profile.id}
            onClick={() => handleProfileClick(profile)}
            className="bg-white rounded-3xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 relative group transform hover:-translate-y-1"
          >
            {/* 상호 좋아요 표시 */}
            {profile.hasLikedMe && (
              <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center z-10 shadow-lg shadow-pink-500/30 animate-pulse-soft">
                <i className="ri-heart-fill text-white text-sm"></i>
              </div>
            )}

            {/* 성별 아이콘 */}
            <div className="absolute top-3 left-3 w-8 h-8 glass rounded-full flex items-center justify-center z-10">
              <i className="ri-women-line text-primary-500 font-bold"></i>
            </div>

            {/* MBTI 태그 */}
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10">
              <span className="glass text-primary-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                {profile.mbti}
              </span>
            </div>

            {/* 캐릭터 이미지 */}
            <div className="relative h-72 overflow-hidden bg-slate-100">
              <img
                src={getDefaultAvatar(profile.gender)}
                alt={profile.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* 그라데이션 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

              {/* 프로필 정보 */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="font-bold text-xl mb-1 font-display tracking-tight">{profile.name}</h3>
                <div className="flex items-center justify-between text-sm text-slate-200">
                  <span className="font-medium">{profile.age}세</span>
                  <div
                    className="flex items-center hover:text-primary-300 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLocationClick(profile.location);
                    }}
                  >
                    <i className="ri-map-pin-line mr-1"></i>
                    <span className="text-xs">{profile.location}</span>
                  </div>
                </div>
                <div className="flex items-center text-xs mt-2 text-slate-300 bg-white/10 rounded-lg px-2 py-1 w-fit backdrop-blur-sm">
                  <i className="ri-school-line mr-1"></i>
                  <span className="truncate max-w-[100px]">{profile.school}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 더보기 버튼 */}
      <div className="mt-10 text-center pb-8">
        <button className="bg-white text-slate-600 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:text-primary-600 hover:scale-105 transition-all cursor-pointer whitespace-nowrap flex items-center mx-auto space-x-2">
          <span>친구 더보기</span>
          <i className="ri-arrow-down-s-line"></i>
        </button>
      </div>

      {/* 필터 팝업 */}
      {showFilter && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end animate-fade-in">
          <div className="bg-white w-full rounded-t-[2rem] p-8 max-h-[85vh] overflow-y-auto animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold font-display text-slate-800">필터</h3>
              <button
                onClick={() => setShowFilter(false)}
                className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-slate-100 rounded-full transition-colors"
              >
                <i className="ri-close-line text-2xl text-slate-400"></i>
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="font-bold text-slate-800 mb-4 text-lg">성별</h4>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setSelectedGender('여자')}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all cursor-pointer border-2 ${selectedGender === '여자'
                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                      }`}
                  >
                    여자
                  </button>
                  <button
                    onClick={() => setSelectedGender('남자')}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all cursor-pointer border-2 ${selectedGender === '남자'
                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                      }`}
                  >
                    남자
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-4 text-lg">지역</h4>
                <div className="grid grid-cols-3 gap-3">
                  {['전체', '인천/서울', '경기/강원', '경상권', '충청권', '호남권'].map((region) => (
                    <button
                      key={region}
                      className="px-2 py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-medium hover:bg-primary-50 hover:text-primary-600 transition-colors cursor-pointer whitespace-nowrap border border-transparent hover:border-primary-200"
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-10">
              <button
                onClick={() => setShowFilter(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold cursor-pointer hover:bg-slate-200 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={() => setShowFilter(false)}
                className="flex-1 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-bold cursor-pointer shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all"
              >
                적용하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 위치 지도 모달 */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-xl font-bold font-display text-slate-800">{selectedLocation}</h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-slate-100 rounded-full transition-colors"
              >
                <i className="ri-close-line text-xl text-slate-400"></i>
              </button>
            </div>

            <div className="p-5">
              <div className="w-full h-64 bg-slate-100 rounded-2xl overflow-hidden shadow-inner">
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

              <div className="mt-5 space-y-3">
                <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <i className="ri-map-pin-line text-primary-500 text-lg mr-3"></i>
                  <span className="font-medium">{selectedLocation}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-3 rounded-xl cursor-pointer hover:bg-primary-50 hover:text-primary-700 transition-colors group">
                  <i className="ri-navigation-line text-primary-500 text-lg mr-3 group-hover:scale-110 transition-transform"></i>
                  <span className="font-medium">길찾기로 이동</span>
                </div>
              </div>

              <button
                onClick={() => setShowLocationModal(false)}
                className="w-full mt-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-2xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all cursor-pointer shadow-lg shadow-primary-500/30"
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
