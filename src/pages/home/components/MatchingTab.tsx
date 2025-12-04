import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { MatchingGridSkeleton } from '../../../components/base/Skeleton';
import LazyImage from '../../../components/base/LazyImage';

interface Profile {
  id: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  school: string;
  mbti: string;
  character: string;
  bio: string;
  photos?: string[];
  hasLikedMe?: boolean;
  isMatched?: boolean;
}

// 전역 캐시 - 컴포넌트 외부에 선언하여 리렌더링에도 유지
let cachedProfiles: { male: Profile[], female: Profile[] } = { male: [], female: [] };
let lastLoadTime: { male: number, female: number } = { male: 0, female: 0 };
const CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

export default function MatchingTab() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [selectedGender, setSelectedGender] = useState<string>(''); // 초기값을 빈 문자열로
  const [showFilter, setShowFilter] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PROFILES_PER_PAGE = 20;
  const isLoadingRef = useRef(false); // 중복 로드 방지

  // 컴포넌트 마운트 시 로그인 사용자 성별에 따라 반대 성별로 초기화
  useEffect(() => {
    const loadCurrentUserInfo = async () => {
      if (authUser?.id) {
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('gender')
            .eq('id', authUser.id)
            .single();

          if (userData?.gender) {
            // 내 성별의 반대 성별을 보여줌
            if (userData.gender === 'male') {
              setSelectedGender('female');
            } else if (userData.gender === 'female') {
              setSelectedGender('male');
            }
          }
        } catch (error) {
          console.error('사용자 정보 로드 실패:', error);
        }
      }
    };
    loadCurrentUserInfo();
  }, [authUser?.id]);

  // 마운트 시 데이터 로드 (캐시 확인)
  useEffect(() => {
    if (!selectedGender) return;
    
    const genderKey = selectedGender as 'male' | 'female';
    const now = Date.now();
    const cacheValid = cachedProfiles[genderKey].length > 0 && 
                       (now - lastLoadTime[genderKey] < CACHE_DURATION);
    
    if (cacheValid) {
      // 캐시된 데이터 사용
      setProfiles(cachedProfiles[genderKey]);
      setIsLoading(false);
    } else if (!isLoadingRef.current) {
      // 캐시가 없거나 만료됨 - 새로 로드
      loadProfiles();
    }
  }, [selectedGender]);

  const loadProfiles = async (loadMore = false) => {
    if (!selectedGender) return;
    if (isLoadingRef.current && !loadMore) return; // 이미 로딩 중이면 중복 호출 방지
    
    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const currentPage = loadMore ? page + 1 : 0;

      // 성별 필터링
      let query = supabase
        .from('users')
        .select('id, name, age, gender, location, school, mbti, bio, avatar_url, profile_image', { count: 'exact' });

      // 로그인한 경우에만 내 프로필 제외
      if (authUser?.id) {
        query = query.neq('id', authUser.id);
      }

      // 성별이 선택된 경우에만 필터링 (성별 미입력 사용자 제외)
      if (selectedGender) {
        query = query.eq('gender', selectedGender);
      } else {
        // selectedGender가 비어있으면 특정 성별로 필터링하지 않음
        // 하지만 보통 초기 선택 후 로드되므로, 이 경우는 로딩 중
        return;
      }

      // Pagination 적용
      query = query
        .range(currentPage * PROFILES_PER_PAGE, (currentPage + 1) * PROFILES_PER_PAGE - 1)
        .order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      console.log('📊 전체 사용자 데이터:', data);
      console.log('📊 선택된 성별:', selectedGender);

      if (data) {
        // DB 데이터를 Profile 인터페이스에 맞게 변환
        // avatar_url 또는 profile_image가 있는 프로필만 표시
        const formattedProfiles: Profile[] = data
          .filter((user: any) => {
            // avatar_url 또는 profile_image 중 하나라도 있으면 됨
            const hasAvatar = user.avatar_url || user.profile_image;
            console.log(`👤 ${user.name} - 성별: ${user.gender}, 사진: ${hasAvatar ? '있음' : '없음'}`, { avatar_url: user.avatar_url, profile_image: user.profile_image });
            return !!hasAvatar;
          })
          .map((user: any) => {
            const avatarUrl = user.avatar_url || user.profile_image || '';
            return {
              id: user.id,
              name: user.name || '알 수 없음',
              age: user.age || 20,
              gender: user.gender || '무관',
              location: user.location || '위치 미설정',
              school: user.school || '학교 미설정',
              mbti: user.mbti || 'MBTI',
              character: avatarUrl,
              bio: user.bio || '자기소개가 없습니다.',
              hasLikedMe: false,
              photos: avatarUrl ? [avatarUrl] : [] // photos 배열 추가
            };
          });

        console.log('✅ 필터링된 프로필 수:', formattedProfiles.length);

        if (loadMore) {
          setProfiles(prev => [...prev, ...formattedProfiles]);
        } else {
          setProfiles(formattedProfiles);
          // 캐시에 저장
          if (selectedGender === 'male' || selectedGender === 'female') {
            cachedProfiles[selectedGender] = formattedProfiles;
            lastLoadTime[selectedGender] = Date.now();
          }
        }

        setPage(currentPage);
        setHasMore(count ? (currentPage + 1) * PROFILES_PER_PAGE < count : false);
      }
    } catch (error) {
      console.error('프로필 로드 실패:', error);
      if (!loadMore) {
        setProfiles([]);
      }
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  };

  const filteredProfiles = useMemo(
    () => profiles.filter(profile => profile.gender === selectedGender),
    [profiles, selectedGender]
  );

  const handleLocationClick = (location: string) => {
    setSelectedLocation(location);
    setShowLocationModal(true);
  };

  const handleProfileClick = (profile: Profile) => {
    navigate('/profile-detail', { state: { profile } });
  };

  // 로딩 상태 - 스켈레톤 UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-4">
        <div className="flex items-center justify-between mb-4 px-3">
          <div className="h-7 w-16 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse"></div>
        </div>
        <MatchingGridSkeleton />
      </div>
    );
  }

  // 데이터 없음
  if (filteredProfiles.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4 px-4">
        <i className="ri-search-line text-6xl text-slate-300"></i>
        <p className="text-center text-slate-600 font-medium">조건에 맞는 프로필이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">매칭</h2>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:shadow-lg transition-all hover:scale-105 group"
          >
            <i className="ri-filter-line text-slate-400 group-hover:text-primary-500 text-lg transition-colors"></i>
          </button>
        </div>
      </div>

      {/* 포스트잇 그리드 */}
      <div className="grid grid-cols-2 gap-3">
        {filteredProfiles.map((profile) => (
          <div
            key={profile.id}
            onClick={() => handleProfileClick(profile)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 relative group transform hover:-translate-y-1"
          >
            {/* 상호 좋아요 표시 */}
            {profile.hasLikedMe && (
              <div className="absolute top-3 right-3 w-7 h-7 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center z-10 shadow-lg shadow-pink-500/30 animate-pulse-soft">
                <i className="ri-heart-fill text-white text-xs"></i>
              </div>
            )}

            {/* 상단 태그 - 성별 + MBTI 함께 */}
            <div className="absolute top-3 left-3 z-10 flex items-center space-x-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md ${
                profile.gender === 'female' 
                  ? 'bg-gradient-to-br from-pink-400 to-pink-500' 
                  : 'bg-gradient-to-br from-blue-400 to-blue-500'
              }`}>
                <i className={`text-xs text-white ${profile.gender === 'female' ? 'ri-women-line' : 'ri-men-line'}`}></i>
              </div>
              <span className="bg-white/95 text-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md">
                {profile.mbti || 'MBTI'}
              </span>
            </div>

            {/* 캐릭터 이미지 - LazyImage 사용 */}
            <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
              <LazyImage
                src={profile.character}
                alt={profile.name}
                className="w-full h-full"
              />

              {/* 그라데이션 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent opacity-80"></div>

              {/* 프로필 정보 */}
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <h3 className="font-bold text-base mb-0.5 truncate">{profile.name}</h3>
                <div className="flex items-center text-xs text-slate-200 space-x-1">
                  <span>{profile.age}세</span>
                  <span>·</span>
                  <span className="truncate">{profile.location}</span>
                </div>
                <div className="flex items-center text-[10px] mt-1.5 text-slate-300 bg-white/10 rounded px-1.5 py-0.5 w-fit backdrop-blur-sm">
                  <i className="ri-school-line mr-1"></i>
                  <span className="truncate max-w-[80px]">{profile.school}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 더보기 버튼 */}
      <div className="mt-10 text-center pb-8">
        <button onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} className="bg-white text-slate-600 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:text-primary-600 hover:scale-105 transition-all cursor-pointer whitespace-nowrap flex items-center mx-auto space-x-2">
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
                    onClick={() => setSelectedGender('female')}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all cursor-pointer border-2 ${selectedGender === 'female'
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                      }`}
                  >
                    여자
                  </button>
                  <button
                    onClick={() => setSelectedGender('male')}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all cursor-pointer border-2 ${selectedGender === 'male'
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
                onClick={() => {
                  setShowFilter(false);
                  loadProfiles();
                }}
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
