/**
 * 아동 안전 표준 페이지
 * Google Play Store 아동 안전 표준 정책 준수를 위한 페이지
 */

import { useNavigate } from 'react-router-dom';

export default function SafetyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="border-b border-gray-100 sticky top-0 z-30 bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center cursor-pointer"
          >
            <i className="ri-arrow-left-line text-2xl text-gray-800"></i>
          </button>
          <h1 className="text-xl font-bold text-gray-900">아동 안전 표준</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* 본문 */}
      <div className="px-5 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 소개 */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-shield-check-line text-2xl text-white"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">아동 안전 보호 정책</h2>
                <p className="text-gray-700 leading-relaxed">
                  어트랙트는 모든 사용자, 특히 아동의 안전을 최우선으로 합니다. 
                  우리는 아동 성적 학대 및 착취(CSAE)를 절대 용납하지 않으며, 
                  이러한 행위를 방지하고 대응하기 위한 강력한 정책과 시스템을 운영하고 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 아동 성적 학대 및 착취(CSAE) 금지 정책 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">1. 아동 성적 학대 및 착취(CSAE) 금지 정책</h2>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl">
              <h3 className="text-lg font-bold text-red-800 mb-3">절대 금지 사항</h3>
              <ul className="space-y-2 text-gray-800">
                <li className="flex items-start">
                  <i className="ri-close-circle-fill text-red-500 text-xl mr-2 mt-0.5"></i>
                  <span>만 18세 미만 아동에 대한 성적 콘텐츠, 이미지, 메시지의 생성, 공유, 요청 또는 게시</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-close-circle-fill text-red-500 text-xl mr-2 mt-0.5"></i>
                  <span>아동을 성적으로 착취하거나 학대하는 모든 형태의 콘텐츠</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-close-circle-fill text-red-500 text-xl mr-2 mt-0.5"></i>
                  <span>아동을 대상으로 한 성적 접근 시도 또는 성적 대화</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-close-circle-fill text-red-500 text-xl mr-2 mt-0.5"></i>
                  <span>아동 성적 학대 자료의 유포 또는 공유</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">서비스 이용 자격</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-line text-green-500 text-xl mr-2 mt-0.5"></i>
                  <span>만 18세 이상의 성인만 서비스를 이용할 수 있습니다.</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-line text-green-500 text-xl mr-2 mt-0.5"></i>
                  <span>회원가입 시 본인 인증을 통해 연령을 확인합니다.</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-line text-green-500 text-xl mr-2 mt-0.5"></i>
                  <span>만 18세 미만으로 확인된 계정은 즉시 삭제됩니다.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 콘텐츠 모니터링 및 신고 시스템 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">2. 콘텐츠 모니터링 및 신고 시스템</h2>
            
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">자동 모니터링</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <i className="ri-shield-star-line text-blue-500 text-xl mr-2 mt-0.5"></i>
                    <span>AI 기반 콘텐츠 필터링 시스템으로 부적절한 콘텐츠를 사전에 차단합니다.</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-shield-star-line text-blue-500 text-xl mr-2 mt-0.5"></i>
                    <span>프로필 사진 및 채팅 메시지를 실시간으로 검사합니다.</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-shield-star-line text-blue-500 text-xl mr-2 mt-0.5"></i>
                    <span>의심스러운 활동 패턴을 자동으로 감지하고 조사합니다.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">신고 시스템</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <i className="ri-flag-line text-orange-500 text-xl mr-2 mt-0.5"></i>
                    <span>사용자는 앱 내에서 부적절한 콘텐츠나 행위를 즉시 신고할 수 있습니다.</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-flag-line text-orange-500 text-xl mr-2 mt-0.5"></i>
                    <span>모든 신고는 24시간 내에 검토되며, 긴급 사안은 즉시 처리됩니다.</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-flag-line text-orange-500 text-xl mr-2 mt-0.5"></i>
                    <span>CSAE 관련 신고는 최우선으로 처리되며, 관련 기관에 즉시 통보됩니다.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 대응 조치 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">3. 위반 시 대응 조치</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">즉시 조치 사항</h3>
              <ul className="space-y-3 text-gray-800">
                <li className="flex items-start">
                  <span className="font-bold text-yellow-700 mr-2">1.</span>
                  <span>위반 계정의 즉시 영구 정지 및 삭제</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-yellow-700 mr-2">2.</span>
                  <span>관련 콘텐츠의 즉시 삭제 및 데이터 보존</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-yellow-700 mr-2">3.</span>
                  <span>법 집행 기관에 즉시 신고 (필요 시)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-yellow-700 mr-2">4.</span>
                  <span>국가인권위원회 및 관련 기관에 통보</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-yellow-700 mr-2">5.</span>
                  <span>피해자 지원 및 상담 서비스 제공</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 사용자 교육 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">4. 사용자 교육 및 인식 제고</h2>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <ul className="space-y-3 text-gray-800">
                <li className="flex items-start">
                  <i className="ri-book-open-line text-green-600 text-xl mr-2 mt-0.5"></i>
                  <span>서비스 이용 시 안전 가이드라인을 제공합니다.</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-book-open-line text-green-600 text-xl mr-2 mt-0.5"></i>
                  <span>정기적인 안전 교육 콘텐츠를 제공합니다.</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-book-open-line text-green-600 text-xl mr-2 mt-0.5"></i>
                  <span>아동 보호에 대한 인식을 높이기 위한 캠페인을 진행합니다.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 연락처 정보 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">5. 신고 및 문의 연락처</h2>
            
            <div className="bg-gray-900 text-white rounded-xl p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">긴급 신고</h3>
                <p className="text-gray-300 mb-3">아동 성적 학대 및 착취 관련 긴급 신고는 다음 기관에 직접 연락하세요:</p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <i className="ri-phone-line text-xl mr-3"></i>
                    <span>경찰청 사이버수사대: <a href="tel:182" className="underline hover:text-blue-300">182</a></span>
                  </li>
                  <li className="flex items-center">
                    <i className="ri-phone-line text-xl mr-3"></i>
                    <span>아동보호전문기관: <a href="tel:1577-1391" className="underline hover:text-blue-300">1577-1391</a></span>
                  </li>
                  <li className="flex items-center">
                    <i className="ri-phone-line text-xl mr-3"></i>
                    <span>여성긴급전화: <a href="tel:1366" className="underline hover:text-blue-300">1366</a></span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-lg font-semibold mb-2">어트랙트 신고 센터</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <i className="ri-mail-line text-xl mr-3"></i>
                    <span>이메일: <a href="mailto:safety@attract.app" className="underline hover:text-blue-300">safety@attract.app</a></span>
                  </li>
                  <li className="flex items-center">
                    <i className="ri-customer-service-2-line text-xl mr-3"></i>
                    <span>앱 내 고객센터: 설정 → 고객센터 → 신고하기</span>
                  </li>
                  <li className="flex items-center">
                    <i className="ri-time-line text-xl mr-3"></i>
                    <span>처리 시간: 24시간 내 응답 (긴급 사안은 즉시 처리)</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 법적 근거 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">6. 법적 근거 및 협력</h2>
            
            <div className="bg-gray-50 rounded-xl p-6 space-y-3 text-gray-700">
              <p>어트랙트는 다음 법률 및 규정을 준수합니다:</p>
              <ul className="space-y-2 ml-4">
                <li className="list-disc">아동·청소년의 성보호에 관한 법률</li>
                <li className="list-disc">정보통신망 이용촉진 및 정보보호 등에 관한 법률</li>
                <li className="list-disc">개인정보보호법</li>
                <li className="list-disc">Google Play 아동 안전 표준 정책</li>
              </ul>
              <p className="mt-4">우리는 법 집행 기관, 아동 보호 기관, 그리고 다른 플랫폼과 협력하여 아동 안전을 보장합니다.</p>
            </div>
          </section>

          {/* 최종 안내 */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8 text-center">
            <i className="ri-shield-check-line text-5xl mb-4"></i>
            <h2 className="text-2xl font-bold mb-3">함께 만들어가는 안전한 커뮤니티</h2>
            <p className="text-blue-100 mb-6">
              어트랙트는 모든 사용자가 안전하게 서비스를 이용할 수 있도록 최선을 다하고 있습니다. 
              아동 안전은 우리 모두의 책임입니다.
            </p>
            <button
              onClick={() => navigate('/support')}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors cursor-pointer"
            >
              신고하기
            </button>
          </div>

          {/* 최종 수정일 */}
          <div className="text-center text-gray-500 text-sm pt-4">
            <p>최종 수정일: 2024년 1월 1일</p>
            <p className="mt-2">이 정책은 법률 및 규정 변경에 따라 업데이트될 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

