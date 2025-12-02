import { useEffect, useRef } from 'react';

interface KakaoAdFitProps {
  unit: string; // 광고 단위 ID
  width?: number;
  height?: number;
  className?: string;
}

/**
 * 카카오 애드핏 광고 컴포넌트
 * 
 * 사용법:
 * 1. https://adfit.kakao.com 에서 광고 단위 생성
 * 2. 발급받은 unit ID를 props로 전달
 * 
 * 예시:
 * <KakaoAdFit unit="DAN-XXXXXXXXXX" width={320} height={100} />
 */
export default function KakaoAdFit({ 
  unit, 
  width = 320, 
  height = 100,
  className = ''
}: KakaoAdFitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    // 이미 로드된 경우 스킵
    if (isLoaded.current) return;

    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/kas/static/ba.min.js';
    script.async = true;

    script.onload = () => {
      isLoaded.current = true;
    };

    // 스크립트가 이미 있는지 확인
    const existingScript = document.querySelector('script[src="https://t1.daumcdn.net/kas/static/ba.min.js"]');
    if (!existingScript) {
      document.head.appendChild(script);
    }

    return () => {
      // 클린업 시 광고 영역 초기화
      if (adRef.current) {
        adRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className={`flex justify-center ${className}`}>
      <ins
        ref={adRef as any}
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={unit}
        data-ad-width={width.toString()}
        data-ad-height={height.toString()}
      />
    </div>
  );
}

/**
 * 테스트용 더미 광고 배너
 * 실제 광고 승인 전까지 UI 확인용
 */
export function DummyAdBanner({ 
  width = 320, 
  height = 100,
  className = '',
  text = '광고 영역'
}: { 
  width?: number; 
  height?: number;
  className?: string;
  text?: string;
}) {
  return (
    <div 
      className={`flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl border-2 border-dashed border-gray-300 ${className}`}
      style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
    >
      <div className="text-center">
        <i className="ri-advertisement-line text-2xl text-gray-400 mb-1"></i>
        <p className="text-xs text-gray-500">{text}</p>
      </div>
    </div>
  );
}
