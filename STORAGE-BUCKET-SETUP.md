# Supabase Storage Bucket 설정 가이드

## 문제: "Bucket not found" 오류

프로필 사진 업로드 시 다음 오류가 발생했습니다:
```
StorageApiError: Bucket not found
```

이는 Supabase 프로젝트에 `user-profiles` bucket이 생성되지 않았을 때 발생합니다.

---

## 해결 방법

### 단계 1: Supabase 콘솔 접속

1. [Supabase 대시보드](https://app.supabase.com) 접속
2. 프로젝트 선택 (`ytffobltrwkgxiedorsd`)
3. 좌측 사이드바에서 **Storage** 탭 클릭

### 단계 2: Bucket 생성

1. **"Create a new bucket"** 버튼 클릭
2. 다음 설정으로 생성:
   - **Bucket name**: `user-profiles` (정확히 입력)
   - **Public bucket**: ✅ 활성화 (공개 읽기 필요)
3. **Create bucket** 클릭

### 단계 3: RLS 정책 설정

Storage bucket 생성 후 **Policies** 탭에서:

**READ 정책** (누구나 읽기 가능):
```sql
-- Policy name: Public Read Access
-- For SELECT
-- Using expression: true
```

**INSERT 정책** (인증된 사용자만 업로드):
```sql
-- Policy name: Authenticated Upload
-- For INSERT
-- With check: auth.role() = 'authenticated'
```

### 단계 4: 검증

1. 브라우저 개발자 도구 열기 (F12)
2. 콘솔 탭 확인
3. 다음 메시지가 보이면 성공:
   ```
   ✅ URL: https://ytffobltrwkgxiedorsd.supabase.co
   ✅ ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...
   ```

---

## 파일 업로드 테스트

### 회원가입 페이지에서:
1. 전화번호, 이름, 나이, 성별 입력
2. 비밀번호 입력
3. **프로필 사진 업로드** 버튼 클릭
4. 이미지 선택 후 업로드

### 예상되는 로그:
```
파일 업로드 시작: profile_1764339500319_6f3evvali
업로드 응답: { error: null, data: {...} }
생성된 공개 URL: https://ytffobltrwkgxiedorsd.supabase.co/storage/v1/object/public/user-profiles/profile_1764339500319_6f3evvali
```

---

## 디버깅 체크리스트

- [ ] Supabase 콘솔에서 `user-profiles` bucket 존재 확인
- [ ] Bucket이 **Public**으로 설정되어 있는지 확인
- [ ] RLS 정책에서 public read 정책이 활성화되어 있는지 확인
- [ ] `.env.local` 파일에 환경 변수 설정 확인:
  ```env
  VITE_SUPABASE_URL=https://ytffobltrwkgxiedorsd.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...
  ```
- [ ] 브라우저 캐시 삭제 후 재로드 (Ctrl+Shift+Delete)
- [ ] 파일 크기가 5MB 이하인지 확인
- [ ] 이미지 형식이 JPG, PNG, WEBP, GIF 중 하나인지 확인

---

## 참고: 다른 Bucket들

앱에서 사용할 수 있는 추가 bucket (필요시):

- `user-profiles` (필수) - 프로필 사진
- `community-posts` (선택) - 커뮤니티 포스트 이미지
- `dating-messages` (선택) - 매칭 메시지 첨부파일

---

## 참고: 공개 URL 형식

저장된 파일에 접근하는 형식:
```
https://{SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{file_name}
```

예:
```
https://ytffobltrwkgxiedorsd.supabase.co/storage/v1/object/public/user-profiles/profile_1764339500319_6f3evvali
```
