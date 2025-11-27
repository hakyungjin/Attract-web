# Supabase 설정 가이드

이 가이드는 Attract Web 프로젝트의 Supabase 데이터베이스와 스토리지를 설정하는 방법을 안내합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 로그인
2. "New Project" 클릭
3. 프로젝트 이름과 비밀번호 설정
4. 리전 선택 (가까운 지역 선택, 예: ap-northeast-1 for Seoul)

## 2. 데이터베이스 스키마 실행

1. Supabase 대시보드에서 **SQL Editor** 선택
2. "New Query" 클릭
3. `supabase-schema.sql` 파일의 전체 내용을 복사해서 붙여넣기
4. "Run" 버튼 클릭하여 실행

## 3. Storage 버킷 생성

### 3.1 버킷 생성

1. Supabase 대시보드에서 **Storage** 선택
2. "Create a new bucket" 클릭
3. 다음 버킷들을 생성:

#### avatars 버킷
- **Name**: `avatars`
- **Public**: ✅ (체크)
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/*`

#### posts 버킷
- **Name**: `posts`
- **Public**: ✅ (체크)
- **File size limit**: 10 MB
- **Allowed MIME types**: `image/*`

### 3.2 Storage RLS 정책 설정

각 버킷에 대해 다음 RLS 정책을 추가하세요:

#### avatars 버킷 정책

1. Storage → avatars → Policies
2. "New Policy" 클릭하고 다음 SQL 실행:

```sql
-- 모든 인증된 사용자가 아바타를 업로드할 수 있음
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- 모든 사람이 아바타를 볼 수 있음
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 자신의 아바타만 업데이트 가능
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- 자신의 아바타만 삭제 가능
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
```

#### posts 버킷 정책

```sql
-- 모든 인증된 사용자가 게시글 이미지를 업로드할 수 있음
CREATE POLICY "Users can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posts');

-- 모든 사람이 게시글 이미지를 볼 수 있음
CREATE POLICY "Anyone can view post images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'posts');

-- 자신의 게시글 이미지만 업데이트 가능
CREATE POLICY "Users can update own post images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'posts');

-- 자신의 게시글 이미지만 삭제 가능
CREATE POLICY "Users can delete own post images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'posts');
```

## 4. 환경 변수 설정

1. Supabase 대시보드에서 **Settings** → **API** 선택
2. 다음 값들을 복사:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`

3. `.env` 파일 생성 (`.env.example` 참고):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 5. 인증 설정 (선택사항)

### 이메일 확인 비활성화 (개발 환경)

1. Supabase 대시보드에서 **Authentication** → **Settings** 선택
2. "Email Confirmation" 토글을 **OFF**로 설정
3. 저장

이렇게 하면 테스트 계정 생성 시 이메일 확인 없이 바로 로그인할 수 있습니다.

## 6. 테스트

1. 앱 실행: `npm run dev`
2. 로그인 페이지에서 회원가입
3. 커뮤니티 탭에서 게시글 작성 (이미지 포함)
4. 게시글이 정상적으로 표시되는지 확인

## 문제 해결

### "relation does not exist" 에러
→ `supabase-schema.sql`이 제대로 실행되지 않았을 가능성이 있습니다. SQL Editor에서 다시 실행하세요.

### "new row violates row-level security policy" 에러
→ Storage RLS 정책이 제대로 설정되지 않았습니다. 위의 Storage RLS 정책을 다시 확인하고 실행하세요.

### 404 Error on Storage
→ Storage 버킷이 생성되지 않았거나 Public으로 설정되지 않았습니다. Storage 설정을 확인하세요.

## 데이터베이스 구조

### 주요 테이블

- `users`: 사용자 정보
- `community_posts`: 커뮤니티 게시글
- `post_comments`: 게시글 댓글
- `payments`: 결제 내역
- `matches`: 매칭 정보
- `messages`: 메시지

### Storage 버킷

- `avatars`: 사용자 프로필 이미지
- `posts`: 게시글 이미지
