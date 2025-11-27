# 로그인 & 게시물 작성 시스템 가이드

## ✅ 완료된 작업

### 1. Supabase 인증 시스템 구축

#### 생성된 파일:
- **[src/lib/supabase.ts](src/lib/supabase.ts)** - Supabase 클라이언트 및 인증 헬퍼
- **[src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)** - 전역 인증 상태 관리
- **[src/App.tsx](src/App.tsx)** - AuthProvider 추가

#### 주요 기능:
- ✅ 이메일 로그인
- ✅ 회원가입
- ✅ 로그아웃
- ✅ 세션 관리 (자동 토큰 갱신)
- ✅ 인증 상태 실시간 동기화

### 2. 로그인 페이지 개선

#### 수정된 파일:
- **[src/pages/login/page.tsx](src/pages/login/page.tsx)**

#### 변경 사항:
- ❌ **제거**: localStorage 기반 가짜 로그인
- ❌ **제거**: 소셜 로그인 버튼 (카카오, 구글, 애플)
- ✅ **추가**: Supabase 실제 인증 연동
- ✅ **추가**: 로딩 상태 표시
- ✅ **추가**: 유효성 검사
- ✅ **추가**: 에러 처리

### 3. 게시물 작성 시스템

#### 생성된 파일:
- **[src/pages/post/create.tsx](src/pages/post/create.tsx)** - 게시물 작성 페이지

#### 주요 기능:
- ✅ 텍스트 입력
- ✅ 이미지 업로드 (최대 5개)
- ✅ 이미지 미리보기
- ✅ 이미지 삭제
- ✅ Supabase Storage 자동 업로드
- ✅ 로딩 상태 표시

#### 수정된 파일:
- **[src/pages/home/components/CommunityTab.tsx](src/pages/home/components/CommunityTab.tsx)**
  - 플로팅 버튼 클릭 → `/post/create` 페이지로 이동

### 4. 라우팅

#### 추가된 라우트:
```tsx
{
  path: "/post/create",
  element: <CreatePostPage />,
}
```

---

## 🔐 인증 시스템 사용법

### AuthContext 사용하기

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();

  // 로그인 상태 확인
  if (loading) return <div>로딩 중...</div>;
  if (!user) return <div>로그인이 필요합니다.</div>;

  // 로그인된 사용자 정보
  return <div>안녕하세요, {user.email}님!</div>;
}
```

### 로그인

```tsx
const { signIn } = useAuth();

const handleLogin = async () => {
  const { error } = await signIn('email@example.com', 'password123');

  if (error) {
    alert('로그인 실패: ' + error.message);
  } else {
    // 로그인 성공
    navigate('/');
  }
};
```

### 회원가입

```tsx
const { signUp } = useAuth();

const handleSignup = async () => {
  const { error } = await signUp('email@example.com', 'password123', '닉네임');

  if (error) {
    alert('회원가입 실패: ' + error.message);
  } else {
    // 회원가입 성공 (이메일 확인 필요)
    alert('이메일을 확인해주세요!');
  }
};
```

### 로그아웃

```tsx
const { signOut } = useAuth();

const handleLogout = async () => {
  await signOut();
  navigate('/login');
};
```

---

## 📝 게시물 작성 시스템

### 게시물 작성 페이지로 이동

```tsx
import { useNavigate } from 'react-router-dom';

function CommunityTab() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate('/post/create')}>
      글쓰기
    </button>
  );
}
```

### 게시물 작성 프로세스

1. **텍스트 입력**
   - 사용자가 내용 입력

2. **이미지 선택** (선택사항)
   - 최대 5개까지 선택 가능
   - 자동으로 Supabase Storage에 업로드
   - 미리보기 제공

3. **게시 버튼 클릭**
   - Supabase `posts` 테이블에 저장
   - 완료 후 홈으로 이동

### Supabase 테이블 구조

게시물 작성을 위해 필요한 테이블:

```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images TEXT[],  -- 이미지 URL 배열
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 게시물 조회 가능
CREATE POLICY "Anyone can view posts" ON posts
  FOR SELECT TO authenticated USING (true);

-- 로그인한 사용자만 게시물 작성 가능
CREATE POLICY "Users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 작성자만 게시물 수정/삭제 가능
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 🚀 실행 방법

### 1. Supabase 설정

#### 1-1. Supabase 프로젝트 생성
1. https://supabase.com/ 접속
2. 새 프로젝트 생성
3. API 키 복사

