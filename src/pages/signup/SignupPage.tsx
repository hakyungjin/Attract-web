import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createUserProfile } from '../../services/phoneAuth';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { KOREA_LOCATIONS, getSigunguList } from '../../constants/locations';
import { searchSchools } from '../../constants/schools';

interface LocationState {
  firebaseUid: string;
  phoneNumber: string;
}

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  // state가 없으면 로그인 페이지로 리다이렉트
  if (!state || !state.firebaseUid || !state.phoneNumber) {
    navigate('/login');
    return null;
  }

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    location: '',
    bio: '',
    mbti: '',
    school: '',
    height: '',
    bodyType: '',
    style: '',
    religion: '',
    smoking: '',
    drinking: '',
    profileImage: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  
  // 지역/학교 선택 상태
  const [selectedSido, setSelectedSido] = useState('');
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [schoolSearchResults, setSchoolSearchResults] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 이미지 파일 선택
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 확인 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 이미지 파일 형식 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setSelectedFile(file);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 이미지 업로드
  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    setUploading(true);

    try {
      // 파일명 생성 (타임스탬프 + 랜덤)
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Firebase Storage에 업로드
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, selectedFile);

      // 공개 URL 가져오기
      const publicUrl = await getDownloadURL(storageRef);

      console.log('이미지 업로드 성공:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert('이미지 업로드에 실패했습니다.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData(prev => ({
      ...prev,
      profileImage: ''
    }));
  };

  // 관심사 추가
  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  // 관심사 제거
  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(item => item !== interest));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    if (!formData.gender) {
      alert('성별을 선택해주세요.');
      return;
    }

    if (!selectedFile && !formData.profileImage) {
      alert('프로필 사진을 최소 1장 이상 업로드해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 이미지 업로드 (선택된 파일이 있는 경우)
      let imageUrl = formData.profileImage;
      if (selectedFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
          setLoading(false);
          return;
        }
      }

      if (!imageUrl) {
        alert('프로필 사진을 업로드해주세요.');
        setLoading(false);
        return;
      }

      // 사진을 배열로 저장
      const photosArray = imageUrl ? [imageUrl] : [];

      const { data, error } = await createUserProfile(
        state.firebaseUid,
        state.phoneNumber,
        {
          name: formData.name.trim(),
          age: formData.age ? parseInt(formData.age) : undefined,
          gender: formData.gender,
          location: formData.location.trim() || undefined,
          bio: formData.bio.trim() || undefined,
          mbti: formData.mbti || undefined,
          school: formData.school.trim() || undefined,
          height: formData.height || undefined,
          body_type: formData.bodyType || undefined,
          style: formData.style || undefined,
          religion: formData.religion || undefined,
          smoking: formData.smoking || undefined,
          drinking: formData.drinking || undefined,
          interests: interests.length > 0 ? interests : undefined,
          photos: photosArray
        }
      );

      if (error) {
        alert('회원가입에 실패했습니다. 다시 시도해주세요.');
        console.error(error);
        return;
      }

      // 생성된 사용자 정보를 localStorage에 저장 (자동 로그인)
      if (data) {
        localStorage.setItem('user', JSON.stringify(data));
        console.log('회원가입 완료 및 자동 로그인:', data);
      }

      alert('회원가입이 완료되었습니다!');
      navigate('/', { replace: true });
    } catch (error) {
      alert('회원가입 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 py-8 px-4">
      <div className="w-full max-w-md mx-auto">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                <img
                  src="/image/icon.png"
                  alt="Attract Logo"
                  className="w-14 h-14 object-contain"
                />
              </div>
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Attract
          </h1>
          <p className="text-gray-600">프로필을 완성해주세요</p>
        </div>

        {/* 회원가입 폼 */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            회원가입
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 프로필 이미지 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로필 사진 <span className="text-red-500">*</span>
              </label>

              {/* 미리보기 */}
              {previewUrl && (
                <div className="mb-3 relative">
                  <img
                    src={previewUrl}
                    alt="미리보기"
                    className="w-32 h-32 object-cover rounded-xl mx-auto border-2 border-cyan-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-0 right-1/2 translate-x-16 -translate-y-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* 파일 선택 버튼 */}
              <div className="flex gap-2">
                <label className="flex-1 bg-cyan-50 border-2 border-dashed border-cyan-300 rounded-xl px-4 py-3 text-center cursor-pointer hover:bg-cyan-100 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <i className="ri-image-add-line text-cyan-500 mr-2"></i>
                  <span className="text-sm text-cyan-600">
                    {selectedFile ? selectedFile.name : '이미지 선택'}
                  </span>
                </label>
              </div>

              {/* URL 입력 (대체 방법) */}
              <div className="mt-2">
                <input
                  type="url"
                  name="profileImage"
                  value={formData.profileImage}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  placeholder="또는 이미지 URL 입력"
                  disabled={!!selectedFile}
                />
              </div>

              <p className="text-xs text-gray-500 mt-1">
                파일 업로드 또는 URL 입력 (최대 5MB)
              </p>
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="이름을 입력하세요"
                maxLength={20}
                required
              />
            </div>

            {/* 나이 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                나이
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="나이를 입력하세요"
                min="18"
                max="100"
              />
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                성별 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                  className={`py-3 rounded-xl font-medium transition-all ${
                    formData.gender === 'male'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  남자
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                  className={`py-3 rounded-xl font-medium transition-all ${
                    formData.gender === 'female'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  여자
                </button>
              </div>
            </div>

            {/* MBTI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MBTI
              </label>
              <input
                type="text"
                name="mbti"
                value={formData.mbti}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="예: ENFP"
                maxLength={4}
              />
            </div>

            {/* 학교/직업 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-cyan-500 font-bold">학교/직업</span>을 입력해 주세요
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={schoolSearchQuery || formData.school}
                  onChange={(e) => {
                    setSchoolSearchQuery(e.target.value);
                    setSchoolSearchResults(searchSchools(e.target.value, 8));
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="학교 또는 직업을 검색하세요"
                />
                {schoolSearchResults.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {schoolSearchResults.map((school) => (
                      <button
                        key={school}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, school }));
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
              </div>
              {formData.school && (
                <div className="mt-2 bg-cyan-50 px-4 py-2 rounded-lg flex items-center justify-between">
                  <span className="text-cyan-700 font-medium">{formData.school}</span>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, school: '' }))} className="text-cyan-500 hover:text-cyan-700">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                키
              </label>
              <select
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">선택하세요</option>
                <option value="150 이하">150 이하</option>
                <option value="150~155">150~155</option>
                <option value="155~160">155~160</option>
                <option value="160~165">160~165</option>
                <option value="165~170">165~170</option>
                <option value="170~175">170~175</option>
                <option value="175~180">175~180</option>
                <option value="180~185">180~185</option>
                <option value="185 이상">185 이상</option>
              </select>
            </div>

            {/* 체형 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                체형
              </label>
              <select
                name="bodyType"
                value={formData.bodyType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">선택하세요</option>
                <option value="마른">마른</option>
                <option value="보통">보통</option>
                <option value="통통">통통</option>
                <option value="근육질">근육질</option>
              </select>
            </div>

            {/* 스타일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                스타일
              </label>
              <select
                name="style"
                value={formData.style}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">선택하세요</option>
                <option value="캐주얼">캐주얼</option>
                <option value="모던">모던</option>
                <option value="스트릿">스트릿</option>
                <option value="클래식">클래식</option>
                <option value="스포티">스포티</option>
              </select>
            </div>

            {/* 종교 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종교
              </label>
              <select
                name="religion"
                value={formData.religion}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">선택하세요</option>
                <option value="무교">무교</option>
                <option value="기독교">기독교</option>
                <option value="천주교">천주교</option>
                <option value="불교">불교</option>
                <option value="기타">기타</option>
              </select>
            </div>

            {/* 흡연 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                흡연
              </label>
              <select
                name="smoking"
                value={formData.smoking}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">선택하세요</option>
                <option value="비흡연">비흡연</option>
                <option value="가끔">가끔</option>
                <option value="흡연">흡연</option>
              </select>
            </div>

            {/* 음주 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                음주
              </label>
              <select
                name="drinking"
                value={formData.drinking}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">선택하세요</option>
                <option value="안함">안함</option>
                <option value="가끔">가끔</option>
                <option value="자주">자주</option>
              </select>
            </div>

            {/* 거주지역 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-cyan-500 font-bold">거주지역</span>을 선택해 주세요
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white appearance-none cursor-pointer"
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
                    value={formData.location ? formData.location.split(' ')[1] || '' : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: selectedSido ? `${selectedSido} ${e.target.value}` : '' }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white appearance-none cursor-pointer"
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
                <div className="mt-2 bg-cyan-50 px-4 py-2 rounded-lg flex items-center">
                  <i className="ri-map-pin-line mr-2 text-cyan-500"></i>
                  <span className="text-cyan-700 font-medium">{formData.location}</span>
                </div>
              )}
            </div>

            {/* 관심사 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                관심사
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="관심사 입력 후 추가 버튼 클릭"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={handleAddInterest}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-all"
                >
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 자기소개 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                자기소개
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                placeholder="자신을 소개해주세요"
                rows={4}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {formData.bio.length}/200
              </p>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading || uploading || !formData.name.trim() || !formData.gender}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? '이미지 업로드 중...' : loading ? '가입 중...' : '가입 완료'}
            </button>
          </form>

          {/* 전화번호 정보 */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>전화번호: {state.phoneNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
