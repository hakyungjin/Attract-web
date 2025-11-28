import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

export default function FAQPage() {
    const navigate = useNavigate();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('전체');

    const handleBack = () => {
        navigate(-1);
    };

    const categories = ['전체', '매칭', '결제', '프로필', '기타'];

    const faqs: FAQItem[] = [
        {
            category: '매칭',
            question: '매칭은 어떻게 이루어지나요?',
            answer: '서로 좋아요를 누르면 매칭이 성사됩니다. 매칭이 되면 채팅을 시작할 수 있습니다.'
        },
        {
            category: '매칭',
            question: '매칭을 취소할 수 있나요?',
            answer: '매칭 관리 페이지에서 매칭을 취소할 수 있습니다. 단, 취소 후에는 다시 매칭하려면 상대방이 다시 좋아요를 눌러야 합니다.'
        },
        {
            category: '결제',
            question: '자석은 어떻게 구매하나요?',
            answer: '상단의 자석 아이콘을 클릭하면 자석 상점으로 이동합니다. 다양한 패키지 중 선택하여 구매할 수 있습니다.'
        },
        {
            category: '결제',
            question: '환불이 가능한가요?',
            answer: '구매 후 7일 이내에 사용하지 않은 자석에 한해 환불이 가능합니다. 고객센터로 문의해주세요.'
        },
        {
            category: '프로필',
            question: '프로필 사진은 몇 장까지 등록할 수 있나요?',
            answer: '최대 6장까지 등록할 수 있습니다. 다양한 사진을 등록하면 매칭 확률이 높아집니다.'
        },
        {
            category: '프로필',
            question: '프로필 정보를 수정하려면 어떻게 하나요?',
            answer: '프로필 탭에서 "프로필 수정하기" 버튼을 클릭하면 정보를 수정할 수 있습니다.'
        },
        {
            category: '기타',
            question: '신고는 어떻게 하나요?',
            answer: '부적절한 행동을 하는 사용자를 발견하면 프로필 상세 페이지에서 신고할 수 있습니다.'
        },
        {
            category: '기타',
            question: '회원 탈퇴는 어떻게 하나요?',
            answer: '설정 > 회원 탈퇴 메뉴에서 탈퇴할 수 있습니다. 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.'
        }
    ];

    const filteredFAQs = selectedCategory === '전체'
        ? faqs
        : faqs.filter(faq => faq.category === selectedCategory);

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
                    <h1 className="text-lg font-bold">자주 묻는 질문</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            {/* 카테고리 필터 */}
            <div className="bg-white px-4 py-3 border-b">
                <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${selectedCategory === category
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* FAQ 목록 */}
            <div className="px-4 py-6 space-y-3">
                {filteredFAQs.length === 0 ? (
                    <div className="text-center py-16">
                        <i className="ri-question-line text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500">해당 카테고리에 질문이 없습니다.</p>
                    </div>
                ) : (
                    filteredFAQs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all"
                        >
                            <button
                                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                                className="w-full flex items-start justify-between px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                            >
                                <div className="flex-1 pr-4">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-xs font-medium text-cyan-500 bg-cyan-50 px-2 py-1 rounded">
                                            {faq.category}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-800">{faq.question}</h3>
                                </div>
                                <i className={`ri-arrow-down-s-line text-xl text-gray-400 transition-transform ${expandedIndex === index ? 'rotate-180' : ''
                                    }`}></i>
                            </button>

                            {expandedIndex === index && (
                                <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
                                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* 추가 문의 안내 */}
            <div className="px-4 pb-6">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white text-center">
                    <i className="ri-customer-service-line text-4xl mb-3"></i>
                    <h3 className="font-bold text-lg mb-2">찾으시는 답변이 없나요?</h3>
                    <p className="text-sm text-white/80 mb-4">1:1 문의를 통해 도움을 받으세요</p>
                    <button
                        onClick={() => navigate('/support')}
                        className="bg-white text-cyan-500 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        1:1 문의하기
                    </button>
                </div>
            </div>
        </div>
    );
}
