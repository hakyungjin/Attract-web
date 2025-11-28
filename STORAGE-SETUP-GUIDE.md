# Supabase Storage 설정 가이드

## 필요한 Bucket 생성

Supabase 콘솔에서 다음 bucket을 생성해야 합니다:

### 1. `user-profiles` Bucket

**목적**: 사용자 프로필 사진 저장

**생성 방법**:
1. Supabase 콘솔 → Storage 탭으로 이동
2. "Create a new bucket" 클릭
3. Bucket name: `user-profiles`
4. Public bucket 활성화: ✅ 체크 (공개 접근 필요)
5. 생성 클릭

### 2. RLS 정책 설정

`user-profiles` bucket에 대한 정책:

```sql
-- Public read access
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-profiles');

-- Authenticated users can upload their own files
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-profiles' 
    AND auth.role() = 'authenticated'
  );

-- Users can delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-profiles'
    AND owner = auth.uid()
  );
```

### 3. 파일 명명 규칙

프로필 사진은 다음 형식으로 저장됩니다:
```
profile_{timestamp}_{randomId}
예: profile_1764339500319_6f3evvali
```

### 4. 공개 URL 형식

저장된 파일에 접근하는 URL:
```
https://{SUPABASE_URL}/storage/v1/object/public/user-profiles/{fileName}
예: https://ytffobltrwkgxiedorsd.supabase.co/storage/v1/object/public/user-profiles/profile_1764339500319_6f3evvali
```

## 환경 변수 확인

`.env` 또는 `.env.local` 파일에 다음 변수들이 설정되어 있는지 확인:

```env
VITE_SUPABASE_URL=https://ytffobltrwkgxiedorsd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...
```

## 문제 해결

### "Bucket not found" 오류
- ✅ Supabase 콘솔에서 bucket이 생성되었는지 확인
- ✅ Bucket name이 정확히 `user-profiles`인지 확인
- ✅ Public bucket 설정이 활성화되어 있는지 확인

### 파일 업로드 실패
- ✅ 파일 크기가 5MB 이하인지 확인
- ✅ 지원하는 이미지 형식인지 확인 (JPG, PNG, WEBP, GIF)
- ✅ Supabase 인증이 제대로 설정되어 있는지 확인

### 업로드된 파일에 접근 불가
- ✅ Bucket이 public으로 설정되어 있는지 확인
- ✅ 파일 URL 형식이 올바른지 확인
- ✅ 브라우저 캐시를 삭제하고 다시 시도

## 배포 후 확인

Firebase 배포 후:
1. 브라우저 개발자 도구 → Network 탭
2. 이미지 업로드 시도
3. 업로드 요청이 성공하는지 확인 (Status 200)
4. 공개 URL에 접근하여 이미지가 로드되는지 확인
