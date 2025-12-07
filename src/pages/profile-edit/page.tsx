import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getDefaultAvatar } from '../../utils/avatarUtils';
import { MBTI_TYPES } from '../../constants/mbti';
import { KOREA_LOCATIONS, getSigunguList } from '../../constants/locations';
import { searchSchools } from '../../constants/schools';
import { logger } from '../../utils/logger';
import { INTEREST_CATEGORIES, INTEREST_CATEGORY_NAMES, INTEREST_CATEGORY_ICONS, POPULAR_INTERESTS } from '../../constants/interests';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [formData, setFormData] = useState({
    nickname: '',
    name: '',
    age: 20,
    gender: '여자',
    location: '',
    bio: '',
    mbti: '',
    school: '',
    height: '160~165',
    bodyType: '보통',
    style: '캐주얼',
    religion: '무교',
    smoking: '비흡연',
    drinking: '가끔',
    interests: [] as string[],
    avatar: '',
    photos: [] as string[] // 여러 장 사진
  });

  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const MAX_PHOTOS = 6; // 최대 사진 수

  // 지역 선택 상태
  const [selectedSido, setSelectedSido] = useState('');
  
  // 학교 검색 상태
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [schoolSearchResults, setSchoolSearchResults] = useState<string[]>([]);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!authUser?.id) {
        logger.info('사용자 정보 없음');
        setLoading(false);
        return;
      }

      try {
        // Supabase에서 최신 사용자 데이터 로드
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (error) {
          logger.error('사용자 데이터 로드 실패:', error);
          setLoading(false);
          return;
        }

        if (userData) {
          // 기존 프로필 데이터로 폼 초기화
          const profileImage = userData.profile_image || '';
          setUploadedImageUrl(''); // 초기화
          setFormData({
            nickname: userData.name || '',
            name: userData.name || '',
            age: userData.age || 20,
            gender: userData.gender === 'female' ? '여자' : '남자',
            location: userData.location || '',
            bio: userData.bio || '',
            mbti: userData.mbti || '',
            school: userData.school || '',
            height: userData.height || '160~165',
            bodyType: userData.body_type || '보통',
            style: userData.style || '캐주얼',
            religion: userData.religion || '무교',
            smoking: userData.smoking || '비흡연',
            drinking: userData.drinking || '가끔',
            interests: userData.interests || [],
            avatar: profileImage,
            photos: userData.photos || (profileImage ? [profileImage] : [])
          });
        }
      } catch (error) {
        logger.error('프로필 로드 중 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [authUser?.id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 관심사 토글 (선택/해제)
  const handleToggleInterest = (interest: string) => {
    if (formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: prev.interests.filter(item => item !== interest)
      }));
    } else if (formData.interests.length < 10) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    } else {
      alert('관심사는 최대 10개까지 선택 가능합니다.');
    }
  };

  // 관심사 제거
  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(item => item !== interest)
    }));
  };

  const handleSave = async () => {
    if (!authUser?.id) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    setIsUploading(true);

    try {
      // 프로필 이미지 URL 결정 (base64는 제외, URL만 사용)
      let finalProfileImage = '';
      if (uploadedImageUrl) {
        // 새로 업로드된 이미지 URL 사용
        finalProfileImage = uploadedImageUrl;
      } else if (formData.avatar && !formData.avatar.startsWith('data:')) {
        // 기존 이미지 URL 유지 (base64가 아닌 경우만)
        finalProfileImage = formData.avatar;
      } else if (formData.photos.length > 0 && !formData.photos[0].startsWith('data:')) {
        // photos 배열에서 URL 가져오기
        finalProfileImage = formData.photos[0];
      }

      // photos 배열에서 URL만 필터링 (base64 제외)
      const validPhotos = formData.photos.filter(photo => 
        photo && !photo.startsWith('data:')
      );

      // 데이터베이스에 저장할 데이터 준비
      const profileData: Record<string, any> = {
        name: formData.name,
        age: formData.age,
        gender: formData.gender === '여자' ? 'female' : 'male',
        location: formData.location,
        bio: formData.bio,
        mbti: formData.mbti,
        school: formData.school,
        height: formData.height,
        body_type: formData.bodyType,
        style: formData.style,
        religion: formData.religion,
        smoking: formData.smoking,
        drinking: formData.drinking,
        interests: formData.interests,
        updated_at: new Date().toISOString()
      };

      // 프로필 이미지가 있을 때만 추가
      if (finalProfileImage) {
        profileData.profile_image = finalProfileImage;
      }

      // photos 배열 저장 (유효한 URL만)
      if (validPhotos.length > 0) {
        profileData.photos = validPhotos;
      }

      // users 테이블에 데이터 저장 (update)
      const { error: dbError } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', authUser.id);

      if (dbError) {
        logger.error('데이터베이스 저장 에러:', dbError);
        alert('프로필 저장에 실패했습니다.');
        setIsUploading(false);
        return;
      }

      // localStorage의 auth_user 업데이트
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const updatedUser = {
          ...userData,
          name: formData.name,
          profile_image: uploadedImageUrl || formData.avatar
        };
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      }

      logger.info('저장된 데이터:', profileData);
      setShowSaveAlert(true);

    } catch (error) {
      logger.error('프로필 저장 중 오류:', error);
      alert('프로필 저장에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('JPG, PNG, WEBP, GIF 형식의 이미지만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 검증 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    setIsUploading(true);

    try {
      // 파일명 생성 (타임스탬프 + 랜덤 문자열)
      const fileName = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Supabase Storage에 업로드 - profile-images 버킷 사용
      const { error: uploadError, data } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        let errorMsg = uploadError.message || '이미지 업로드에 실패했습니다.';
        
        // Bucket not found 오류 처리
        if (errorMsg.includes('Bucket not found')) {
          errorMsg = '⚠️ Supabase Storage가 제대로 설정되지 않았습니다.\n관리자에게 문의해주세요.\n\n기술 정보: "user-profiles" bucket이 없습니다.';
        } else if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
          errorMsg = '⚠️ 인증 오류: Supabase 설정을 확인해주세요.';
        }
        
        logger.error('업로드 에러 상세:', uploadError);
        throw new Error(errorMsg);
      }

      logger.info('업로드 성공:', data);

      // 공개 URL 생성 - Supabase 기본 형식
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/profile-images/${fileName}`;
      
      logger.info('생성된 공개 URL:', { url: publicUrl });
      setUploadedImageUrl(publicUrl);

      // 미리보기용으로 로컬 이미지도 설정
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: reader.result as string
        }));
      };
      reader.readAsDataURL(file);

    } catch (error: any) {
      logger.error('이미지 업로드 중 오류:', error);
      alert(error.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // 로그인 여부 확인
  if (!authUser) {
    return (
      <div className="min-h-screen bg-cyan-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">로그인이 필요합니다</h1>
          <p className="text-gray-600 mb-8">프로필을 수정하려면 먼저 로그인해주세요.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all cursor-pointer"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">프로필 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyan-50 pb-20 pb-[calc(80px+env(safe-area-inset-bottom))]">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line text-xl"></i>
          </button>
          <h1 className="text-lg font-bold">프로필 수정</h1>
          <button
            onClick={handleSave}
            disabled={isUploading}
            className={`font-medium cursor-pointer whitespace-nowrap ${isUploading ? 'text-gray-400' : 'text-cyan-500'
              }`}
          >
            {isUploading ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto">
        {/* 프로필 사진 */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-4">
          <div className="text-center">
            <div className="relative inline-block mb-4">
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-10">
                  <i className="ri-loader-4-line text-white text-2xl animate-spin"></i>
                </div>
              )}
              <img
                src={formData.avatar || getDefaultAvatar(formData.gender)}
                alt="프로필"
                className="w-24 h-24 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getDefaultAvatar(formData.gender);
                }}
              />
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:from-cyan-600 hover:to-blue-700 cursor-pointer'
                  }`}
              >
                <i className="ri-camera-line"></i>
              </label>
            </div>
            <p className="text-sm text-gray-500">대표 프로필 사진</p>
          </div>
        </div>

        {/* 사진 갤러리 (최대 6장) */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <i className="ri-gallery-line mr-2 text-cyan-500"></i>
            내 사진 ({formData.photos.length}/{MAX_PHOTOS})
          </h3>
          <p className="text-xs text-gray-500 mb-4">최대 {MAX_PHOTOS}장까지 업로드 가능합니다. 첫 번째 사진이 대표 사진이 됩니다.</p>
          
          <div className="grid grid-cols-3 gap-2">
            {/* 기존 사진들 */}
            {formData.photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={photo} alt={`사진 ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => {
                      const newPhotos = formData.photos.filter((_, i) => i !== index);
                      setFormData({ ...formData, photos: newPhotos });
                    }}
                    className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
                {index === 0 && (
                  <div className="absolute top-1 left-1 bg-cyan-500 text-white text-[10px] px-1.5 py-0.5 rounded">대표</div>
                )}
              </div>
            ))}
            
            {/* 사진 추가 버튼 */}
            {formData.photos.length < MAX_PHOTOS && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    // 파일 타입 검증
                    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
                    if (!validTypes.includes(file.type)) {
                      alert('JPG, PNG, WEBP, GIF 형식의 이미지만 업로드 가능합니다.');
                      return;
                    }

                    // 파일 크기 검증 (5MB 제한)
                    const maxSize = 5 * 1024 * 1024;
                    if (file.size > maxSize) {
                      alert('이미지 크기는 5MB 이하여야 합니다.');
                      return;
                    }
                    
                    setIsUploading(true);
                    try {
                      // 파일명 생성 (profile-images 버킷 사용 - 대표 사진과 동일)
                      const fileName = `photo_${authUser?.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                      
                      const { error: uploadError, data } = await supabase.storage
                        .from('profile-images')
                        .upload(fileName, file, {
                          cacheControl: '3600',
                          upsert: false
                        });
                      
                      if (uploadError) {
                        let errorMsg = uploadError.message || '이미지 업로드에 실패했습니다.';
                        if (errorMsg.includes('Bucket not found')) {
                          errorMsg = '⚠️ Supabase Storage가 설정되지 않았습니다.\n관리자에게 문의해주세요.';
                        }
                        throw new Error(errorMsg);
                      }

                      logger.info('갤러리 사진 업로드 성공:', data);
                      
                      // 공개 URL 생성
                      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
                      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/profile-images/${fileName}`;
                      
                      setFormData(prev => ({
                        ...prev,
                        photos: [...prev.photos, publicUrl],
                        avatar: prev.photos.length === 0 ? publicUrl : prev.avatar
                      }));
                    } catch (error: any) {
                      logger.error('사진 업로드 실패:', error);
                      alert(error.message || '사진 업로드에 실패했습니다.');
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                  className="hidden"
                />
                <i className="ri-add-line text-2xl text-gray-400"></i>
                <span className="text-xs text-gray-400 mt-1">추가</span>
              </label>
            )}
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <i className="ri-user-line mr-2 text-cyan-500"></i>
            기본 정보
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="이름을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                나이
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="나이를 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                성별 <span className="text-xs text-gray-400">(변경 불가)</span>
              </label>
              <div className="flex space-x-3">
                <div
                  className={`flex-1 py-3 rounded-xl font-medium text-center ${formData.gender === '여자'
                    ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                    }`}
                >
                  여자
                </div>
                <div
                  className={`flex-1 py-3 rounded-xl font-medium text-center ${formData.gender === '남자'
                    ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                    }`}
                >
                  남자
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                <i className="ri-information-line mr-1"></i>
                성별은 회원가입 시 설정한 후 변경할 수 없습니다
              </p>
            </div>

            {/* 거주지역 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-cyan-500 font-bold">거주지역</span>을 선택해 주세요
              </label>
              <div className="space-y-2">
                {/* 시/도 선택 */}
                <div className="relative">
                  <select
                    value={selectedSido}
                    onChange={(e) => {
                      setSelectedSido(e.target.value);
                      setFormData({ ...formData, location: '' });
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white appearance-none cursor-pointer"
                  >
                    <option value="">시/도 선택</option>
                    {KOREA_LOCATIONS.map((loc) => (
                      <option key={loc.sido} value={loc.sido}>{loc.sido}</option>
                    ))}
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                </div>
                
                {/* 시/군/구 선택 */}
                {selectedSido && (
                  <div className="relative">
                    <select
                      value={formData.location ? formData.location.split(' ').slice(1).join(' ') : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          setFormData({ ...formData, location: `${selectedSido} ${e.target.value}` });
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white appearance-none cursor-pointer"
                    >
                      <option value="">시/군/구 선택</option>
                      {getSigunguList(selectedSido).map((sigungu) => (
                        <option key={sigungu} value={sigungu}>{sigungu}</option>
                      ))}
                    </select>
                    <i className="ri-arrow-down-s-line absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                  </div>
                )}
                
                {/* 선택된 지역 표시 */}
                {formData.location && (
                  <div className="bg-cyan-50 text-cyan-700 px-4 py-2 rounded-xl text-sm flex items-center">
                    <i className="ri-map-pin-line mr-2"></i>
                    선택된 지역: <span className="font-bold ml-1">{formData.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <i className="ri-file-list-3-line mr-2 text-cyan-500"></i>
            상세 정보
          </h3>

          <div className="space-y-4">
            {/* 학교 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-cyan-500 font-bold">학교</span>에 재학중이신가요, 졸업생이신가요?
              </label>
              
              {/* 학교 검색 입력 */}
              <div className="relative mb-2">
                <input
                  type="text"
                  value={schoolSearchQuery}
                  onChange={(e) => {
                    setSchoolSearchQuery(e.target.value);
                    setSchoolSearchResults(searchSchools(e.target.value, 10));
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="학교를 입력해 주세요."
                />
                {schoolSearchQuery && (
                  <button
                    onClick={() => {
                      setSchoolSearchQuery('');
                      setSchoolSearchResults([]);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                )}
              </div>
              
              {/* 검색 결과 */}
              {schoolSearchResults.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-2 max-h-48 overflow-y-auto">
                  {schoolSearchResults.map((school) => (
                    <button
                      key={school}
                      onClick={() => {
                        setFormData({ ...formData, school });
                        setSchoolSearchQuery('');
                        setSchoolSearchResults([]);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-cyan-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      {school}
                    </button>
                  ))}
                </div>
              )}
              
              {/* 선택된 학교 표시 */}
              {formData.school && (
                <div className="bg-gray-100 px-4 py-3 rounded-xl flex items-center justify-between mb-2">
                  <span className="font-medium">{formData.school}</span>
                  <button
                    onClick={() => setFormData({ ...formData, school: '' })}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              )}
              
              {/* 안내 문구 */}
              <div className="flex items-start text-sm text-gray-500 mb-3">
                <i className="ri-information-line mr-2 mt-0.5 text-cyan-500"></i>
                <span>직장인, 스타트업, 자영업 등 검색하면 추가 됩니다!</span>
              </div>
              
              {/* 재학/졸업 선택 (선택사항) */}
              {formData.school && (
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white appearance-none cursor-pointer"
                  >
                    <option value="재학중">재학중</option>
                    <option value="졸업">졸업</option>
                    <option value="휴학중">휴학중</option>
                    <option value="재직중">재직중</option>
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                키 (cm)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['150~155', '155~160', '160~165', '165~170', '170~175', '175~180', '180~185', '185~190'].map((height) => (
                  <button
                    key={height}
                    onClick={() => handleInputChange('height', height)}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${formData.height === height
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                      }`}
                  >
                    {height}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                체형
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['마른', '보통', '통통', '근육질', '건장한'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleInputChange('bodyType', type)}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${formData.bodyType === type
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                스타일
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['캐주얼', '스포티', '모던', '클래식', '스트릿', '페미닌'].map((style) => (
                  <button
                    key={style}
                    onClick={() => handleInputChange('style', style)}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${formData.style === style
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                      }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종교
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['무교', '기독교', '천주교', '불교', '원불교', '기타'].map((religion) => (
                  <button
                    key={religion}
                    onClick={() => handleInputChange('religion', religion)}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${formData.religion === religion
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                      }`}
                  >
                    {religion}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MBTI
              </label>
              <select
                value={formData.mbti}
                onChange={(e) => handleInputChange('mbti', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white cursor-pointer"
              >
                <option value="">MBTI를 선택하세요</option>
                {MBTI_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                흡연
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['비흡연', '흡연'].map((smoking) => (
                  <button
                    key={smoking}
                    onClick={() => handleInputChange('smoking', smoking)}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${formData.smoking === smoking
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                      }`}
                  >
                    {smoking}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                음주
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['안 마심', '가끔', '자주', '매일'].map((drinking) => (
                  <button
                    key={drinking}
                    onClick={() => handleInputChange('drinking', drinking)}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${formData.drinking === drinking
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                      }`}
                  >
                    {drinking}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 자기소개 */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <i className="ri-chat-smile-2-line mr-2 text-cyan-500"></i>
            자기소개
          </h3>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            rows={4}
            placeholder="자신을 소개해주세요"
            maxLength={500}
          />
          <div className="text-right text-xs text-gray-400 mt-2">
            {formData.bio.length}/500
          </div>
        </div>

        {/* 관심사 */}
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <i className="ri-heart-line mr-2 text-cyan-500"></i>
            관심사 <span className="text-gray-400 text-xs ml-2">(최대 10개)</span>
          </h3>
          
          {/* 선택된 관심사 표시 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.interests.map((interest) => (
              <span
                key={interest}
                className="bg-cyan-50 text-cyan-700 px-4 py-2 rounded-full text-sm flex items-center space-x-2"
              >
                <span>{interest}</span>
                <button
                  onClick={() => handleRemoveInterest(interest)}
                  className="w-4 h-4 flex items-center justify-center hover:bg-cyan-200 rounded-full transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-xs"></i>
                </button>
              </span>
            ))}
          </div>
          
          {/* 관심사 선택 버튼 */}
          <button
            type="button"
            onClick={() => setShowInterestModal(true)}
            className="w-full px-4 py-3 border-2 border-dashed border-cyan-300 rounded-xl text-cyan-600 hover:bg-cyan-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="ri-add-line"></i>
            관심사 선택하기 ({formData.interests.length}/10)
          </button>
        </div>
      </div>

      {/* 저장 성공 알림 */}
      {showSaveAlert && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-white text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">저장 완료!</h3>
            <p className="text-gray-600 mb-6">
              프로필이 성공적으로 업데이트되었습니다.
            </p>
            <button
              onClick={() => {
                setShowSaveAlert(false);
                handleBack();
              }}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-full font-medium hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer whitespace-nowrap"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 관심사 선택 모달 */}
      {showInterestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col animate-slide-up">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-800">관심사 선택</h3>
              <button
                type="button"
                onClick={() => setShowInterestModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* 선택된 관심사 미리보기 */}
            <div className="px-6 py-3 bg-cyan-50 border-b">
              <p className="text-sm text-cyan-700 mb-2">
                선택됨: <span className="font-bold">{formData.interests.length}/10</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {formData.interests.length === 0 ? (
                  <span className="text-sm text-gray-400">아래에서 관심사를 선택해주세요</span>
                ) : (
                  formData.interests.map((interest) => (
                    <span
                      key={interest}
                      className="bg-cyan-500 text-white px-2.5 py-1 rounded-full text-xs font-medium"
                    >
                      {interest}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* 관심사 목록 */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* 인기 관심사 */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 mb-3 flex items-center">
                  <i className="ri-fire-line mr-1 text-orange-500"></i>
                  인기 관심사
                </h4>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleToggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                        formData.interests.includes(interest)
                          ? 'bg-cyan-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* 카테고리별 관심사 */}
              {INTEREST_CATEGORY_NAMES.map((category) => (
                <div key={category} className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 mb-3 flex items-center">
                    <i className={`${INTEREST_CATEGORY_ICONS[category]} mr-1 text-cyan-500`}></i>
                    {category}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_CATEGORIES[category].map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleToggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                          formData.interests.includes(interest)
                            ? 'bg-cyan-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 확인 버튼 */}
            <div className="px-6 py-4 border-t bg-white">
              <button
                type="button"
                onClick={() => setShowInterestModal(false)}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all cursor-pointer"
              >
                선택 완료 ({formData.interests.length}개)
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
