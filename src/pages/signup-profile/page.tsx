import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

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
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // 회원가입 후 전달된 사용자 정보 로드
  useEffect(() => {
    const phoneNumber = (location.state as any)?.phoneNumber;
    if (phoneNumber) {
      const loadUserData = async () => {
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('phone_number', phoneNumber)
          .single();

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
  };

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

  const handleLocationSelect = (city: string, district: string) => {
    setFormData(prev => ({
      ...prev,
      location: `${city} ${district}`
    }));
    setShowLocationModal(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('파일 선택:', file.name, file.type, file.size);

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
      const fileName = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('업로드 시작:', fileName);

      const { error: uploadError, data } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      console.log('업로드 결과:', { error: uploadError, data });

      if (uploadError) {
        let errorMsg = uploadError.message || '알 수 없는 오류';

        // Bucket not found 오류 처리
        if (errorMsg.includes('Bucket not found')) {
          errorMsg = '⚠️ Supabase Storage가 제대로 설정되지 않았습니다.\n관리자에게 문의해주세요.\n\n기술 정보: "user-profiles" bucket이 없습니다.';
        } else if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
          errorMsg = '⚠️ 인증 오류: Supabase 설정을 확인해주세요.';
        }

        alert('이미지 업로드 실패: ' + errorMsg);
        console.error('업로드 에러 상세:', uploadError);
        return;
      }

      // 공개 URL 생성 - Supabase 기본 형식
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/profile-images/${fileName}`;

      console.log('생성된 공개 URL:', publicUrl);
      setUploadedImageUrl(publicUrl);
      alert('이미지가 업로드되었습니다!');
    } catch (error: any) {
      console.error('업로드 중 오류:', error);
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
    console.log('프로필 저장:', { uploadedImageUrl, profile_image: formData.profile_image });

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
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
          profile_completed: true, // 프로필 완성 표시
        })
        .eq('phone_number', formData.phone_number);

      if (error) {
        alert('프로필 저장 실패: ' + error.message);
        console.error('저장 에러:', error);
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
            <input
              type="text"
              value={formData.mbti}
              onChange={(e) => setFormData(prev => ({ ...prev, mbti: e.target.value.toUpperCase() }))}
              placeholder="예: ENFP"
              maxLength={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* 지역 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              지역
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-700 hover:border-cyan-500 transition-colors cursor-pointer"
              >
                {formData.location || '지역 선택'}
              </button>
            </div>

            {/* 지역 선택 모달 */}
            {showLocationModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-96 overflow-y-auto">
                  <h3 className="text-lg font-bold mb-4">지역 선택</h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {Object.entries(locationData).map(([city, districts]) => (
                      <div key={city}>
                        <h4 className="font-semibold text-gray-800 py-2">{city}</h4>
                        <div className="grid grid-cols-2 gap-2 ml-2">
                          {districts.slice(0, 10).map(district => (
                            <button
                              key={district}
                              onClick={() => handleLocationSelect(city, district)}
                              className="text-left px-3 py-2 bg-gray-100 hover:bg-cyan-200 rounded-lg text-sm transition-colors cursor-pointer"
                            >
                              {district}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowLocationModal(false)}
                    className="w-full mt-4 px-4 py-3 bg-gray-200 rounded-xl cursor-pointer"
                  >
                    닫기
                  </button>
                </div>
              </div>
            )}
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

          {/* 학교 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              학교
            </label>
            <input
              type="text"
              value={formData.school}
              onChange={(e) => setFormData(prev => ({ ...prev, school: e.target.value }))}
              placeholder="학교명"
              maxLength={50}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* 직업 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              직업
            </label>
            <input
              type="text"
              value={formData.job}
              onChange={(e) => setFormData(prev => ({ ...prev, job: e.target.value }))}
              placeholder="직업"
              maxLength={50}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500"
            />
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
