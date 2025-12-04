# 🎯 Attract-web 시스템 로직 문서

> 전체 시스템이 어떻게 작동하는지 상세하게 설명합니다.

---

## 📋 목차

1. [시스템 개요](#시스템-개요)
2. [데이터베이스 구조](#데이터베이스-구조)
3. [인증 시스템](#인증-시스템)
4. [매칭 시스템](#매칭-시스템)
5. [채팅 시스템](#채팅-시스템)
6. [알림 시스템](#알림-시스템)
7. [코인 시스템](#코인-시스템)
8. [커뮤니티 시스템](#커뮤니티-시스템)
9. [프로필 시스템](#프로필-시스템)

---

## 🎯 시스템 개요

Attract-web은 대학생 매칭 플랫폼으로, 다음과 같은 핵심 기능을 제공합니다:

- ✅ Firebase 전화번호 인증
- ✅ Supabase 데이터베이스
- ✅ 자석(코인) 기반 매칭 시스템
- ✅ 실시간 채팅
- ✅ 푸시 알림 (FCM)
- ✅ MBTI 궁합 분석
- ✅ 커뮤니티 게시판

---

## 🗄️ 데이터베이스 구조

### 주요 테이블

#### 1. `users` (사용자 테이블)
```sql
- id: UUID (Primary Key)
- phone_number: TEXT (UNIQUE, 전화번호)
- password_hash: TEXT (해시된 비밀번호)
- name: TEXT (이름)
- age: INTEGER (나이)
- gender: TEXT (성별)
- location: TEXT (지역)
- school: TEXT (학교)
- mbti: TEXT (MBTI 유형)
- profile_image: TEXT (프로필 이미지 URL)
- coins: INTEGER (자석 보유량, 기본값 100)
- profile_completed: BOOLEAN (프로필 완성 여부)
- created_at: TIMESTAMP
- last_login: TIMESTAMP
```

#### 2. `matching_requests` (매칭 요청 테이블)
```sql
- id: BIGSERIAL (Primary Key)
- from_user_id: TEXT (요청 보낸 사용자 ID)
- to_user_id: TEXT (요청 받는 사용자 ID)
- status: TEXT (상태: pending/accepted/rejected/expired)
- created_at: TIMESTAMP
```

#### 3. `chat_rooms` (채팅방 테이블)
```sql
- id: UUID (Primary Key)
- user1_id: TEXT (사용자 1 ID)
- user2_id: TEXT (사용자 2 ID)
- created_at: TIMESTAMP
- last_message: TEXT (마지막 메시지)
- last_message_at: TIMESTAMP
```

#### 4. `messages` (메시지 테이블)
```sql
- id: UUID (Primary Key)
- chat_room_id: UUID (채팅방 ID)
- sender_id: TEXT (발신자 ID)
- message: TEXT (메시지 내용)
- read: BOOLEAN (읽음 여부)
- created_at: TIMESTAMP
```

#### 5. `notifications` (알림 테이블)
```sql
- id: UUID (Primary Key)
- user_id: TEXT (수신자 ID)
- type: TEXT (알림 유형: match_request/match_success/message/refund/system)
- title: TEXT (알림 제목)
- message: TEXT (알림 내용)
- data: JSONB (추가 데이터)
- read: BOOLEAN (읽음 여부)
- created_at: TIMESTAMP
```

#### 6. `posts` (게시글 테이블)
```sql
- id: UUID (Primary Key)
- author_id: TEXT (작성자 ID)
- content: TEXT (게시글 내용)
- images: TEXT[] (이미지 URL 배열)
- likes_count: INTEGER (좋아요 수)
- comments_count: INTEGER (댓글 수)
- created_at: TIMESTAMP
```

---

## 🔐 인증 시스템

### 회원가입 플로우

```
1. 사용자가 전화번호 입력
   ↓
2. Firebase Authentication에 전화번호 인증 요청
   → reCAPTCHA 검증
   → SMS 인증번호 발송
   ↓
3. 사용자가 6자리 인증번호 입력 (3분 제한)
   ↓
4. Firebase에서 인증 확인
   ↓
5. 사용자 정보 입력 (이름, 나이, 성별, 비밀번호)
   ↓
6. 비밀번호 해싱 (SHA-256)
   ↓
7. Supabase users 테이블에 INSERT 쿼리
   → INSERT INTO users (phone_number, password_hash, name, age, gender)
   ↓
8. AuthContext에 사용자 정보 저장
   → localStorage에 'auth_user' 저장
   ↓
9. 홈 화면으로 이동
```

**관련 파일:**
- `src/pages/login/page.tsx` (회원가입 UI)
- `src/services/phoneAuth.ts` (Firebase 인증)
- `src/services/passwordService.ts` (비밀번호 해싱)
- `src/contexts/AuthContext.tsx` (인증 상태 관리)

**데이터베이스 쿼리:**
```typescript
// 회원가입 시
await supabase.from('users').insert({
  phone_number: cleanPhoneNumber,
  password_hash: hashedPassword,
  name: userData.name,
  age: userData.age,
  gender: userData.gender
});
```

---

### 로그인 플로우

```
1. 사용자가 전화번호와 비밀번호 입력
   ↓
2. 전화번호로 users 테이블 조회
   → SELECT * FROM users WHERE phone_number = ?
   ↓
3. 입력된 비밀번호 해싱
   ↓
4. DB의 password_hash와 비교
   ↓
5. 일치하면 로그인 성공
   → last_login 업데이트
   → AuthContext에 사용자 정보 저장
   ↓
6. profile_completed 확인
   → false면 프로필 완성 페이지로
   → true면 홈 화면으로
```

**데이터베이스 쿼리:**
```typescript
// 로그인 시
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('phone_number', cleanPhoneNumber)
  .single();

// 마지막 로그인 시간 업데이트
await supabase
  .from('users')
  .update({ last_login: new Date().toISOString() })
  .eq('id', userId);
```

---

## 💕 매칭 시스템

### 매칭 요청 플로우

```
1. 사용자가 프로필 상세 화면에서 하트 버튼 클릭
   ↓
2. 코인 확인 모달 표시 (자석 50개 필요)
   ↓
3. "확인" 버튼 클릭
   ↓
4. users 테이블에서 현재 코인 조회
   → SELECT coins FROM users WHERE id = ?
   ↓
5. 코인이 50개 이상이면 진행
   ↓
6. 상호 매칭 체크: 상대방이 나에게도 요청을 보냈는지 확인
   → SELECT * FROM matching_requests
     WHERE from_user_id = 상대방ID
     AND to_user_id = 내ID
     AND status = 'pending'
   ↓
7-A. 상호 매칭이 아닌 경우:
   → 코인 50개 차감
     UPDATE users SET coins = coins - 50 WHERE id = 내ID
   → matching_requests에 INSERT
     INSERT INTO matching_requests (from_user_id, to_user_id, status)
     VALUES (내ID, 상대방ID, 'pending')
   → 상대방에게 알림 전송
     INSERT INTO notifications (user_id, type, title, message)
   → FCM 푸시 알림 발송
   ↓
7-B. 상호 매칭인 경우 (매칭 성사!):
   → 코인 50개 차감
   → matching_requests에 INSERT (status: 'accepted')
   → 상대방의 요청도 'accepted'로 업데이트
     UPDATE matching_requests SET status = 'accepted'
     WHERE from_user_id = 상대방ID AND to_user_id = 내ID
   → chat_rooms 테이블에 채팅방 생성
     INSERT INTO chat_rooms (user1_id, user2_id)
     VALUES (내ID, 상대방ID)
   → 양쪽에 매칭 성사 알림
   → FCM 푸시 알림 발송
   → 매칭 성공 모달 표시
```

**관련 파일:**
- `src/pages/profile-detail/page.tsx` (프로필 상세 및 매칭 요청)
- `src/pages/matching-requests/page.tsx` (매칭 요청 관리)
- `src/services/matchingService.ts` (매칭 로직)
- `src/services/fcmService.ts` (푸시 알림)

**핵심 쿼리:**
```typescript
// 1. 코인 차감
await supabase
  .from('users')
  .update({ coins: userCoins - 50 })
  .eq('id', authUser.id);

// 2. 매칭 요청 저장
await supabase
  .from('matching_requests')
  .insert({
    from_user_id: String(authUser.id),
    to_user_id: String(profile.id),
    status: isMutualMatch ? 'accepted' : 'pending'
  });

// 3. 상호 매칭 시 채팅방 생성
await supabase
  .from('chat_rooms')
  .insert({
    user1_id: String(authUser.id),
    user2_id: String(profile.id),
    created_at: new Date().toISOString()
  });
```

---

### 매칭 요청 수락 플로우

```
1. 사용자가 "받은 요청" 탭에서 수락 버튼 클릭
   ↓
2. 수락 확인 모달 표시 (자석 50개 소모 안내)
   ↓
3. "수락" 버튼 클릭
   ↓
4. 현재 코인 조회
   → SELECT coins FROM users WHERE id = ?
   ↓
5. 코인 50개 차감
   → UPDATE users SET coins = coins - 50 WHERE id = ?
   ↓
6. 매칭 요청 상태를 'accepted'로 변경
   → UPDATE matching_requests SET status = 'accepted' WHERE id = ?
   ↓
7. 상대방도 나에게 요청을 보냈는지 확인 후 업데이트
   → UPDATE matching_requests SET status = 'accepted'
     WHERE from_user_id = 상대방ID AND to_user_id = 내ID
   ↓
8. chat_rooms 테이블에 채팅방 생성 (중복 체크)
   → 먼저 기존 채팅방 확인:
     SELECT * FROM chat_rooms
     WHERE (user1_id = 내ID AND user2_id = 상대방ID)
        OR (user1_id = 상대방ID AND user2_id = 내ID)
   → 없으면 생성:
     INSERT INTO chat_rooms (user1_id, user2_id)
   ↓
9. 채팅 탭으로 이동 (Custom Event 발생)
```

**핵심 쿼리:**
```typescript
// 채팅방 중복 체크
const { data: existingRoom } = await supabase
  .from('chat_rooms')
  .select('id')
  .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${currentUserId})`)
  .single();

// 채팅방 생성
if (!existingRoom) {
  await supabase.from('chat_rooms').insert({
    user1_id: currentUserId,
    user2_id: otherUserId,
    created_at: new Date().toISOString()
  });
}
```

---

### 매칭 요청 거절 플로우

```
1. 사용자가 "받은 요청" 탭에서 거절 버튼 클릭
   ↓
2. 매칭 요청 상태를 'rejected'로 변경
   → UPDATE matching_requests SET status = 'rejected' WHERE id = ?
   ↓
3. 요청 보낸 사람의 코인 환불 (50개)
   → SELECT coins FROM users WHERE id = 요청자ID
   → UPDATE users SET coins = coins + 50 WHERE id = 요청자ID
   ↓
4. 환불 알림 전송
   → INSERT INTO notifications (user_id, type, title, message)
     VALUES (요청자ID, 'refund', '자석 환불 💎', '매칭 요청이 거절되어 자석 50개가 환불되었습니다.')
   ↓
5. 요청 목록 새로고침
```

---

### 매칭 요청 자동 만료

```
1. 사용자가 "매칭 관리" 페이지 열람
   ↓
2. loadRequests() 함수 호출
   ↓
3. 받은/보낸 요청 조회
   → SELECT * FROM matching_requests WHERE ...
   ↓
4. processExpiredRequests() 실행
   ↓
5. 각 pending 요청의 created_at 확인
   → 현재 시간 - created_at > 24시간?
   ↓
6. 만료된 요청 처리:
   → UPDATE matching_requests SET status = 'expired' WHERE id = ?
   → 요청자에게 코인 환불 (50개)
   → 환불 알림 전송
   ↓
7. 만료 처리가 있었다면 목록 재조회
```

**자동 만료 로직:**
```typescript
const now = new Date();
const createdAt = new Date(req.created_at);
const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

if (hoursDiff >= 24) {
  // 만료 처리
  await supabase
    .from('matching_requests')
    .update({ status: 'expired' })
    .eq('id', req.id);

  // 코인 환불
  await supabase
    .from('users')
    .update({ coins: (senderData.coins || 0) + 50 })
    .eq('id', senderId);
}
```

---

## 💬 채팅 시스템

### 채팅 목록 로드 플로우

```
1. 사용자가 홈 화면의 "채팅" 탭 클릭
   ↓
2. chat_rooms 테이블 조회
   → SELECT * FROM chat_rooms
     WHERE user1_id = 내ID OR user2_id = 내ID
     ORDER BY last_message_at DESC
   ↓
3. 각 채팅방의 상대방 정보 조회
   → SELECT id, name, profile_image FROM users WHERE id IN (...)
   ↓
4. 각 채팅방의 마지막 메시지 조회
   → SELECT * FROM messages
     WHERE chat_room_id = ?
     ORDER BY created_at DESC
     LIMIT 1
   ↓
5. 안 읽은 메시지 개수 조회
   → SELECT COUNT(*) FROM messages
     WHERE chat_room_id = ?
     AND sender_id != 내ID
     AND read = false
   ↓
6. 채팅 목록 렌더링
```

**관련 파일:**
- `src/pages/home/components/ChatTab.tsx`

---

### 채팅 메시지 전송 플로우

```
1. 사용자가 메시지 입력 후 전송 버튼 클릭
   ↓
2. messages 테이블에 INSERT
   → INSERT INTO messages (chat_room_id, sender_id, message, read)
     VALUES (채팅방ID, 내ID, '메시지 내용', false)
   ↓
3. chat_rooms 테이블의 last_message 업데이트
   → UPDATE chat_rooms
     SET last_message = '메시지 내용',
         last_message_at = NOW()
     WHERE id = 채팅방ID
   ↓
4. 상대방에게 알림 전송
   → INSERT INTO notifications (user_id, type, title, message)
   ↓
5. FCM 푸시 알림 발송
   ↓
6. 실시간 구독 (Supabase Realtime)
   → 상대방 화면에 즉시 표시
```

---

### 채팅 실시간 구독

```
1. 채팅방 입장 시 Supabase Realtime 구독 시작
   ↓
2. supabase.channel() 생성
   ↓
3. messages 테이블 변경 감지
   → .on('postgres_changes', {
       event: 'INSERT',
       schema: 'public',
       table: 'messages',
       filter: `chat_room_id=eq.${chatRoomId}`
     })
   ↓
4. 새 메시지 수신 시 콜백 실행
   → 메시지 목록에 추가
   → 스크롤 맨 아래로 이동
   ↓
5. 채팅방 나갈 때 구독 해제
   → channel.unsubscribe()
```

**실시간 구독 코드:**
```typescript
const channel = supabase
  .channel(`chat:${chatRoomId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `chat_room_id=eq.${chatRoomId}`
  }, (payload) => {
    setMessages(prev => [...prev, payload.new]);
  })
  .subscribe();
```

---

## 🔔 알림 시스템

### 알림 생성 플로우

```
1. 특정 이벤트 발생 (매칭 요청, 메시지 등)
   ↓
2. notifications 테이블에 INSERT
   → INSERT INTO notifications (
       user_id,
       type,
       title,
       message,
       data,
       read
     ) VALUES (?, ?, ?, ?, ?, false)
   ↓
3. FCM 푸시 알림 발송 (fcmService.ts)
   → 사용자의 fcm_token 조회
   → Firebase Cloud Messaging API 호출
   ↓
4. 사용자 기기에 푸시 알림 표시
```

**알림 유형:**
- `match_request`: 누군가가 매칭 요청을 보냄
- `match_success`: 매칭 성사
- `message`: 새 메시지 도착
- `refund`: 코인 환불
- `system`: 시스템 공지

**푸시 알림 전송:**
```typescript
// FCM 토큰 조회
const { data: userData } = await supabase
  .from('users')
  .select('fcm_token')
  .eq('id', userId)
  .single();

// FCM 메시지 전송
await fetch('https://fcm.googleapis.com/fcm/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `key=${FCM_SERVER_KEY}`
  },
  body: JSON.stringify({
    to: fcmToken,
    notification: { title, body },
    data: { ...additionalData }
  })
});
```

---

### 알림 조회 플로우

```
1. 사용자가 알림 페이지 열람
   ↓
2. notifications 테이블 조회
   → SELECT * FROM notifications
     WHERE user_id = 내ID
     ORDER BY created_at DESC
     LIMIT 50
   ↓
3. 알림 목록 렌더링
   ↓
4. 사용자가 알림 클릭
   ↓
5. read = true로 업데이트
   → UPDATE notifications SET read = true WHERE id = ?
   ↓
6. 알림 타입에 따라 화면 이동
   - match_request → 매칭 관리 페이지
   - match_success → 채팅방
   - message → 채팅방
```

---

## 💎 코인 시스템

### 코인 지급/차감 이벤트

| 이벤트 | 변화량 | 타이밍 |
|--------|--------|--------|
| 회원가입 | +100 | 최초 가입 시 |
| 매칭 요청 보내기 | -50 | 하트 버튼 클릭 시 |
| 매칭 요청 수락 | -50 | 수락 버튼 클릭 시 |
| 매칭 요청 거절됨 | +50 | 상대방이 거절 시 자동 환불 |
| 매칭 요청 만료 | +50 | 24시간 경과 시 자동 환불 |
| 코인 구매 | +N | 결제 완료 시 |

**코인 조회:**
```typescript
const { data } = await supabase
  .from('users')
  .select('coins')
  .eq('id', userId)
  .single();
```

**코인 차감:**
```typescript
await supabase
  .from('users')
  .update({ coins: currentCoins - amount })
  .eq('id', userId);
```

---

## 📝 커뮤니티 시스템

### 게시글 작성 플로우

```
1. 사용자가 "글쓰기" 버튼 클릭
   ↓
2. 게시글 작성 화면으로 이동
   ↓
3. 텍스트 입력 및 이미지 업로드 (선택)
   ↓
4. "게시" 버튼 클릭
   ↓
5. 이미지가 있으면 Supabase Storage에 업로드
   → supabase.storage.from('posts').upload()
   → 공개 URL 생성
   ↓
6. posts 테이블에 INSERT
   → INSERT INTO posts (author_id, content, images)
     VALUES (내ID, '게시글 내용', ARRAY['이미지URL1', '이미지URL2'])
   ↓
7. 커뮤니티 피드로 이동
```

**관련 파일:**
- `src/pages/post/create.tsx`
- `src/services/imageUpload.ts`

---

### 게시글 목록 로드 플로우

```
1. 사용자가 "커뮤니티" 탭 클릭
   ↓
2. posts 테이블 조회 (최신순)
   → SELECT * FROM posts
     ORDER BY created_at DESC
     LIMIT 20
   ↓
3. 각 게시글의 작성자 정보 조회
   → SELECT id, name, profile_image FROM users
     WHERE id IN (게시글 작성자 IDs)
   ↓
4. 각 게시글의 댓글 수 조회
   → SELECT post_id, COUNT(*) FROM comments
     WHERE post_id IN (게시글 IDs)
     GROUP BY post_id
   ↓
5. 게시글 목록 렌더링
   ↓
6. 무한 스크롤: 하단 도달 시 다음 20개 로드
```

---

## 👤 프로필 시스템

### 프로필 조회 플로우

```
1. 사용자가 프로필 카드 클릭
   ↓
2. /profile-detail 페이지로 이동 (state로 프로필 데이터 전달)
   ↓
3. 로그인 여부 확인
   - 비로그인 → 로그인 모달 표시 (프로필 블러 처리)
   - 로그인 → 프로필 표시
   ↓
4. 프로필 정보 렌더링:
   - 기본 정보 (이름, 나이, 지역, 학교 등)
   - MBTI 정보
   - 자기소개
   - 관심사
   ↓
5. MBTI 궁합 버튼 클릭 시:
   → 내 MBTI와 상대방 MBTI 비교
   → analyzeMBTICompatibility() 함수 호출
   → 궁합 점수, 장점, 주의점 표시
```

**프로필 데이터 전달:**
```typescript
navigate('/profile-detail', {
  state: {
    profile: {
      id, name, age, gender, location,
      school, mbti, bio, photos, ...
    }
  }
});
```

---

### 프로필 수정 플로우

```
1. 사용자가 "프로필 설정" 클릭
   ↓
2. users 테이블에서 현재 정보 조회
   → SELECT * FROM users WHERE id = 내ID
   ↓
3. 폼에 현재 정보 표시
   ↓
4. 사용자가 정보 수정
   ↓
5. 프로필 이미지 변경 시:
   → Supabase Storage 'avatars' 버킷에 업로드
   → 공개 URL 생성
   ↓
6. "저장" 버튼 클릭
   ↓
7. users 테이블 UPDATE
   → UPDATE users SET
       name = ?,
       age = ?,
       gender = ?,
       location = ?,
       school = ?,
       mbti = ?,
       bio = ?,
       profile_image = ?
     WHERE id = 내ID
   ↓
8. profile_completed = true로 변경 (최초 작성 시)
   ↓
9. AuthContext 업데이트
   ↓
10. 프로필 페이지로 이동
```

---

## 🔄 화면별 데이터 로드 시나리오

### 홈 화면 (`/`)

```
화면 열림
   ↓
1. 채팅 탭 (기본):
   → chat_rooms 테이블 조회
   → 각 채팅방의 상대방 정보 조회
   → 마지막 메시지 조회
   → 안 읽은 메시지 수 조회
   ↓
2. 매칭 탭:
   → users 테이블에서 추천 사용자 목록 조회
   → 현재 사용자와 다른 성별, 비슷한 나이대
   ↓
3. 커뮤니티 탭:
   → posts 테이블에서 최신 게시글 조회
   → 각 게시글의 작성자 정보 조회
   ↓
4. 프로필 탭:
   → users 테이블에서 내 정보 조회
   → 내가 받은 좋아요 수 조회
```

### 매칭 관리 화면 (`/matching-requests`)

```
화면 열림
   ↓
1. 받은 요청 조회:
   → SELECT * FROM matching_requests
     WHERE to_user_id = 내ID
     AND status = 'pending'
     ORDER BY created_at DESC
   ↓
2. 보낸 요청 조회:
   → SELECT * FROM matching_requests
     WHERE from_user_id = 내ID
     ORDER BY created_at DESC
   ↓
3. 24시간 이상 경과한 pending 요청 찾기
   ↓
4. 만료된 요청 자동 처리:
   → status를 'expired'로 변경
   → 코인 환불
   → 환불 알림 전송
   ↓
5. 각 요청의 상대방 정보 조회:
   → SELECT id, name, age, gender, location, school, mbti, bio, profile_image
     FROM users
     WHERE id IN (요청자 IDs)
   ↓
6. 요청 목록 렌더링
```

### 알림 화면 (`/notifications`)

```
화면 열림
   ↓
1. notifications 테이블 조회:
   → SELECT * FROM notifications
     WHERE user_id = 내ID
     ORDER BY created_at DESC
     LIMIT 50
   ↓
2. 안 읽은 알림 개수 계산
   ↓
3. 알림 목록 렌더링
   ↓
4. 사용자가 알림 클릭 시:
   → UPDATE notifications SET read = true WHERE id = ?
   → 타입에 따라 해당 화면으로 이동
```

---

## 🎨 성능 최적화

### 1. 이미지 최적화
```typescript
// lazy loading 적용
<img loading="lazy" decoding="async" src={imageUrl} />

// 이미지 URL 최적화
const optimizedUrl = optimizeImageUrl(url, 400, 80);
```

### 2. 데이터베이스 쿼리 최적화
```typescript
// 한 번의 쿼리로 여러 사용자 정보 조회
const { data: usersData } = await supabase
  .from('users')
  .select('id, name, profile_image')
  .in('id', userIds);

// 인덱스 활용
// - matching_requests (from_user_id, to_user_id, status)
// - chat_rooms (user1_id, user2_id)
```

### 3. 실시간 구독 최적화
```typescript
// 채팅방 나갈 때 반드시 구독 해제
useEffect(() => {
  const channel = supabase.channel(`chat:${chatRoomId}`)...

  return () => {
    channel.unsubscribe();
  };
}, [chatRoomId]);
```

---

## 🚀 배포 및 운영

### 환경 변수 설정
```bash
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# Firebase
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
```

### 빌드 및 배포
```bash
# 빌드
npm run build

# 프리뷰
npm run preview

# 배포 (Vercel/Netlify)
vercel --prod
```

---

## 📚 추가 문서

- [Firebase 전화번호 인증 설정](./FIREBASE_PHONE_AUTH_SETUP.md)
- [Supabase Storage 설정](./STORAGE_SETUP.md)
- [FCM 푸시 알림 설정](./NOTIFICATION-SETUP.md)
- [이미지 업로드 가이드](./IMAGE-UPLOAD-GUIDE.md)

---

## 🛠️ 트러블슈팅

### 매칭 요청이 표시되지 않을 때
```
1. matching_requests 테이블의 from_user_id, to_user_id 타입 확인
   → TEXT 타입이어야 함
2. users.id와 타입 불일치 시 String() 변환 필요
3. 24시간 자동 만료 확인
```

### 채팅방이 생성되지 않을 때
```
1. chat_rooms 테이블의 user1_id, user2_id 타입 확인
2. 매칭 수락 로직에서 채팅방 생성 코드 확인
3. 중복 체크 쿼리 확인
```

### 푸시 알림이 오지 않을 때
```
1. FCM 토큰이 users 테이블에 저장되었는지 확인
2. Firebase Cloud Messaging API 키 확인
3. 사용자 기기의 알림 권한 확인
```

---

**최종 업데이트:** 2025-12-04
**작성자:** Claude AI
**버전:** 1.0.0
