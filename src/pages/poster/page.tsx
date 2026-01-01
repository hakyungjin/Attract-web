import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

/**
 * 포스터 템플릿 타입
 */
type PosterTemplate = 'instagram' | 'facebook' | 'twitter' | 'story' | 'banner';

/**
 * 포스터 템플릿 크기 설정
 */
const templateSizes: Record<PosterTemplate, { width: number; height: number; name: string }> = {
  instagram: { width: 1080, height: 1080, name: '인스타그램 정사각형' },
  facebook: { width: 1200, height: 630, name: '페이스북 공유' },
  twitter: { width: 1200, height: 675, name: '트위터 카드' },
  story: { width: 1080, height: 1920, name: '스토리 (세로)' },
  banner: { width: 1920, height: 600, name: '배너 (가로)' },
};

/**
 * 홍보용 포스터 생성 페이지
 * 다양한 소셜 미디어 플랫폼에 맞는 포스터를 생성하고 이미지로 다운로드할 수 있습니다.
 */
export default function PosterPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<PosterTemplate>('instagram');
  const [isDownloading, setIsDownloading] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  /**
   * 포스터를 이미지로 다운로드하는 함수
   */
  const handleDownload = async () => {
    if (!posterRef.current) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // 고해상도
        logging: false,
        useCORS: true,
      });

      // Canvas를 이미지로 변환
      const imageUrl = canvas.toDataURL('image/png');
      
      // 다운로드 링크 생성
      const link = document.createElement('a');
      link.download = `attract-poster-${selectedTemplate}-${Date.now()}.png`;
      link.href = imageUrl;
      link.click();

      alert('포스터가 다운로드되었습니다!');
    } catch (error) {
      console.error('포스터 생성 실패:', error);
      alert('포스터 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsDownloading(false);
    }
  };

  const template = templateSizes[selectedTemplate];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">홍보 포스터 생성</h1>
          <p className="text-gray-600">소셜 미디어에 공유할 포스터를 생성하세요</p>
        </div>

        {/* 템플릿 선택 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">템플릿 선택</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(templateSizes).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedTemplate(key as PosterTemplate)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTemplate === key
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="font-medium text-sm mb-1">{value.name}</div>
                <div className="text-xs text-gray-500">
                  {value.width} × {value.height}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 포스터 미리보기 및 다운로드 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">포스터 미리보기</h2>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDownloading ? '생성 중...' : '이미지 다운로드'}
            </button>
          </div>

          {/* 포스터 컨테이너 */}
          <div className="flex justify-center overflow-auto bg-gray-100 p-4 rounded-lg">
            <div
              ref={posterRef}
              className="bg-white shadow-2xl"
              style={{
                width: `${template.width * 0.3}px`,
                height: `${template.height * 0.3}px`,
                position: 'relative',
              }}
            >
              {/* 실제 포스터 내용 */}
              <PosterContent template={selectedTemplate} />
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4 text-center">
            * 미리보기는 축소된 크기입니다. 다운로드된 이미지는 원본 해상도입니다.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 포스터 내용 컴포넌트
 */
function PosterContent({ template }: { template: PosterTemplate }) {
  const isVertical = template === 'story';
  const isBanner = template === 'banner';

  return (
    <div
      className={`w-full h-full flex flex-col ${
        isVertical ? 'justify-between' : 'justify-center'
      } items-center text-center p-8`}
      style={{
        background: isBanner
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
      }}
    >
      {/* 로고/제목 영역 */}
      <div className="mb-6">
        <h1
          className={`font-bold text-white mb-2 ${
            isVertical ? 'text-6xl' : isBanner ? 'text-7xl' : 'text-5xl'
          }`}
          style={{ fontFamily: 'Pacifico, cursive' }}
        >
          어트랙트
        </h1>
        <p
          className={`text-white opacity-90 ${
            isVertical ? 'text-2xl' : isBanner ? 'text-3xl' : 'text-xl'
          }`}
        >
          새로운 인연을 만나보세요
        </p>
      </div>

      {/* 주요 기능 설명 */}
      <div
        className={`grid gap-4 mb-6 ${
          isVertical ? 'grid-cols-1' : 'grid-cols-3'
        } ${isBanner ? 'w-full max-w-4xl' : 'w-full max-w-2xl'}`}
      >
        <FeatureCard
          icon="💕"
          title="스마트 매칭"
          description="AI 기반 매칭으로 나에게 맞는 인연을 찾아보세요"
          isVertical={isVertical}
          isBanner={isBanner}
        />
        <FeatureCard
          icon="💬"
          title="실시간 채팅"
          description="매칭된 상대와 바로 대화를 시작하세요"
          isVertical={isVertical}
          isBanner={isBanner}
        />
        <FeatureCard
          icon="👥"
          title="커뮤니티"
          description="다양한 사람들과 소통하고 정보를 공유하세요"
          isVertical={isVertical}
          isBanner={isBanner}
        />
      </div>

      {/* CTA 영역 */}
      <div className="mt-auto">
        <div
          className={`bg-white text-cyan-600 rounded-full px-8 py-4 inline-block shadow-lg ${
            isVertical ? 'text-2xl' : isBanner ? 'text-3xl' : 'text-xl'
          } font-bold`}
        >
          지금 시작하기 →
        </div>
        <p
          className={`text-white mt-4 opacity-80 ${
            isVertical ? 'text-xl' : isBanner ? 'text-2xl' : 'text-lg'
          }`}
        >
          attract--web.web.app
        </p>
      </div>
    </div>
  );
}

/**
 * 기능 카드 컴포넌트
 */
function FeatureCard({
  icon,
  title,
  description,
  isVertical,
  isBanner,
}: {
  icon: string;
  title: string;
  description: string;
  isVertical: boolean;
  isBanner: boolean;
}) {
  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 text-white">
      <div
        className={`mb-2 ${isVertical ? 'text-5xl' : isBanner ? 'text-6xl' : 'text-4xl'}`}
      >
        {icon}
      </div>
      <h3
        className={`font-bold mb-1 ${
          isVertical ? 'text-2xl' : isBanner ? 'text-3xl' : 'text-xl'
        }`}
      >
        {title}
      </h3>
      <p
        className={`opacity-90 ${
          isVertical ? 'text-lg' : isBanner ? 'text-xl' : 'text-sm'
        }`}
      >
        {description}
      </p>
    </div>
  );
}

