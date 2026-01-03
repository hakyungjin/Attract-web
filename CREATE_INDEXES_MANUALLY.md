# 🔥 Firestore 인덱스 수동 생성 가이드

## ⚠️ 중요: 콘솔에서 에러가 발생하면 아래 링크를 클릭하세요

### 1️⃣ 받은 매칭 요청 인덱스
**링크:** https://console.firebase.google.com/v1/r/project/attract--web/firestore/databases/attract/indexes?create_composite=ClRwcm9qZWN0cy9hdHRyYWN0LS13ZWIvZGF0YWJhc2VzL2F0dHJhY3QvY29sbGVjdGlvbkdyb3Vwcy9tYXRjaGluZ19yZXF1ZXN0cy9pbmRleGVzL18QARoOCgp0b191c2VyX2lkEAEaDgoKY3JlYXRlZF9hdBACGgwKCF9fbmFtZV9fEAI

**설정:**
- Collection: `matching_requests`
- Fields:
  - `to_user_id` (Ascending)
  - `created_at` (Descending)

### 2️⃣ 보낸 매칭 요청 인덱스
**링크:** https://console.firebase.google.com/v1/r/project/attract--web/firestore/databases/attract/indexes?create_composite=ClRwcm9qZWN0cy9hdHRyYWN0LS13ZWIvZGF0YWJhc2VzL2F0dHJhY3QvY29sbGVjdGlvbkdyb3Vwcy9tYXRjaGluZ19yZXF1ZXN0cy9pbmRleGVzL18QARoQCgxmcm9tX3VzZXJfaWQQARoOCgpjcmVhdGVkX2F0EAIaDAoIX19uYW1lX18QAg

**설정:**
- Collection: `matching_requests`
- Fields:
  - `from_user_id` (Ascending)
  - `created_at` (Descending)

## 📝 단계

1. **위 링크 클릭** (자동으로 설정이 채워짐)
2. **"Create index" 버튼 클릭**
3. **1-2분 대기** (인덱스 생성 중)
4. **페이지 새로고침** (F5)

## ✅ 인덱스 생성 확인

Firebase Console → Firestore → Indexes에서 상태 확인:
- 🟡 **Building...** - 생성 중
- 🟢 **Enabled** - 완료!

## ⏱️ 시간

일반적으로 **1-2분** 정도 걸립니다. 데이터가 많으면 더 오래 걸릴 수 있습니다.
