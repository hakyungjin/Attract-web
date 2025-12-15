import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { hashPassword } from '../../services/passwordService';
import { uploadImage } from '../../services/imageUpload';
import { KOREA_LOCATIONS, getSigunguList } from '../../constants/locations';
import { searchSchools } from '../../constants/schools';

export default function QuickSignupPage() {
  const navigate = useNavigate();

  // 전체 필드 (빠른 가입용 - 모든 정보 입력 가능)
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    password: '',
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
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  
  // 지역/학교 선택 상태
  const [selectedSido, setSelectedSido] = useState('');
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [schoolSearchResults, setSchoolSearchResults] = useState<string[]>([]);

  const mbtiOptions = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
  const heightOptions = ['150~155', '155~160', '160~165', '165~170', '170~175', '175~180', '180~185', '185~190'];
  const bodyTypeOptions = ['마른', '보통', '통통', '근육질', '건장한'];
  const styleOptions = ['캐주얼', '스포티', '모던', '클래식', '스트릿', '페미닌'];
  const religionOptions = ['무교', '기독교', '천주교', '불교', '원불교', '기타'];
  const smokingOptions = ['비흡연', '흡연'];
  const drinkingOptions = ['안 마심', '가끔', '자주'];

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

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 이미지 업로드
  const uploadImageFile = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    try {
      // Firebase Storage에 업로드
      const publicUrl = await uploadImage(selectedFile, 'avatars');
      return publicUrl;
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      return null;
    }
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

    if (!formData.password || formData.password.length < 4) {
      alert('비밀번호는 4자 이상이어야 합니다.');
      return;
    }

    if (!formData.gender) {
      alert('성별을 선택해주세요.');
      return;
    }

    if (!selectedFile) {
      alert('프로필 사진을 업로드해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 이미지 업로드
      const imageUrl = await uploadImageFile();
      if (!imageUrl) {
        alert('이미지 업로드에 실패했습니다.');
        setLoading(false);
        return;
      }

      // 전화번호 중복 확인
      const cleanedPhone = formData.phoneNumber.replace(/[^\d]/g, '');
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone_number', cleanedPhone)
        .maybeSingle();

      if (existingUser) {
        alert('이미 등록된 전화번호입니다.');
        setLoading(false);
        return;
      }

      // 비밀번호 해싱
      const hashedPassword = await hashPassword(formData.password);

      // 회원 생성 (is_ghost = true로 유령 회원 표시)
      const { data, error } = await supabase
        .from('users')
        .insert({
          phone_number: cleanedPhone,
          password_hash: hashedPassword,
          name: formData.name.trim(),
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender,
          location: formData.location.trim() || null,
          bio: formData.bio.trim() || null,
          mbti: formData.mbti.toUpperCase() || null,
          school: formData.school.trim() || null,
          height: formData.height || null,
          body_type: formData.bodyType || null,
          style: formData.style || null,
          religion: formData.religion || null,
          smoking: formData.smoking || null,
          drinking: formData.drinking || null,
          interests: interests.length > 0 ? interests : null,
          profile_image: imageUrl,
          is_ghost: true,
          profile_completed: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('회원가입 실패:', error);
        alert('회원가입에 실패했습니다.');
        setLoading(false);
        return;
      }

      console.log('회원 생성 완료:', data);
      alert(`회원가입 완료!\n${formData.name}님 환영합니다!`);

      // 폼 초기화
      setFormData({
        name: '',
        phoneNumber: '',
        password: '',
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
      });
      setSelectedFile(null);
      setPreviewUrl('');
      setInterests([]);
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert('회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-4 px-4">
      <div className="w-full max-w-md mx-auto">
        {/* 로고 */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent mb-1">
            ⚡ 빠른 회원가입
          </h1>
          <p className="text-xs text-gray-500">테스트용 유령 회원 생성 (모든 필드)</p>
        </div>

        {/* 회원가입 폼 */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-800">👻 유령 회원 정보</h2>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              ← 돌아가기
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* 프로필 사진 */}
            <div className="flex justify-center mb-2">
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="미리보기" className="w-20 h-20 object-cover rounded-full border-2 border-purple-300" />
                  <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(''); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">✕</button>
                </div>
              ) : (
                <label className="w-20 h-20 bg-purple-50 border-2 border-dashed border-purple-300 rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-purple-100">
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  <i className="ri-camera-line text-purple-500 text-lg"></i>
                  <span className="text-[10px] text-purple-600">사진*</span>
                </label>
              )}
            </div>

            {/* 이름 + 나이 */}
            <div className="grid grid-cols-2 gap-2">
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="이름 *" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required />
              <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="나이" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" min="18" max="100" />
            </div>

            {/* 전화번호 */}
            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handlePhoneChange} placeholder="전화번호 * (010-1234-5678)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" maxLength={13} required />
            
            {/* 비밀번호 */}
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="비밀번호 * (4자 이상)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" minLength={4} required />

            {/* 성별 */}
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))} className={`py-2 rounded-lg text-sm font-medium transition-all ${formData.gender === 'male' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}>남자</button>
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))} className={`py-2 rounded-lg text-sm font-medium transition-all ${formData.gender === 'female' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}>여자</button>
            </div>

            {/* 학교 검색 */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">학교/직업</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={schoolSearchQuery || formData.school}
                  onChange={(e) => {
                    setSchoolSearchQuery(e.target.value);
                    setSchoolSearchResults(searchSchools(e.target.value, 5));
                  }}
                  placeholder="학교 또는 직업 검색" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                />
                {schoolSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {schoolSearchResults.map((school) => (
                      <button
                        key={school}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, school }));
                          setSchoolSearchQuery('');
                          setSchoolSearchResults([]);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 border-b border-gray-100 last:border-b-0"
                      >
                        {school}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 지역 선택 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <select
                  value={selectedSido}
                  onChange={(e) => {
                    setSelectedSido(e.target.value);
                    setFormData(prev => ({ ...prev, location: '' }));
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white appearance-none"
                >
                  <option value="">시/도 선택</option>
                  {KOREA_LOCATIONS.map((loc) => (
                    <option key={loc.sido} value={loc.sido}>{loc.sido.replace('특별시', '').replace('광역시', '').replace('특별자치시', '').replace('특별자치도', '').replace('도', '')}</option>
                  ))}
                </select>
                <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm"></i>
              </div>
              <div className="relative">
                <select
                  value={formData.location ? formData.location.split(' ')[1] || '' : ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: selectedSido ? `${selectedSido} ${e.target.value}` : '' }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white appearance-none"
                  disabled={!selectedSido}
                >
                  <option value="">구/군 선택</option>
                  {selectedSido && getSigunguList(selectedSido).map((sigungu) => (
                    <option key={sigungu} value={sigungu}>{sigungu}</option>
                  ))}
                </select>
                <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm"></i>
              </div>
            </div>

            {/* MBTI */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">MBTI</label>
              <div className="flex flex-wrap gap-1">
                {mbtiOptions.map(m => (
                  <button key={m} type="button" onClick={() => setFormData(prev => ({ ...prev, mbti: m }))} className={`px-2 py-1 rounded text-xs transition-all ${formData.mbti === m ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{m}</button>
                ))}
              </div>
            </div>

            {/* 키 */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">키</label>
              <div className="flex flex-wrap gap-1">
                {heightOptions.map(h => (
                  <button key={h} type="button" onClick={() => setFormData(prev => ({ ...prev, height: h }))} className={`px-2 py-1 rounded text-xs transition-all ${formData.height === h ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{h}</button>
                ))}
              </div>
            </div>

            {/* 체형 */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">체형</label>
              <div className="flex flex-wrap gap-1">
                {bodyTypeOptions.map(b => (
                  <button key={b} type="button" onClick={() => setFormData(prev => ({ ...prev, bodyType: b }))} className={`px-2 py-1 rounded text-xs transition-all ${formData.bodyType === b ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{b}</button>
                ))}
              </div>
            </div>

            {/* 스타일 */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">스타일</label>
              <div className="flex flex-wrap gap-1">
                {styleOptions.map(s => (
                  <button key={s} type="button" onClick={() => setFormData(prev => ({ ...prev, style: s }))} className={`px-2 py-1 rounded text-xs transition-all ${formData.style === s ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{s}</button>
                ))}
              </div>
            </div>

            {/* 종교 */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">종교</label>
              <div className="flex flex-wrap gap-1">
                {religionOptions.map(r => (
                  <button key={r} type="button" onClick={() => setFormData(prev => ({ ...prev, religion: r }))} className={`px-2 py-1 rounded text-xs transition-all ${formData.religion === r ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{r}</button>
                ))}
              </div>
            </div>

            {/* 흡연/음주 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">흡연</label>
                <div className="flex gap-1">
                  {smokingOptions.map(s => (
                    <button key={s} type="button" onClick={() => setFormData(prev => ({ ...prev, smoking: s }))} className={`px-2 py-1 rounded text-xs flex-1 transition-all ${formData.smoking === s ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">음주</label>
                <div className="flex gap-1">
                  {drinkingOptions.map(d => (
                    <button key={d} type="button" onClick={() => setFormData(prev => ({ ...prev, drinking: d }))} className={`px-2 py-1 rounded text-xs flex-1 transition-all ${formData.drinking === d ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{d}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* 관심사 */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">관심사</label>
              <div className="flex gap-1 mb-1">
                <input type="text" value={newInterest} onChange={e => setNewInterest(e.target.value)} onKeyPress={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterest(); }}} placeholder="관심사 추가" className="flex-1 min-w-0 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <button type="button" onClick={handleAddInterest} className="flex-shrink-0 px-3 py-1.5 bg-purple-500 text-white rounded text-xs hover:bg-purple-600">추가</button>
              </div>
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {interests.map((i, idx) => (
                    <span key={idx} className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                      {i} <button type="button" onClick={() => setInterests(interests.filter((_, j) => j !== idx))} className="text-purple-500 hover:text-purple-700">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 자기소개 */}
            <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="자기소개" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500" rows={2} maxLength={200} />

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading || !formData.name.trim() || !formData.phoneNumber || !formData.gender || !formData.password || !selectedFile}
              className="w-full bg-gradient-to-r from-purple-500 to-rose-500 text-white py-3 rounded-xl font-medium hover:from-purple-600 hover:to-rose-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '가입 중...' : '👻 유령 회원 생성'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
