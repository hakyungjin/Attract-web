# 알림 기능 설정 가이드

이 가이드는 Attract Web 프로젝트의 실시간 알림 기능을 설정하는 방법을 안내합니다.

## 개요

알림 기능은 다음과 같은 이벤트 발생 시 자동으로 알림을 생성합니다:
- 📝 **게시글 좋아요**: 내 게시글에 좋아요가 달릴 때
- 💬 **새 댓글**: 내 게시글에 댓글이 달릴 때
- 💕 **매칭 성공**: 매칭이 수락되었을 때
- 💌 **새 메시지**: 채팅에서 새 메시지를 받았을 때

## 설정 방법

### 1. SQL 실행

Supabase 대시보드에서 **SQL Editor**를 열고 `notification-triggers.sql` 파일의 전체 내용을 복사해서 실행하세요.

```bash
# 파일 위치
notification-triggers.sql
```

이 SQL은 다음을 생성합니다:
- `community_post_likes` 테이블 (좋아요 기록)
- 알림 자동 생성 함수 4개
- 트리거 4개 (좋아요, 댓글, 매칭, 메시지)

### 2. 실행 내용

#### 테이블
```sql
CREATE TABLE community_post_likes (
    id UUID PRIMARY KEY,
    post_id BIGINT REFERENCES community_posts(id),
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP
);
```

#### 트리거 함수
1. **notify_post_like()** - 게시글 좋아요 시 알림
2. **notify_new_comment()** - 댓글 작성 시 알림
3. **notify_match_accepted()** - 매칭 수락 시 알림
4. **notify_new_message()** - 메시지 전송 시 알림

#### RLS 정책
- 인증된 사용자만 좋아요 조회 가능
- 자신의 좋아요만 추가/삭제 가능

### 3. 알림 작동 방식

#### 좋아요 알림
```sql
-- 사용자가 게시글에 좋아요를 누르면
INSERT INTO community_post_likes (post_id, user_id) VALUES (...);
-- 👆 트리거 자동 실행 👇
INSERT INTO notifications (
    user_id,        -- 게시글 작성자
    type,           -- 'like'
    title,          -- '새로운 좋아요'
    content,        -- '누군가 회원님의 게시글을 좋아합니다.'
    link            -- '/post/123'
);
```

#### 댓글 알림
```sql
-- 사용자가 댓글을 작성하면
INSERT INTO post_comments (post_id, user_id, content) VALUES (...);
-- 👆 트리거 자동 실행 👇
INSERT INTO notifications (
    user_id,        -- 게시글 작성자
    type,           -- 'comment'
    title,          -- '새로운 댓글'
    content,        -- '홍길동님이 회원님의 게시글에 댓글을 남겼습니다.'
    link            -- '/post/123'
);
```

### 4. 프론트엔드 통합

알림을 표시하려면 다음 코드를 사용하세요:

```typescript
// 알림 목록 가져오기
const { data: notifications } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', currentUser.id)
  .eq('read', false)
  .order('created_at', { ascending: false });

// 알림 읽음 처리
await supabase
  .from('notifications')
  .update({ read: true })
  .eq('id', notificationId);

// 실시간 알림 구독 (선택사항)
const subscription = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${currentUser.id}`
    },
    (payload) => {
      console.log('새 알림:', payload.new);
      // UI 업데이트
    }
  )
  .subscribe();
```

## 테스트

### 1. 좋아요 알림 테스트
1. 사용자 A로 로그인하여 게시글 작성
2. 사용자 B로 로그인하여 A의 게시글에 좋아요
3. 사용자 A의 알림 확인 (헤더 종 아이콘)

### 2. 댓글 알림 테스트
1. 사용자 A로 로그인하여 게시글 작성
2. 사용자 B로 로그인하여 A의 게시글에 댓글 작성
3. 사용자 A의 알림 확인

### 3. SQL로 알림 확인
```sql
-- 특정 사용자의 알림 조회
SELECT * FROM notifications
WHERE user_id = 'user-uuid-here'
ORDER BY created_at DESC;

-- 읽지 않은 알림 개수
SELECT COUNT(*) FROM notifications
WHERE user_id = 'user-uuid-here'
AND read = false;
```

## 문제 해결

### 알림이 생성되지 않음
```sql
-- 트리거가 제대로 생성되었는지 확인
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

### 함수 오류
```sql
-- 함수 목록 확인
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE 'notify_%';
```

### RLS 정책 오류
```sql
-- community_post_likes 정책 확인
SELECT * FROM pg_policies
WHERE tablename = 'community_post_likes';
```

## 알림 타입

| 타입 | 설명 | 링크 |
|------|------|------|
| `like` | 게시글 좋아요 | `/post/{post_id}` |
| `comment` | 새 댓글 | `/post/{post_id}` |
| `match` | 매칭 성공 | `/chat` |
| `message` | 새 메시지 | `/chat/{match_id}` |

## 추가 기능 (선택사항)

### 알림 배치 제한
너무 많은 알림을 방지하려면:

```sql
-- 최근 1분 이내 같은 타입의 알림이 있는지 확인
CREATE OR REPLACE FUNCTION should_create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_link TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM notifications
        WHERE user_id = p_user_id
        AND type = p_type
        AND link = p_link
        AND created_at > NOW() - INTERVAL '1 minute'
    );
END;
$$ LANGUAGE plpgsql;
```

### 알림 자동 삭제
30일 이상 된 읽은 알림 자동 삭제:

```sql
-- 매일 실행하는 크론 작업 (Supabase Edge Functions)
DELETE FROM notifications
WHERE read = true
AND created_at < NOW() - INTERVAL '30 days';
```

## 완료!

이제 알림 시스템이 설정되었습니다. 사용자는 앱에서 실시간으로 알림을 받게 됩니다.
