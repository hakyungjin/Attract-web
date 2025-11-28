import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SupportPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        category: '매칭',
        title: '',
        content: '',
        email: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleBack = () => {
        navigate(-1);
    };

    const categories = ['매칭', '결제', '프로필', '기술 문제', '기타'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            alert('제목과 내용을 입력해주세요.');
            return;
        }

        setIsSubmitting(true);

        // TODO: 실제 API 호출
        setTimeout(() => {
            setIsSubmitting(false);
            setShowSuccessModal(true);

            // 3초 후 자동으로 뒤로가기
            setTimeout(() => {
                setShowSuccessModal(false);
                navigate(-1);
            }, 3000);
        }, 1000);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* 헤더 */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="flex items-center justify-between px-4 py-4">
                    <button
                        onClick={handleBack}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <i className="ri-arrow-left-line text-xl"></i>
                    </button>
                    <h1 className="text-lg font-bold">1:1 문의</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            {/* 안내 메시지 */}
            <div className="px-4 py-6">
                <div className="bg-cyan-50 rounded-2xl p-4 mb-6">
                    <div className="flex items-start space-x-3">
                        <i className="ri-information-line text-cyan-500 text-xl mt-0.5"></i>
                        <div>
                            <h3 className="font-bold text-cyan-900 mb-1">문의 전 확인해주세요</h3>
                            <p className="text-sm text-cyan-700">
                                자주 묻는 질문(FAQ)에서 답변을 먼저 확인하시면 더 빠르게 해결하실 수 있습니다.
                            </p>
                            <button
                                onClick={() => navigate('/faq')}
                                className="mt-2 text-sm font-medium text-cyan-600 hover:text-cyan-700 underline"
                            >
                                FAQ 바로가기 →
                            </button>
                        </div>
                    </div>
                </div>

                {/* 문의 폼 */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 카테고리 선택 */}
                    <div className="bg-white rounded-2xl shadow-sm p-4">
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                            문의 유형 <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => handleInputChange('category', category)}
                                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${formData.category === category
                                            ? 'bg-cyan-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 이메일 */}
                    <div className="bg-white rounded-2xl shadow-sm p-4">
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                            답변 받을 이메일
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="example@email.com"
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-cyan-500 focus:outline-none transition-colors"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            입력하지 않으면 등록된 이메일로 답변이 전송됩니다.
                        </p>
                    </div>

                    {/* 제목 */}
                    <div className="bg-white rounded-2xl shadow-sm p-4">
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                            제목 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder="문의 제목을 입력해주세요"
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-cyan-500 focus:outline-none transition-colors"
                            maxLength={100}
                        />
                        <div className="text-xs text-gray-400 mt-2 text-right">
                            {formData.title.length}/100
                        </div>
                    </div>

                    {/* 내용 */}
                    <div className="bg-white rounded-2xl shadow-sm p-4">
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                            문의 내용 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => handleInputChange('content', e.target.value)}
                            placeholder="문의 내용을 자세히 작성해주세요"
                            rows={8}
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                            maxLength={1000}
                        />
                        <div className="text-xs text-gray-400 mt-2 text-right">
                            {formData.content.length}/1000
                        </div>
                    </div>

                    {/* 제출 버튼 */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 rounded-2xl font-bold text-white transition-all ${isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center">
                                <i className="ri-loader-4-line animate-spin mr-2"></i>
                                전송 중...
                            </span>
                        ) : (
                            '문의하기'
                        )}
                    </button>
                </form>

                {/* 운영 시간 안내 */}
                <div className="mt-6 bg-white rounded-2xl shadow-sm p-4">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                        <i className="ri-time-line text-cyan-500 mr-2"></i>
                        고객센터 운영 시간
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                            <span>평일</span>
                            <span className="font-medium">09:00 - 18:00</span>
                        </div>
                        <div className="flex justify-between">
                            <span>주말 및 공휴일</span>
                            <span className="font-medium text-gray-400">휴무</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 pt-3 border-t">
                            * 문의 접수 후 영업일 기준 1-2일 이내에 답변드립니다.
                        </p>
                    </div>
                </div>
            </div>

            {/* 성공 모달 */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center animate-slide-up">
                        <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="ri-check-line text-white text-3xl"></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">문의가 접수되었습니다</h3>
                        <p className="text-gray-600 mb-4">
                            빠른 시일 내에 답변드리겠습니다.<br />
                            감사합니다.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
