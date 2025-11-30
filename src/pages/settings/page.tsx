import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
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
                    <h1 className="text-lg font-bold">설정</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            {/* 설정 목록 */}
            <div className="px-4 py-6 space-y-4">
                {/* 계정 설정 */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <h2 className="text-sm font-bold text-gray-500 px-4 pt-4 pb-2">계정 설정</h2>
                    <div className="divide-y">
                        <button onClick={() => navigate('/profile-edit')} className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-center space-x-3">
                                <i className="ri-user-line text-xl text-gray-600"></i>
                                <span className="font-medium text-gray-800">프로필 수정</span>
                            </div>
                            <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
                        </button>
                        <button onClick={() => alert('비밀번호 변경 기능 준비중입니다.')} className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-center space-x-3">
                                <i className="ri-lock-line text-xl text-gray-600"></i>
                                <span className="font-medium text-gray-800">비밀번호 변경</span>
                            </div>
                            <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
                        </button>
                    </div>
                </div>

                {/* 알림 설정 */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <h2 className="text-sm font-bold text-gray-500 px-4 pt-4 pb-2">알림 설정</h2>
                    <div className="divide-y">
                        <div className="flex items-center justify-between px-4 py-4">
                            <div className="flex items-center space-x-3">
                                <i className="ri-notification-line text-xl text-gray-600"></i>
                                <span className="font-medium text-gray-800">푸시 알림</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between px-4 py-4">
                            <div className="flex items-center space-x-3">
                                <i className="ri-mail-line text-xl text-gray-600"></i>
                                <span className="font-medium text-gray-800">이메일 알림</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* 개인정보 */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <h2 className="text-sm font-bold text-gray-500 px-4 pt-4 pb-2">개인정보</h2>
                    <div className="divide-y">
                        <button onClick={() => alert('개인정보 처리방침 페이지 준비중입니다.')} className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-center space-x-3">
                                <i className="ri-shield-check-line text-xl text-gray-600"></i>
                                <span className="font-medium text-gray-800">개인정보 처리방침</span>
                            </div>
                            <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
                        </button>
                        <button onClick={() => alert('이용약관 페이지 준비중입니다.')} className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-center space-x-3">
                                <i className="ri-file-text-line text-xl text-gray-600"></i>
                                <span className="font-medium text-gray-800">이용약관</span>
                            </div>
                            <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
                        </button>
                    </div>
                </div>

                {/* 기타 */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <h2 className="text-sm font-bold text-gray-500 px-4 pt-4 pb-2">기타</h2>
                    <div className="divide-y">
                        <button onClick={() => alert('Attract v1.0.0\n매력적인 만남을 위한 소셜 플랫폼')} className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-center space-x-3">
                                <i className="ri-information-line text-xl text-gray-600"></i>
                                <span className="font-medium text-gray-800">앱 정보</span>
                            </div>
                            <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
                        </button>
                        <button onClick={() => {
                            if (window.confirm('정말로 회원 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')) {
                                alert('회원 탈퇴 기능 준비중입니다. 고객센터로 문의해주세요.');
                            }
                        }} className="w-full flex items-center justify-between px-4 py-4 hover:bg-red-50 transition-colors cursor-pointer text-red-500">
                            <div className="flex items-center space-x-3">
                                <i className="ri-delete-bin-line text-xl"></i>
                                <span className="font-medium">회원 탈퇴</span>
                            </div>
                            <i className="ri-arrow-right-s-line text-xl"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
