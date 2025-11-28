# 🚀 Supabase Storage Bucket 수동 생성 가이드

## 빠른 설정 (5분)

### 1단계: Supabase 콘솔 접속
1. https://app.supabase.com 에 접속
2. 프로젝트 선택: **Attract Web** (ytffobltrwkgxiedorsd)

### 2단계: Storage Bucket 생성
1. 좌측 메뉴 → **Storage** 클릭
2. **"Create a new bucket"** 버튼 클릭
3. 다음과 같이 입력:
   - **Bucket name**: `user-profiles`
   - **Public bucket**: ✅ 체크 (반드시!)
4. **Create bucket** 버튼 클릭

### 3단계: RLS 정책 추가

**방법 1: 콘솔 UI (추천)**

1. `user-profiles` bucket 클릭
2. **Policies** 탭 이동
3. **New policy** → **For full customization** 선택

**정책 1: 공개 읽기**
- Name: `Public Read Access`
- Operation: SELECT
- Using expression:
  ```
  true
  ```

**정책 2: 인증된 사용자 업로드**
- Name: `Authenticated Upload`
- Operation: INSERT
- With check expression:
  ```
  auth.role() = 'authenticated'
  ```

---

## 검증

### 체크리스트
- [ ] Supabase 콘솔에서 Storage 탭 클릭
- [ ] `user-profiles` bucket이 목록에 보이는가?
- [ ] Public으로 표시되어 있는가?
- [ ] Policies가 2개 이상 있는가?

### 테스트
1. 앱에서 **회원가입** 페이지 접속
2. 전화번호, 이름, 나이, 성별 입력
3. 비밀번호 입력
4. **프로필 사진** 업로드 버튼 클릭
5. 이미지 선택 후 업로드

### 성공 시
- ✅ "이미지가 업로드되었습니다!" 메시지
- ✅ 프로필 사진 미리보기 표시

### 실패 시
- ❌ "Supabase Storage가 제대로 설정되지 않았습니다." 
  → bucket이 생성되지 않았음
- ❌ "이미지 업로드 실패" 
  → RLS 정책이 없거나 잘못됨

---

## 스크린샷 가이드

### Bucket 생성 화면
```
┌─ Storage ──────────────────┐
│ Create a new bucket         │
│                             │
│ Bucket name: user-profiles │ ← 정확히 입력
│ [✓] Public bucket          │ ← 반드시 체크
│                             │
│         [Create bucket]    │
└─────────────────────────────┘
```

### Policies 추가 화면
```
┌─ Policies ──────────────────────────────┐
│ [+ New policy]                          │
│                                         │
│ 기존 정책:                               │
│ • AUTHENTICATED                         │
│ • PUBLIC                                │
│ • UNAUTHENTICATED                       │
│                                         │
│ 필요한 정책:                             │
│ • Public Read Access                    │
│ • Authenticated Upload                  │
└─────────────────────────────────────────┘
```

---

## SQL 대체 방법 (고급)

만약 API를 통해 자동화하려면:

```bash
# 1. SERVICE_KEY 준비
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 2. Bucket 생성 (curl 이용)
curl -X POST \
  "https://ytffobltrwkgxiedorsd.supabase.co/storage/v1/b" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "user-profiles",
    "public": true
  }'

# 3. RLS 정책은 콘솔에서 수동 추가 필요
```

---

## 자주 묻는 질문

**Q: Bucket이 안 만들어져요**
A: Service Role Key가 필요합니다. Supabase 콘솔 → Settings → API에서 복사하세요.

**Q: 파일이 업로드되지 않아요**
A: 
1. Bucket이 Public으로 설정되었는지 확인
2. RLS 정책이 추가되었는지 확인
3. INSERT 정책의 With check가 `true` 또는 `auth.role() = 'authenticated'`인지 확인

**Q: 업로드된 파일이 보이지 않아요**
A:
1. SELECT 정책이 `true`로 설정되어 있는지 확인
2. 파일 권한이 public인지 확인
3. 콘솔 캐시 삭제 후 재로드 (Ctrl+Shift+Delete)

**Q: 콘솔 말고 코드로 자동 생성할 수 있나요?**
A: Supabase CLI 또는 Management API를 사용할 수 있습니다.
```bash
supabase storage create user-profiles --public
```

---

## 지원 링크

- [Supabase Storage 문서](https://supabase.com/docs/guides/storage)
- [RLS 정책 가이드](https://supabase.com/docs/guides/storage/security/access-control)
- [콘솔 직접 접속](https://app.supabase.com)
