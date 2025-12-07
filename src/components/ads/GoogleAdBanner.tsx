import { useEffect, useRef } from 'react';

interface GoogleAdBannerProps {
  adSlot: string;           // 광고 슬롯 ID
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
  maxHeight?: number;       // 최대 높이 (px)
  compact?: boolean;        // 컴팩트 모드
}

/**
 * 구글 애드센스 배너 컴포넌트
 * 
 * 사용법:
 * <GoogleAdBanner adSlot="1234567890" />
 * 
 * 주의: 
 * 1. index.html에 AdSense 스크립트 추가 필요
 * 2. AdSense 계정에서 사이트 승인 필요
 */
export default function GoogleAdBanner({ 
  adSlot, 
  adFormat = 'auto',
  fullWidthResponsive = true,
  style,
  className = '',
  maxHeight,
  compact = false
}: GoogleAdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    // 이미 로드된 경우 스킵
    if (isAdLoaded.current) return;

    try {
      // 광고 로드
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
      isAdLoaded.current = true;
    } catch (error) {
      console.error('AdSense 로드 오류:', error);
    }
  }, []);

  // 컴팩트 모드일 경우 높이 제한
  const containerStyle: React.CSSProperties = {
    ...style,
    ...(maxHeight && { maxHeight: `${maxHeight}px`, overflow: 'hidden' }),
    ...(compact && { maxHeight: '100px', overflow: 'hidden' })
  };

  return (
    <div 
      className={`ad-container ${className} ${compact ? 'rounded-xl' : ''}`} 
      style={containerStyle}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ 
          display: 'block',
          ...(compact && { minHeight: '50px', maxHeight: '100px' })
        }}
        data-ad-client="ca-pub-1974148424688527"
        data-ad-slot={adSlot}
        data-ad-format={compact ? 'horizontal' : adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
}

/**
 * 인피드 광고 (목록 사이에 표시)
 */
export function InFeedAd({ adSlot }: { adSlot: string }) {
  return (
    <GoogleAdBanner 
      adSlot={adSlot} 
      adFormat="fluid"
      className="my-4"
    />
  );
}

/**
 * 배너 광고 (상단/하단 고정)
 */
export function BannerAd({ 
  adSlot, 
  position = 'bottom' 
}: { 
  adSlot: string; 
  position?: 'top' | 'bottom';
}) {
  return (
    <div 
      className={`fixed left-0 right-0 z-50 bg-white shadow-lg ${
        position === 'top' ? 'top-0' : 'bottom-20'
      }`}
    >
      <GoogleAdBanner 
        adSlot={adSlot}
        adFormat="horizontal"
        style={{ minHeight: '50px' }}
      />
    </div>
  );
}

