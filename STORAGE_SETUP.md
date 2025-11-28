# Supabase Storage 설정 가이드

## 📦 Storage Bucket 생성하기

### 1. Supabase Dashboard 접속

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택 (agtivhggfqwjitzsqmkv)
3. 왼쪽 메뉴에서 **"Storage"** 클릭

### 2. 필요한 Bucket 생성

다음 버킷들을 생성해야 합니다:

#### 📁 avatars (프로필 이미지)
- **Name**: `avatars`
- **Public**: ✅ Yes (공개)
- **File size limit**: 5MB
- **Allowed MIME types**: image/jpeg, image/png, image/gif, image/webp

#### 📁 posts (게시글 이미지)
- **Name**: `posts`
- **Public**: ✅ Yes (공개)
- **File size limit**: 10MB
- **Allowed MIME types**: image/jpeg, image/png, image/gif, image/webp

#### 📁 community (커뮤니티 이미지)
- **Name**: `community`
- **Public**: ✅ Yes (공개)
- **File size limit**: 10MB
- **Allowed MIME types**: image/jpeg, image/png, image/gif, image/webp

### 3. Bucket 생성 단계별 가이드

1. **"New bucket" 버튼 클릭**
2. **Bucket 정보 입력**:
   ```
   Name: avatars
   Public bucket: ✅ (체크)
   ```
3. **"Create bucket" 클릭**
4. 위 과정을 `posts`, `community` 버킷에 대해 반복

### 4. Storage Policy 설정 (RLS)

각 버킷에 대한 접근 권한을 설정합니다:

#### avatars 버킷 정책

```sql
-- 모든 사용자가 프로필 이미지 조회 가능
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- 사용자는 자신의 이미지만 수정/삭제 가능
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### posts 버킷 정책

```sql
-- 모든 사용자가 게시글 이미지 조회 가능
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posts'
  AND auth.role() = 'authenticated'
);

-- 사용자는 자신의 이미지만 삭제 가능
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'posts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### community 버킷 정책

```sql
-- 모든 사용자가 커뮤니티 이미지 조회 가능
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'community');

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'community'
  AND auth.role() = 'authenticated'
);

-- 사용자는 자신의 이미지만 삭제 가능
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'community'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 5. Dashboard에서 정책 설정하기

1. Storage > 해당 버킷 선택
2. **"Policies"** 탭 클릭
3. **"New policy"** 클릭
4. 위의 SQL 정책들을 하나씩 추가

또는:

1. SQL Editor 열기
2. 위의 모든 정책 SQL을 한 번에 실행

## 🖼️ 이미지 업로드 방법

### 방법 1: 코드에서 업로드 (권장)

프로젝트에 이미 구현된 `uploadImage` 함수 사용:

```typescript
import { uploadImage } from '@/services/imageUpload';

// 파일 선택 후
const handleFileUpload = async (file: File) => {
  try {
    const imageUrl = await uploadImage(file, 'avatars');
    console.log('업로드된 이미지 URL:', imageUrl);
  } catch (error) {
    console.error('업로드 실패:', error);
  }
};
```

### 방법 2: Supabase Dashboard에서 직접 업로드

1. Storage > 해당 버킷 선택
2. **"Upload file"** 버튼 클릭
3. 파일 선택 및 업로드
4. 업로드된 파일 클릭 > **"Get public URL"** 복사

### 방법 3: 제공된 업로드 도구 사용

```bash
# 이미지 업로드 도구 실행
node upload-images.js
```

브라우저에서:
```
test-image-upload.html 파일을 브라우저에서 열기
```

## 📊 이미지 URL 구조

업로드된 이미지의 URL 형식:
```
https://agtivhggfqwjitzsqmkv.supabase.co/storage/v1/object/public/{bucket}/{filename}
```

예시:
```
https://agtivhggfqwjitzsqmkv.supabase.co/storage/v1/object/public/avatars/1234567890_abc123.jpg
```

## 🔧 현재 프로젝트 구조

```
public/
└── images/
    └── magnet.png  # 로컬 이미지

Supabase Storage/
├── avatars/        # 프로필 이미지
├── posts/          # 게시글 이미지
└── community/      # 커뮤니티 이미지
```

## 💡 사용 시나리오

### 1. 프로필 이미지 업로드
```typescript
const profileImage = await uploadImage(file, 'avatars', userId);

// users 테이블에 URL 저장
await supabase
  .from('users')
  .update({ avatar_url: profileImage })
  .eq('id', userId);
```

### 2. 게시글 이미지 업로드
```typescript
const postImage = await uploadImage(file, 'posts', postId);

// posts 테이블에 URL 저장
await supabase
  .from('posts')
  .update({ images: [postImage] })
  .eq('id', postId);
```

### 3. 커뮤니티 게시글 이미지
```typescript
const communityImage = await uploadImage(file, 'community', postId);

// community_posts 테이블에 URL 저장
await supabase
  .from('community_posts')
  .update({ image_url: communityImage })
  .eq('id', postId);
```

## 🚨 주의사항

1. **파일 크기 제한**
   - avatars: 최대 5MB
   - posts/community: 최대 10MB

2. **지원 파일 형식**
   - JPEG, PNG, GIF, WebP

3. **보안**
   - 업로드는 인증된 사용자만 가능
   - 삭제는 본인 파일만 가능

4. **최적화**
   - 대용량 이미지는 클라이언트에서 압축 권장
   - WebP 형식 사용 권장 (용량 절감)

## ✅ 체크리스트

- [ ] avatars 버킷 생성
- [ ] posts 버킷 생성
- [ ] community 버킷 생성
- [ ] 각 버킷을 Public으로 설정
- [ ] Storage 정책(RLS) 설정
- [ ] 테스트 이미지 업로드
- [ ] 업로드된 이미지 URL 확인

## 🔗 참고 링크

- [Supabase Storage 문서](https://supabase.com/docs/guides/storage)
- [Storage RLS 가이드](https://supabase.com/docs/guides/storage/security/access-control)
