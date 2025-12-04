-- ============================================
-- 채팅방 시스템 업데이트 스키마
-- 기존 테이블 구조에 맞게 수정됨
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- ============================================
-- 1. messages 테이블에 room_id 컬럼 추가
-- ============================================

-- room_id 컬럼 추가 (chat_rooms와 연결)
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE;

-- room_id 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages(room_id);

-- ============================================
-- 2. chat_rooms 테이블에 추가 컬럼
-- ============================================

-- 마지막 메시지 발신자 컬럼 추가
ALTER TABLE public.chat_rooms 
ADD COLUMN IF NOT EXISTS last_message_sender_id text;

-- 활성화 상태 컬럼 추가
ALTER TABLE public.chat_rooms 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 매칭 요청 참조 컬럼 추가
ALTER TABLE public.chat_rooms 
ADD COLUMN IF NOT EXISTS matching_request_id uuid REFERENCES public.matching_requests(id) ON DELETE SET NULL;

-- ============================================
-- 3. RLS 정책 설정
-- ============================================

-- chat_rooms RLS 활성화
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있으면)
DROP POLICY IF EXISTS "Users can view own chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "System can create chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Participants can update chat rooms" ON public.chat_rooms;

-- 사용자는 자신이 참여한 채팅방만 볼 수 있음
CREATE POLICY "Users can view own chat rooms"
  ON public.chat_rooms FOR SELECT
  USING (user1_id = auth.uid()::text OR user2_id = auth.uid()::text);

-- 채팅방 생성 허용
CREATE POLICY "System can create chat rooms"
  ON public.chat_rooms FOR INSERT
  WITH CHECK (true);

-- 참여자는 채팅방 업데이트 가능
CREATE POLICY "Participants can update chat rooms"
  ON public.chat_rooms FOR UPDATE
  USING (user1_id = auth.uid()::text OR user2_id = auth.uid()::text);

-- ============================================
-- 4. messages RLS 정책 업데이트
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Chat room participants can view messages" ON public.messages;
DROP POLICY IF EXISTS "Chat room participants can send messages" ON public.messages;
DROP POLICY IF EXISTS "Recipients can update message read status" ON public.messages;

-- 새 정책: 채팅방 참여자만 메시지 조회 가능
CREATE POLICY "Chat room participants can view messages"
  ON public.messages FOR SELECT
  USING (
    -- room_id가 있는 경우: 채팅방 참여자만
    (room_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.chat_rooms cr
      WHERE cr.id = room_id
      AND (cr.user1_id = auth.uid()::text OR cr.user2_id = auth.uid()::text)
    ))
    OR
    -- room_id가 없는 경우: 기존 방식 (발신자/수신자)
    (room_id IS NULL AND (sender_id = auth.uid() OR recipient_id = auth.uid()))
  );

-- 새 정책: 채팅방 참여자만 메시지 전송 가능
CREATE POLICY "Chat room participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    -- room_id가 있는 경우: 활성 채팅방 참여자만
    (room_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.chat_rooms cr
      WHERE cr.id = room_id
      AND cr.is_active = true
      AND (cr.user1_id = auth.uid()::text OR cr.user2_id = auth.uid()::text)
    ))
    OR
    -- room_id가 없는 경우: 기존 방식 허용
    room_id IS NULL
  );

-- 새 정책: 메시지 읽음 처리
CREATE POLICY "Recipients can update message read status"
  ON public.messages FOR UPDATE
  USING (recipient_id = auth.uid());

-- ============================================
-- 5. 매칭 수락 시 자동 채팅방 생성 트리거
-- ============================================

-- 채팅방 생성 함수
CREATE OR REPLACE FUNCTION public.create_chat_room_on_match_accepted()
RETURNS TRIGGER AS $$
DECLARE
  new_room_id uuid;
  smaller_id text;
  larger_id text;
BEGIN
  -- 매칭이 수락된 경우에만 실행
  IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status = 'pending') THEN
    
    -- 일관성을 위해 ID를 정렬 (중복 방지)
    IF NEW.from_user_id < NEW.to_user_id THEN
      smaller_id := NEW.from_user_id;
      larger_id := NEW.to_user_id;
    ELSE
      smaller_id := NEW.to_user_id;
      larger_id := NEW.from_user_id;
    END IF;
    
    -- 이미 채팅방이 있는지 확인
    SELECT id INTO new_room_id
    FROM public.chat_rooms
    WHERE (user1_id = smaller_id AND user2_id = larger_id)
       OR (user1_id = larger_id AND user2_id = smaller_id);
    
    -- 채팅방이 없으면 새로 생성
    IF new_room_id IS NULL THEN
      INSERT INTO public.chat_rooms (user1_id, user2_id, matching_request_id, is_active)
      VALUES (smaller_id, larger_id, NEW.id, true)
      RETURNING id INTO new_room_id;
      
      RAISE NOTICE '새 채팅방 생성됨: room_id=%, user1=%, user2=%', new_room_id, smaller_id, larger_id;
    ELSE
      -- 기존 채팅방이 있으면 활성화
      UPDATE public.chat_rooms
      SET is_active = true, matching_request_id = NEW.id
      WHERE id = new_room_id;
      
      RAISE NOTICE '기존 채팅방 재활성화: room_id=%', new_room_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS on_match_accepted_create_chat_room ON public.matching_requests;