#### 1-2. 환경 변수 설정
`.env` 파일 생성:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

#### 1-3. 데이터베이스 스키마 적용
Supabase 대시보드 → SQL Editor → `supabase-schema.sql` 실행

#### 1-4. Storage 버킷 생성
Supabase 대시보드 → Storage → New Bucket:
- `avatars` - 프로필 사진
- `posts` - 게시글 이미지

### 2. 애플리케이션 실행

```bash
cd "Attract web"
npm install
npm run dev
```

### 3. 테스트

1. **회원가입**
   - http://localhost:5173/login
   - 이메일과 비밀번호로 회원가입
   - 이메일 확인 (Supabase가 자동 발송)

2. **로그인**
   - 이메일과 비밀번호로 로그인
   - 자동으로 토큰 저장 및 세션 유지

3. **게시물 작성**
   - 커뮤니티 탭 → + 버튼 클릭
   - 내용 입력 및 이미지 업로드
   - 게시 버튼 클릭

---

## 🔒 보안

### 인증 토큰 관리

- ✅ Supabase가 자동으로 JWT 토큰 관리
- ✅ localStorage에 암호화되어 저장
- ✅ 만료 시 자동 갱신
- ✅ 로그아웃 시 완전 삭제

### Row Level Security (RLS)

- ✅ 모든 테이블에 RLS 활성화
- ✅ 사용자는 자신의 데이터만 수정/삭제 가능
- ✅ Supabase가 자동으로 권한 검증

### 이미지 업로드 보안

- ✅ 파일 타입 검증 (이미지만 허용)
- ✅ 파일 크기 제한 (5MB)
- ✅ Supabase Storage 정책으로 접근 제어

---

## 📊 데이터 흐름

### 로그인 플로우

```
[사용자]
  ↓ 이메일/비밀번호 입력
[로그인 페이지]
  ↓ signIn()
[AuthContext]
  ↓ supabase.auth.signInWithPassword()
[Supabase Auth]
  ↓ JWT 토큰 발급
[AuthContext]
  ↓ user 상태 업데이트
[전체 앱]
  ↓ user 정보 사용 가능
```

### 게시물 작성 플로우

```
[사용자]
  ↓ 1. 내용 입력 + 이미지 선택
[게시물 작성 페이지]
  ↓ 2. 이미지 업로드
[Supabase Storage]
  ↓ 3. 이미지 URL 반환
[게시물 작성 페이지]
  ↓ 4. 게시물 데이터 + 이미지 URLs
[Supabase Database]
  ↓ 5. posts 테이블에 저장
[커뮤니티 페이지]
  ↓ 6. 새 게시물 표시
```

---

## ❌ 제거된 기능

1. **localStorage 기반 로그인**
   - 이전: `localStorage.setItem('isLoggedIn', 'true')`
   - 현재: Supabase 인증으로 대체

2. **소셜 로그인 버튼**
   - 카카오, 구글, 애플 버튼 제거
   - 향후 필요 시 Supabase OAuth로 구현 가능

3. **모달 기반 게시물 작성**
   - 이전: 커뮤니티 탭 내 모달
   - 현재: 별도 페이지 (`/post/create`)

---

## 🐛 문제 해결

### 로그인이 안될 때

1. `.env` 파일 확인
   ```env
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

2. Supabase 이메일 확인 설정
   - Supabase 대시보드 → Authentication → Email Templates
   - 이메일 확인 필수 여부 설정

### 게시물 작성이 안될 때

1. Supabase RLS 정책 확인
2. Storage 버킷 생성 확인
3. 콘솔 에러 메시지 확인

### 이미지 업로드가 안될 때

1. Storage 버킷이 public인지 확인
2. 파일 크기 확인 (5MB 이하)
3. 파일 타입 확인 (이미지만 허용)

---

## 📚 참고 자료

- [Supabase 인증 문서](https://supabase.com/docs/guides/auth)
- [Supabase Storage 문서](https://supabase.com/docs/guides/storage)
- [React Router 문서](https://reactrouter.com/)

---

**구현 완료! 🎉**

이제 사용자가:
1. 실제로 회원가입하고 로그인할 수 있습니다
2. 로그인 상태가 자동으로 유지됩니다
3. 새로운 페이지에서 텍스트와 이미지를 포함한 게시물을 작성할 수 있습니다
