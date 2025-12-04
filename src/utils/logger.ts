/**
 * 애플리케이션 로깅 유틸리티
 * 개발 환경에서는 콘솔에 출력, 프로덕션에서는 외부 서비스로 전송 가능
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogData {
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
  }

  /**
   * 정보성 로그
   * @param message - 로그 메시지
   * @param data - 추가 데이터
   */
  info(message: string, data?: LogData): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, data || '');
    }
  }

  /**
   * 경고 로그
   * @param message - 경고 메시지
   * @param data - 추가 데이터
   */
  warn(message: string, data?: LogData): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }

  /**
   * 에러 로그
   * @param message - 에러 메시지
   * @param error - 에러 객체
   */
  error(message: string, error?: Error | any): void {
    console.error(`[ERROR] ${message}`, error || '');

    // 프로덕션 환경에서는 Sentry 등 외부 서비스로 전송 가능
    if (!this.isDevelopment) {
      // TODO: Sentry.captureException(error);
    }
  }

  /**
   * 디버그 로그 (개발 환경에서만)
   * @param message - 디버그 메시지
   * @param data - 추가 데이터
   */
  debug(message: string, data?: LogData): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }

  /**
   * 데이터베이스 쿼리 로그
   * @param query - 쿼리 설명
   * @param table - 테이블 이름
   * @param data - 쿼리 데이터
   */
  query(query: string, table: string, data?: LogData): void {
    if (this.isDevelopment) {
      console.log(`[DB QUERY] ${table}: ${query}`, data || '');
    }
  }

  /**
   * API 요청 로그
   * @param method - HTTP 메서드
   * @param endpoint - API 엔드포인트
   * @param data - 요청 데이터
   */
  api(method: string, endpoint: string, data?: LogData): void {
    if (this.isDevelopment) {
      console.log(`[API ${method}] ${endpoint}`, data || '');
    }
  }
}

// 싱글톤 인스턴스 export
export const logger = new Logger();
