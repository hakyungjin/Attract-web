import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// 기본 프로필 이미지 헬퍼 함수
const getDefaultAvatar = (gender?: string) => {
  if (gender === '남자') {
    return 'https://readdy.ai/api/search-image?query=minimalist%20male%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=male-default-avatar&orientation=squarish';
  }
  return 'https://readdy.ai/api/search-image?query=minimalist%20female%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=female-default-avatar&orientation=squarish';
};

export default function ProfileEditPage() {
  const navigate = useNavigate();
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
    avatar: ''
  });

  const [newInterest, setNewInterest] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // 로컬 스토리지에서 현재 사용자 정보 가져오기 (Firebase 인증 사용)
    const getCurrentUser = () => {
      const localUser = localStorage.getItem('user');
      if (localUser) {
        try {
          const userData = JSON.parse(localUser);
          setCurrentUserId(userData.id);

          // 기존 프로필 데이터로 폼 초기화
          setFormData({
            nickname: userData.name || '',
            name: userData.name || '',
            age: userData.age || 20,
            gender: userData.gender || '여자',
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
            avatar: userData.avatar_url || ''
          });
        } catch (error) {
          console.error('사용자 정보 로드 실패:', error);
        }
      }
    };
    getCurrentUser();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  // 지역 데이터
  const locationData: Record<string, string[]> = {
    '서울': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
    '인천': ['계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '중구', '강화군', '옹진군'],
    '부산': ['강서구', '금정구', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구', '기장군'],
    '대구': ['남구', '달서구', '동구', '북구', '서구', '수성구', '중구', '달성군'],
    '대전': ['대덕구', '동구', '서구', '유성구', '중구'],
    '광주': ['광산구', '남구', '동구', '북구', '서구'],
    '울산': ['남구', '동구', '북구', '중구', '울주군'],
    '경기': ['고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '여주시', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
    '강원': ['강릉시', '동해시', '삼척시', '속초시', '원주시', '춘천시', '태백시', '고성군', '양구군', '양양군', '영월군', '인제군', '정선군', '철원군', '평창군', '홍천군', '화천군', '횡성군'],
    '충북': ['제천시', '청주시', '충주시', '괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '증평군', '진천군'],
    '충남': ['계룡시', '공주시', '논산시', '당진시', '보령시', '서산시', '아산시', '천안시', '금산군', '부여군', '서천군', '예산군', '청양군', '태안군', '홍성군'],
    '전북': ['군산시', '김제시', '남원시', '익산시', '전주시', '정읍시', '고창군', '무주군', '부안군', '순창군', '완주군', '임실군', '장수군', '진안군'],
    '전남': ['광양시', '나주시', '목포시', '순천시', '여수시', '강진군', '고흥군', '곡성군', '구례군', '담양군', '무안군', '보성군', '신안군', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
    '경북': ['경산시', '경주시', '구미시', '김천시', '문경시', '상주시', '안동시', '영주시', '영천시', '포항시', '고령군', '군위군', '봉화군', '성주군', '영덕군', '영양군', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군'],
    '경남': ['거제시', '김해시', '밀양시', '사천시', '양산시', '진주시', '창원시', '통영시', '거창군', '고성군', '남해군', '산청군', '의령군', '창녕군', '하동군', '함안군', '함양군', '합천군'],
    '제주': ['제주시', '서귀포시']
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(item => item !== interest)
    }));
  };

  const handleSave = async () => {
    if (!currentUserId) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    setIsUploading(true);

    try {
      // 데이터베이스에 저장할 데이터 준비
      const profileData = {
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
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
        avatar_url: uploadedImageUrl || formData.avatar,
        updated_at: new Date().toISOString()
      };

      // users 테이블에 데이터 저장 (upsert)
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: currentUserId,
          ...profileData
        });

      if (dbError) {
        console.error('데이터베이스 저장 에러:', dbError);
        alert('프로필 저장에 실패했습니다.');
        setIsUploading(false);
        return;
      }

      // 로컬 스토리지도 업데이트
      const localUser = localStorage.getItem('user');
      if (localUser) {
        const userData = JSON.parse(localUser);
        const updatedUser = {
          ...userData,
          ...profileData,
          body_type: formData.bodyType // DB 컬럼명과 맞춤
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      console.log('저장된 데이터:', profileData);
      setShowSaveAlert(true);

    } catch (error) {
      console.error('프로필 저장 중 오류:', error);
      alert('프로필 저장에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddInterest();
    }
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setSelectedDistrict('');
  };

  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district);
    const newLocation = `${selectedCity} ${district}`;
    handleInputChange('location', newLocation);
    setShowLocationModal(false);
    setSelectedCity('');
    setSelectedDistrict('');
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Supabase Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('업로드 에러:', uploadError);
        throw new Error(uploadError.message || '이미지 업로드에 실패했습니다.');
      }

      // 업로드된 이미지의 공개 URL 가져오기
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
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
      console.error('이미지 업로드 중 오류:', error);
      alert(error.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyan-50 pb-20">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
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
            <p className="text-sm text-gray-500">프로필 사진 변경</p>
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
                성별
              </label>
              <div className="flex space-x-3">
                <button
                  onClick={() => setFormData({ ...formData, gender: '여자' })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors cursor-pointer whitespace-nowrap ${formData.gender === '여자'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                    }`}
                >
                  여자
                </button>
                <button
                  onClick={() => setFormData({ ...formData, gender: '남자' })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors cursor-pointer whitespace-nowrap ${formData.gender === '남자'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                    }`}
                >
                  남자
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                지역
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="지역을 입력하세요"
              />
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학교
              </label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) => handleInputChange('school', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="학교를 입력하세요"
              />
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
              <input
                type="text"
                value={formData.mbti}
                onChange={(e) => handleInputChange('mbti', e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent uppercase"
                placeholder="MBTI를 입력하세요 (예: ENFP)"
                maxLength={4}
              />
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
            관심사
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.interests.map((interest, index) => (
              <span
                key={index}
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
          <div className="flex space-x-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="관심사 추가"
            />
            <button
              onClick={handleAddInterest}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer whitespace-nowrap"
            >
              추가
            </button>
          </div>
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
    </div>
  );
}
