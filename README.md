# Attract - 소셜 매칭 플랫폼

## 데이터베이스 설정

### 1. Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 접속하여 새 프로젝트 생성
2. 프로젝트 URL과 anon key를 복사

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 데이터베이스 스키마 적용
1. Supabase 대시보드에서 SQL Editor로 이동
2. `database_schema.sql` 파일의 전체 내용을 복사
3. SQL Editor에 붙여넣고 실행 (Run)

이 스키마는 다음을 포함합니다:
- **Users 테이블**: 사용자 프로필 정보
- **Community Posts 테이블**: 커뮤니티 게시글
- **Post Likes 테이블**: 게시글 좋아요
- **Post Comments 테이블**: 게시글 댓글
- **Notifications 테이블**: 알림 시스템
- **Matching Requests 테이블**: 매칭 요청 관리
- **Coin Packages 테이블**: 코인 상품
- **자동 알림 트리거**: 좋아요, 매칭 요청, 매칭 수락 시 자동 알림 생성

### 4. Storage 버킷 확인
스키마 실행 후 Storage 섹션에서 `profile-images` 버킷이 생성되었는지 확인

## 주요 기능

### 알림 시스템
다음 이벤트 발생 시 자동으로 알림이 생성됩니다:
- 커뮤니티 게시글에 좋아요를 받았을 때
- 매칭 요청을 받았을 때
- 매칭 요청이 수락되었을 때

### 매칭 시스템
- 사용자 간 매칭 요청 및 수락
- 매칭 현황 실시간 조회
- 읽지 않은 알림 개수 표시

### 프로필 관리
- Supabase와 실시간 동기화
- 프로필 이미지 업로드
- 상세 정보 관리 (MBTI, 관심사, 학교 등)

## 개발 서버 실행

```bash
npm install
npm run dev
```

## 기술 스택
- React + TypeScript
- Vite
- Supabase (Backend & Database)
- TailwindCSS
- React Router
- Firebase Auth (선택적)
