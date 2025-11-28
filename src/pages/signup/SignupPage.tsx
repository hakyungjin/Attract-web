import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createUserProfile } from '../../services/phoneAuth';

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
    bio: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    setLoading(true);

    try {
      const { data, error } = await createUserProfile(
        state.firebaseUid,
        state.phoneNumber,
        {
          name: formData.name.trim(),
          age: formData.age ? parseInt(formData.age) : undefined,
          gender: formData.gender,
          location: formData.location.trim() || undefined,
          bio: formData.bio.trim() || undefined
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <div className="w-12 h-12 flex items-center justify-center">
                  <i className="ri-heart-fill text-white text-3xl"></i>
                </div>
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
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                  className={`py-3 rounded-xl font-medium transition-all ${
                    formData.gender === 'male'
                      ? 'bg-cyan-500 text-white'
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
                      ? 'bg-cyan-500 text-white'
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
                      ? 'bg-cyan-500 text-white'
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="예: 서울, 강남구"
                maxLength={50}
              />
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
              disabled={loading || !formData.name.trim() || !formData.gender}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '가입 중...' : '가입 완료'}
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
