import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { firebase } from '../../lib/firebaseService';
import { uploadImage } from '../../services/imageUpload';
import { MBTI_TYPES } from '../../constants/mbti';
import { logger } from '../../utils/logger';
import { KOREA_LOCATIONS, getSigunguList } from '../../constants/locations';
import { searchSchools } from '../../constants/schools';

export default function SignupProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    phone_number: '',
    name: '',
    age: 20,
    gender: 'male',
    location: '',
    bio: '',
    mbti: '',
    school: '',
    job: '',
    height: '160~165',
    body_type: '보통',
    style: '캐주얼',
    religion: '무교',
    smoking: '비흡연',
    drinking: '가끔',
    interests: [] as string[],
    profile_image: ''
  });

  const [newInterest, setNewInterest] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // 지역/학교 선택 상태
  const [selectedSido, setSelectedSido] = useState('');
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [schoolSearchResults, setSchoolSearchResults] = useState<string[]>([]);

  // 회원가입 후 전달된 사용자 정보 로드
  useEffect(() => {
    const phoneNumber = (location.state as any)?.phoneNumber;
    if (phoneNumber) {
      const loadUserData = async () => {
        const { user } = await firebase.users.findUserByPhoneNumber(phoneNumber);

        if (user) {
          setFormData(prev => ({
            ...prev,
            phone_number: user.phone_number,
            name: user.name,
            age: user.age || 20,
            gender: user.gender || 'male',
            location: user.location || '',
            bio: user.bio || '',
            mbti: user.mbti || '',
            school: user.school || '',
            job: user.job || '',
          }));
        }
      };
      loadUserData();
    }
  }, [location]);


  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest]
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    logger.info('파일 선택', { name: file.name, type: file.type, size: file.size });

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('JPG, PNG, WEBP, GIF 형식의 이미지만 업로드 가능합니다.');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    setIsUploading(true);
    try {
      logger.info('Firebase Storage 업로드 시작');

      // Firebase Storage에 업로드 (imageUpload 서비스 사용)
      const publicUrl = await uploadImage(file, 'avatars');

      logger.info('생성된 공개 URL', { publicUrl });
      setUploadedImageUrl(publicUrl);
      alert('이미지가 업로드되었습니다!');
    } catch (error: any) {
      logger.error('업로드 중 오류', error);
      alert('업로드 중 오류: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const getDefaultAvatar = () => {
    return 'https://readdy.ai/api/search-image?query=minimalist%20silhouette%20profile%20avatar%20icon%20on%20clean%20white%20background%20simple%20modern%20design%20professional%20business%20style%20neutral%20gray%20color%20scheme%20front%20facing%20head%20and%20shoulders%20portrait%20clean%20lines%20vector%20style%20illustration&width=300&height=300&seq=default-avatar&orientation=squarish';
  };

  const handleSave = async () => {
    // 프로필 사진 필수 확인
    if (!uploadedImageUrl && !formData.profile_image) {
      alert('프로필 사진을 업로드해주세요. (필수)');
      return;
    }

    // 프로필 저장 및 완성 표시
    logger.info('프로필 저장', { uploadedImageUrl, profile_image: formData.profile_image });

    setIsSaving(true);
    try {
      // 먼저 사용자 찾기
      const { user } = await firebase.users.findUserByPhoneNumber(formData.phone_number);

      if (!user) {
        alert('사용자를 찾을 수 없습니다.');
        return;
      }

      // Firebase에서 업데이트
      const { error } = await firebase.users.updateUser(user.id, {
        mbti: formData.mbti,
        location: formData.location,
        bio: formData.bio,
        school: formData.school,
        job: formData.job,
        height: formData.height,
        body_type: formData.body_type,
        style: formData.style,
        religion: formData.religion,
        smoking: formData.smoking,
        drinking: formData.drinking,
        interests: formData.interests,
        profile_image: uploadedImageUrl || formData.profile_image,
        avatar_url: uploadedImageUrl || formData.profile_image,
      });

      if (error) {
        alert('프로필 저장 실패: ' + error.message);
        logger.error('저장 에러', error);
        return;
      }

      alert('프로필이 완성되었습니다!');
      navigate('/');
    } catch (error: any) {
      alert('저장 중 오류: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">프로필 완성</h1>
          <p className="text-gray-600 mt-2">추가 정보를 입력하여 더 나은 매칭을 받으세요</p>
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">

          {/* MBTI */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              MBTI
            </label>
            <select
              value={formData.mbti}
              onChange={(e) => setFormData(prev => ({ ...prev, mbti: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 bg-white cursor-pointer"
            >
              <option value="">MBTI를 선택하세요</option>
              {MBTI_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* 지역 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              <span className="text-cyan-500">거주지역</span>을 선택해 주세요
            </label>
            <div className="grid grid-cols-2 gap-2">
              {/* 시/도 선택 */}
              <div className="relative">
                <select
                  value={selectedSido}
                  onChange={(e) => {
                    setSelectedSido(e.target.value);
                    setFormData(prev => ({ ...prev, location: '' }));
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 bg-white appearance-none cursor-pointer"
                >
                  <option value="">시/도 선택</option>
                  {KOREA_LOCATIONS.map((loc) => (
                    <option key={loc.sido} value={loc.sido}>{loc.sido}</option>
                  ))}
                </select>
                <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>
              
              {/* 시/군/구 선택 */}
              <div className="relative">
                <select
                  value={formData.location ? formData.location.split(' ').slice(1).join(' ') : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData(prev => ({ ...prev, location: `${selectedSido} ${e.target.value}` }));
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 bg-white appearance-none cursor-pointer"
                  disabled={!selectedSido}
                >
                  <option value="">시/군/구 선택</option>
                  {selectedSido && getSigunguList(selectedSido).map((sigungu) => (
                    <option key={sigungu} value={sigungu}>{sigungu}</option>
                  ))}
                </select>
                <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>
            </div>
            {formData.location && (
              <div className="mt-2 bg-cyan-50 px-4 py-2 rounded-xl flex items-center">
                <i className="ri-map-pin-line mr-2 text-cyan-500"></i>
                <span className="text-cyan-700 font-medium">{formData.location}</span>
              </div>
            )}
          </div>

          {/* 학교/직업 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              <span className="text-cyan-500">학교/직업</span>을 입력해 주세요
            </label>
            <div className="relative">
              <input
                type="text"
                value={schoolSearchQuery || formData.school || formData.job}
                onChange={(e) => {
                  setSchoolSearchQuery(e.target.value);
                  setSchoolSearchResults(searchSchools(e.target.value, 8));
                }}
                placeholder="학교 또는 직업을 검색하세요"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500"
              />
              {schoolSearchResults.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {schoolSearchResults.map((result) => (
                    <button
                      key={result}
                      type="button"
                      onClick={() => {
                        // 대학교인지 직업인지 판단
                        if (result.includes('대학교') || result.includes('대학') || result.includes('학교')) {
                          setFormData(prev => ({ ...prev, school: result, job: '' }));
                        } else {
                          setFormData(prev => ({ ...prev, job: result, school: '' }));
                        }
                        setSchoolSearchQuery('');
                        setSchoolSearchResults([]);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-cyan-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      {result}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {(formData.school || formData.job) && (
              <div className="mt-2 bg-cyan-50 px-4 py-2 rounded-xl flex items-center justify-between">
                <span className="text-cyan-700 font-medium">
                  {formData.school || formData.job}
                </span>
                <button 
                  type="button" 
                  onClick={() => setFormData(prev => ({ ...prev, school: '', job: '' }))} 
                  className="text-cyan-500 hover:text-cyan-700"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              <i className="ri-information-line mr-1 text-cyan-500"></i>
              직장인, 스타트업, 자영업 등도 검색 가능합니다
            </p>
          </div>

          {/* 키 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              키
            </label>
            <select
              value={formData.height}
              onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500"
            >
              <option value="150~155">150~155</option>
              <option value="155~160">155~160</option>
              <option value="160~165">160~165</option>
              <option value="165~170">165~170</option>
              <option value="170~175">170~175</option>
              <option value="175~180">175~180</option>
              <option value="180~185">180~185</option>
              <option value="185+">185+</option>
            </select>
          </div>

          {/* 체형 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              체형
            </label>
            <select
              value={formData.body_type}
              onChange={(e) => setFormData(prev => ({ ...prev, body_type: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500"
            >
              <option value="마름">마름</option>
              <option value="보통">보통</option>
              <option value="근육질">근육질</option>
              <option value="통통">통통</option>
            </select>
          </div>

          {/* 스타일 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              스타일
            </label>
            <select
              value={formData.style}
              onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500"
            >
              <option value="캐주얼">캐주얼</option>
              <option value="포멀">포멀</option>
              <option value="스포츠">스포츠</option>
              <option value="클래식">클래식</option>
              <option value="트렌디">트렌디</option>
            </select>
          </div>

          {/* 종교 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              종교
            </label>
            <select
              value={formData.religion}
              onChange={(e) => setFormData(prev => ({ ...prev, religion: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500"
            >
              <option value="무교">무교</option>
              <option value="기독교">기독교</option>
              <option value="천주교">천주교</option>
              <option value="불교">불교</option>
              <option value="이슬람">이슬람</option>
              <option value="기타">기타</option>
            </select>
          </div>

          {/* 흡연 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              흡연
            </label>
            <select
              value={formData.smoking}
              onChange={(e) => setFormData(prev => ({ ...prev, smoking: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500"
            >
              <option value="비흡연">비흡연</option>
              <option value="흡연">흡연</option>
              <option value="가끔">가끔</option>
            </select>
          </div>

          {/* 음주 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              음주
            </label>
            <select
              value={formData.drinking}
              onChange={(e) => setFormData(prev => ({ ...prev, drinking: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500"
            >
              <option value="안함">안함</option>
              <option value="가끔">가끔</option>
              <option value="자주">자주</option>
            </select>
          </div>

          {/* 관심사 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              관심사
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                placeholder="관심사 입력"
                maxLength={20}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleAddInterest}
                className="px-4 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors cursor-pointer whitespace-nowrap font-semibold"
              >
                추가
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-cyan-100 text-cyan-800 px-3 py-2 rounded-full text-sm"
                >
                  {interest}
                  <button
                    onClick={() => handleRemoveInterest(index)}
                    className="text-cyan-600 hover:text-cyan-800 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 자기소개 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              자기소개
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="자신을 소개해주세요..."
              maxLength={200}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/200</p>
          </div>

          {/* 프로필 사진 (필수) */}
          <div className="text-center pt-6 border-t border-gray-100">
            <label className="block text-sm font-semibold text-gray-800 mb-4">
              프로필 사진 <span className="text-red-500">*</span> (필수)
            </label>
            <p className="text-xs text-gray-500 mb-3">얼굴이 잘 나온 사진을 업로드해주세요</p>
            <div className="relative inline-block mb-4">
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-10">
                  <i className="ri-loader-4-line text-white text-2xl animate-spin"></i>
                </div>
              )}
              <img
                src={uploadedImageUrl || formData.profile_image || getDefaultAvatar()}
                alt="프로필"
                className="w-32 h-32 rounded-full object-cover border-4 border-cyan-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getDefaultAvatar();
                }}
              />
              <input
                type="file"
                id="profile-image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />
              <label
                htmlFor="profile-image-upload"
                className={`absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:from-cyan-600 hover:to-blue-700'
                  }`}
              >
                <i className="ri-camera-line"></i>
              </label>
            </div>
            {uploadedImageUrl || formData.profile_image ? (
              <p className="text-sm text-green-500 font-semibold">✓ 프로필 사진 완료</p>
            ) : (
              <p className="text-sm text-red-500 font-semibold">프로필 사진을 업로드해주세요</p>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-6">
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer font-semibold"
            >
              나중에
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-colors disabled:opacity-50 cursor-pointer font-semibold"
            >
              {isSaving ? '저장 중...' : '완성'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
