# 🖼️ 이미지 업로드 빠른 시작 가이드

## 📋 3단계로 완료하기

### 1단계: Storage Bucket 생성 (Supabase Dashboard)

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택 → **Storage** 메뉴 클릭
3. **New bucket** 버튼 클릭
4. 다음 3개 버킷 생성:

```
버킷 이름: avatars
Public bucket: ✅ 체크
→ Create bucket

버킷 이름: posts
Public bucket: ✅ 체크
→ Create bucket

버킷 이름: community
Public bucket: ✅ 체크
→ Create bucket
```

### 2단계: Storage 정책 적용 (SQL Editor)

1. Supabase Dashboard → **SQL Editor** 클릭
2. **New query** 클릭
3. [storage-policies.sql](storage-policies.sql) 파일 내용 복사 → 붙여넣기
4. **Run** 버튼 클릭

### 3단계: 이미지 업로드

#### 방법 A: 웹 도구 사용 (가장 쉬움) ⭐

1. [test-image-upload.html](test-image-upload.html) 파일을 브라우저에서 열기
2. 버킷 선택 (avatars, posts, community)
3. 이미지 드래그 & 드롭 또는 클릭하여 선택
4. **업로드** 버튼 클릭
5. URL 복사하여 사용

#### 방법 B: Supabase Dashboard 사용

1. Storage → 해당 버킷 선택
2. **Upload file** 버튼 클릭
3. 이미지 선택 및 업로드
4. 파일 클릭 → **Get public URL** 복사

#### 방법 C: 코드에서 사용

```typescript
import { uploadImage } from '@/services/imageUpload';

const handleUpload = async (file: File) => {
  const url = await uploadImage(file, 'avatars');
  console.log('업로드된 URL:', url);
};
```

## ✅ 완료 확인

- [ ] 3개 버킷 생성 완료 (avatars, posts, community)
- [ ] Storage 정책 적용 완료
- [ ] 테스트 이미지 업로드 성공
- [ ] 업로드된 이미지 URL 확인

## 🎯 업로드된 이미지 URL 예시

```
https://agtivhggfqwjitzsqmkv.supabase.co/storage/v1/object/public/avatars/1234567890_abc123.jpg
```

이 URL을 데이터베이스에 저장하면 됩니다!

## 📚 더 자세한 정보

- [STORAGE_SETUP.md](STORAGE_SETUP.md) - 상세 설정 가이드
- [storage-policies.sql](storage-policies.sql) - 보안 정책 SQL
- [test-image-upload.html](test-image-upload.html) - 웹 업로드 도구

## ❓ 문제 해결

### 업로드 실패 시
1. 버킷이 Public으로 설정되어 있는지 확인
2. Storage 정책(RLS)이 적용되어 있는지 확인
3. 파일 크기가 10MB 이하인지 확인
4. 지원 형식인지 확인 (JPG, PNG, GIF, WebP)

### 이미지가 안 보일 때
1. URL이 올바른지 확인
2. 버킷이 Public인지 확인
3. 브라우저 콘솔에서 네트워크 에러 확인

## 💡 팁

- **WebP 형식** 권장 (용량 70% 절감)
- 업로드 전 **이미지 압축** 권장 (TinyPNG 등)
- **파일명**은 자동으로 고유하게 생성됨
- 업로드된 URL은 **영구적**으로 사용 가능