DROP TRIGGER IF EXISTS on_match_insert_create_chat_room ON public.matching_requests;

-- 트리거 생성 (매칭 상태 변경 시)
CREATE TRIGGER on_match_accepted_create_chat_room
  AFTER UPDATE ON public.matching_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.create_chat_room_on_match_accepted();

-- INSERT 시에도 트리거
CREATE TRIGGER on_match_insert_create_chat_room
  AFTER INSERT ON public.matching_requests
  FOR EACH ROW
  WHEN (NEW.status = 'accepted')
  EXECUTE FUNCTION public.create_chat_room_on_match_accepted();

-- ============================================
-- 6. 메시지 전송 시 채팅방 last_message 업데이트
-- ============================================

CREATE OR REPLACE FUNCTION public.update_chat_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
  -- 채팅방의 마지막 메시지 정보 업데이트
  IF NEW.room_id IS NOT NULL THEN
    UPDATE public.chat_rooms
    SET 
      last_message = NEW.content,
      last_message_at = NEW.created_at,
      last_message_sender_id = NEW.sender_id::text
    WHERE id = NEW.room_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_update_chat_room ON public.messages;
CREATE TRIGGER on_message_update_chat_room
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_room_last_message();

-- ============================================
-- 7. 유용한 헬퍼 함수들
-- ============================================

-- 두 사용자 간의 채팅방 조회 (없으면 NULL)
CREATE OR REPLACE FUNCTION public.get_chat_room_between_users(p_user1_id text, p_user2_id text)
RETURNS uuid AS $$
DECLARE
  room_id uuid;
BEGIN
  SELECT id INTO room_id
  FROM public.chat_rooms
  WHERE ((user1_id = p_user1_id AND user2_id = p_user2_id)
     OR (user1_id = p_user2_id AND user2_id = p_user1_id))
  AND is_active = true;
  
  RETURN room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자의 채팅방 목록 조회
CREATE OR REPLACE FUNCTION public.get_user_chat_rooms(p_user_id text)
RETURNS TABLE (
  room_id uuid,
  partner_id text,
  partner_name text,
  partner_avatar text,
  partner_gender text,
  last_message text,
  last_message_at timestamp with time zone,
  is_last_message_mine boolean,
  unread_count bigint,
  created_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id as room_id,
    CASE WHEN cr.user1_id = p_user_id THEN cr.user2_id ELSE cr.user1_id END as partner_id,
    u.name as partner_name,
    u.profile_image as partner_avatar,
    u.gender as partner_gender,
    cr.last_message,
    cr.last_message_at,
    cr.last_message_sender_id = p_user_id as is_last_message_mine,
    COALESCE((
      SELECT COUNT(*) 
      FROM public.messages m 
      WHERE m.room_id = cr.id 
      AND m.recipient_id::text = p_user_id 
      AND m.is_read = false
    ), 0) as unread_count,
    cr.created_at
  FROM public.chat_rooms cr
  JOIN public.users u ON u.id::text = CASE 
    WHEN cr.user1_id = p_user_id THEN cr.user2_id 
    ELSE cr.user1_id 
  END
  WHERE (cr.user1_id = p_user_id OR cr.user2_id = p_user_id)
  AND cr.is_active = true
  ORDER BY COALESCE(cr.last_message_at, cr.created_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. Realtime 활성화
-- ============================================

-- chat_rooms 테이블 Realtime 활성화 (이미 있으면 에러 무시)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- ============================================
-- 완료!
-- ============================================
-- 
-- 이제 채팅 시스템이 다음과 같이 작동합니다:
-- 
-- 1. 매칭 요청 → 수락 → 자동으로 채팅방 생성
-- 2. 채팅방이 있는 사용자끼리만 메시지 주고받기 가능
-- 3. 메시지 전송 시 채팅방의 마지막 메시지 자동 업데이트
-- 
-- 테스트 방법:
-- SELECT * FROM get_user_chat_rooms('사용자-UUID');
-- SELECT get_chat_room_between_users('사용자1-UUID', '사용자2-UUID');
--

