import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 페이지 전환 시 스크롤을 맨 위로 이동시키는 컴포넌트
 * App.tsx의 BrowserRouter 안에 배치하여 전역적으로 동작
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 페이지 전환 시 스크롤을 맨 위로
    window.scrollTo(0, 0);
    
    // 모바일 앱 컨테이너도 스크롤 위로
    const appContainer = document.querySelector('.max-w-\\[400px\\]');
    if (appContainer) {
      appContainer.scrollTop = 0;
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;

