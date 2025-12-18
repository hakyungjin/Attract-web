# 🏢 Google Play 조직 계정 설정 가이드

## 📋 문제 상황

Google Play Console에서 다음 오류가 발생했습니다:

> "Your app is not compliant with the Play Console Requirements policy. Some types of apps can only be distributed by organizations. You have selected an app category or declared your app offers certain features that require you to submit your app using an organization account."

## 🔍 원인

**소셜(Social) 또는 데이트(Dating) 카테고리 앱**은 Google Play 정책상 **조직 계정(Organization Account)**으로만 배포할 수 있습니다. 개인 계정(Personal Account)으로는 배포가 불가능합니다.

## ✅ 해결 방법

### 방법 1: 조직 계정으로 전환 (권장)

#### 1단계: Google Play Console 접속

1. [Google Play Console](https://play.google.com/console/) 접속
2. 현재 계정으로 로그인

#### 2단계: 계정 타입 확인

1. **설정** (Settings) → **계정 세부정보** (Account details) 이동
2. 현재 계정 타입 확인:
   - **개인 계정**: "Personal account" 또는 "개인 계정"
   - **조직 계정**: "Organization account" 또는 "조직 계정"

#### 3단계: 조직 계정으로 전환

**옵션 A: 기존 계정을 조직 계정으로 업그레이드**

1. **설정** → **계정 세부정보** → **계정 타입 변경**
2. 조직 정보 입력:
   - **조직명**: 회사명 또는 법인명 (예: "어트랙트 주식회사")
   - **사업자 등록번호**: 사업자 등록번호 또는 법인 등록번호
   - **주소**: 사업장 주소
   - **연락처**: 대표 전화번호
3. 신원 확인 서류 제출:
   - 사업자 등록증
   - 법인 등기부등본
   - 기타 신원 확인 서류
4. 검토 대기 (보통 1-3일 소요)

**옵션 B: 새 조직 계정 생성**

1. Google Play Console에서 **새 계정 만들기** 클릭
2. **조직 계정** 선택
3. 조직 정보 입력 및 검증

### 방법 2: 앱 카테고리 변경 (임시 해결책)

조직 계정 전환이 어려운 경우, 앱 카테고리를 변경할 수 있습니다:

1. **앱 콘텐츠** → **앱 카테고리** 이동
2. 현재 카테고리 확인:
   - 소셜 (Social)
   - 데이트 (Dating)
3. 다른 카테고리로 변경:
   - **라이프스타일** (Lifestyle)
   - **엔터테인먼트** (Entertainment)
   - **생산성** (Productivity)

**주의**: 카테고리를 변경하면 앱 설명과 기능도 그에 맞게 수정해야 할 수 있습니다.

### 방법 3: 조직 계정 요구사항 확인

조직 계정으로 전환하려면 다음 정보가 필요합니다:

#### 필수 정보

1. **조직명**
   - 회사명 또는 법인명
   - 예: "어트랙트 주식회사", "Attract Co., Ltd."

2. **사업자 등록번호**
   - 사업자 등록증 또는 법인 등기부등본

3. **주소**
   - 사업장 주소 (법인 주소)

4. **연락처**
   - 대표 전화번호
   - 이메일 주소

5. **신원 확인 서류**
   - 사업자 등록증
   - 법인 등기부등본
   - 대표자 신분증

#### 선택 정보

- 세금 정보 (미국 앱의 경우)
- 결제 계정 정보

## 📝 단계별 가이드

### 1단계: 사업자 등록

아직 사업자 등록을 하지 않았다면:

1. **개인사업자**: 세무서에서 사업자 등록
2. **법인**: 법원에서 법인 설립

### 2단계: Google Play Console 조직 계정 신청

1. [Google Play Console](https://play.google.com/console/) 접속
2. **설정** → **계정 세부정보** 이동
3. **조직 계정으로 업그레이드** 클릭
4. 필요한 정보 입력:
   - 조직명
   - 사업자 등록번호
   - 주소
   - 연락처
5. 신원 확인 서류 업로드
6. 제출 및 검토 대기

### 3단계: 검토 완료 후

1. 조직 계정 승인 확인
2. 앱 정보 업데이트
3. 앱 제출 재시도

## ⚠️ 주의사항

### 개인 계정의 제한사항

- 소셜/데이트 앱 배포 불가
- 일부 고급 기능 사용 제한
- 광고 수익 정산 제한

### 조직 계정의 장점

- 모든 카테고리 앱 배포 가능
- 더 많은 기능 사용 가능
- 사업자 세금 처리 용이
- 팀 멤버 관리 가능

## 🔄 대안

조직 계정 전환이 어려운 경우:

### 1. 카테고리 변경

앱 카테고리를 **라이프스타일** 또는 **엔터테인먼트**로 변경:

1. Google Play Console → **앱 콘텐츠** → **앱 카테고리**
2. 카테고리 변경
3. 앱 설명도 카테고리에 맞게 수정

### 2. 기능 선언 조정

앱 기능 선언에서 소셜/데이트 관련 기능을 제거하거나 완화:

1. **앱 콘텐츠** → **앱 액세스** → **앱 기능**
2. 소셜/데이트 관련 기능 선언 확인
3. 필요시 조정

## 📞 지원

문제가 계속되면:

1. **Google Play Console 지원팀**에 문의
2. **Google Play 정책 센터** 확인:
   - https://support.google.com/googleplay/android-developer/answer/9888179

## ✅ 체크리스트

- [ ] 현재 계정 타입 확인 (개인/조직)
- [ ] 조직 계정 전환 필요 여부 확인
- [ ] 사업자 등록 완료
- [ ] 조직 정보 준비 (이름, 주소, 연락처)
- [ ] 신원 확인 서류 준비
- [ ] Google Play Console에서 조직 계정 신청
- [ ] 검토 완료 대기
- [ ] 앱 제출 재시도

---

## 📚 참고 자료

- [Google Play Console 도움말](https://support.google.com/googleplay/android-developer)
- [조직 계정 요구사항](https://support.google.com/googleplay/android-developer/answer/6112435)
- [앱 카테고리 가이드](https://support.google.com/googleplay/android-developer/answer/113469)

