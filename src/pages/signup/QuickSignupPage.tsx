import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function QuickSignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    age: '',
    gender: '',
    location: '',
    bio: '',
    profileImage: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 전화번호 포맷팅 (자동 하이픈)
  const formatPhoneInput = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setFormData(prev => ({
      ...prev,
      phoneNumber: formatted
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

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('이미지 업로드 실패:', error);
        throw error;
      }

      // 공개 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    if (!formData.phoneNumber || formData.phoneNumber.length < 13) {
      alert('올바른 전화번호를 입력해주세요.');
      return;
    }

    if (!formData.gender) {
      alert('성별을 선택해주세요.');
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
        }
      }

      // 전화번호 중복 확인
      const cleanedPhone = formData.phoneNumber.replace(/[^\d]/g, '');
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone_number', cleanedPhone)
        .single();

      if (existingUser) {
        alert('이미 등록된 전화번호입니다.');
        setLoading(false);
        return;
      }

      // 유령 회원 생성 (firebase_uid 없이)
      const { data, error } = await supabase
        .from('users')
        .insert({
          phone_number: cleanedPhone,
          name: formData.name.trim(),
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender,
          location: formData.location.trim() || null,
          bio: formData.bio.trim() || null,
          profile_image: imageUrl || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('회원가입 실패:', error);
        alert('회원가입에 실패했습니다. 다시 시도해주세요.');
        setLoading(false);
        return;
      }

      console.log('유령 회원 생성 완료:', data);
      alert(`회원가입 완료!\n이름: ${formData.name}\n전화번호: ${formData.phoneNumber}`);

      // 폼 초기화
      setFormData({
        name: '',
        phoneNumber: '',
        age: '',
        gender: '',
        location: '',
        bio: '',
        profileImage: ''
      });
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert('회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <div className="w-12 h-12 flex items-center justify-center">
                  <i className="ri-user-add-fill text-white text-3xl"></i>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent mb-2">
            빠른 회원가입
          </h1>
          <p className="text-gray-600">인증 없이 바로 가입하기</p>
          <p className="text-xs text-purple-500 mt-2">⚡ 유령 회원 생성 (테스트용)</p>
        </div>

        {/* 회원가입 폼 */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              회원 정보 입력
            </h2>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← 로그인
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="이름을 입력하세요"
                maxLength={20}
                required
              />
            </div>

            {/* 전화번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="010-1234-5678"
                maxLength={13}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                인증 없이 바로 가입됩니다
              </p>
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                  className={`py-3 rounded-xl font-medium transition-all ${
                    formData.gender === 'male'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  남성
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                  className={`py-3 rounded-xl font-medium transition-all ${
                    formData.gender === 'female'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  여성
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, gender: 'other' }))}
                  className={`py-3 rounded-xl font-medium transition-all ${
                    formData.gender === 'other'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  기타
                </button>
              </div>
            </div>

            {/* 지역 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                지역
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="예: 서울, 강남구"
                maxLength={50}
              />
            </div>

            {/* 프로필 이미지 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로필 이미지
              </label>

              {/* 미리보기 */}
              {previewUrl && (
                <div className="mb-3 relative">
                  <img
                    src={previewUrl}
                    alt="미리보기"
                    className="w-32 h-32 object-cover rounded-xl mx-auto border-2 border-purple-200"
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
                <label className="flex-1 bg-purple-50 border-2 border-dashed border-purple-300 rounded-xl px-4 py-3 text-center cursor-pointer hover:bg-purple-100 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <i className="ri-image-add-line text-purple-500 mr-2"></i>
                  <span className="text-sm text-purple-600">
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
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="또는 이미지 URL 입력"
                  disabled={!!selectedFile}
                />
              </div>

              <p className="text-xs text-gray-500 mt-1">
                파일 업로드 또는 URL 입력 (최대 5MB)
              </p>
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
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
              disabled={loading || uploading || !formData.name.trim() || !formData.phoneNumber || !formData.gender}
              className="w-full bg-gradient-to-r from-purple-500 to-rose-500 text-white py-4 rounded-xl font-medium hover:from-purple-600 hover:to-rose-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? '이미지 업로드 중...' : loading ? '가입 중...' : '빠른 가입 완료'}
            </button>
          </form>

          {/* 안내 메시지 */}
          <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
            <p className="text-xs text-purple-700">
              <i className="ri-information-fill mr-1"></i>
              이 페이지는 전화번호 인증 없이 회원을 생성합니다. 테스트 및 유령 회원 생성용입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
